import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildSignature, buildTimestamp, ShopeeApiError } from "./shopee-signature.ts";

const PARTNER_ID = parseInt(Deno.env.get("SHOPEE_PARTNER_ID") ?? "0", 10);
const BASE_URL = Deno.env.get("SHOPEE_BASE_URL") ?? "https://partner.shopeemobile.com";
const PARTNER_KEY = Deno.env.get("SHOPEE_PARTNER_KEY") ?? "";

export interface TokenRecord {
  access_token: string;
  refresh_token: string;
  shop_id: number;
  expires_at: string;
}

export function createSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
}

export async function upsertToken(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  userId: string,
  shopId: number,
  accessToken: string,
  refreshToken: string,
  expireIn: number,
): Promise<void> {
  const expiresAt = new Date(Date.now() + expireIn * 1000).toISOString();

  const { error } = await supabase.from("shopee_tokens").upsert(
    {
      user_id: userId,
      shop_id: shopId,
      access_token: accessToken,
      refresh_token: refreshToken,
      expire_in: expireIn,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,shop_id" },
  );

  if (error) throw new Error(`Failed to upsert token: ${error.message}`);
}

async function refreshAccessToken(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  userId: string,
  record: TokenRecord,
): Promise<string> {
  const apiPath = "/api/v2/auth/access_token/get";
  const timestamp = buildTimestamp();
  const sign = await buildSignature({ apiPath, timestamp });

  const params = new URLSearchParams({
    partner_id: String(PARTNER_ID),
    timestamp: String(timestamp),
    sign,
  });

  const response = await fetch(`${BASE_URL}${apiPath}?${params.toString()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      shop_id: record.shop_id,
      refresh_token: record.refresh_token,
      partner_id: PARTNER_ID,
    }),
  });

  const data = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expire_in?: number;
    error?: string;
    message?: string;
  };

  if (data.error && data.error !== "") {
    throw new ShopeeApiError(data.error, data.message ?? "Refresh failed", false);
  }

  if (!data.access_token || !data.refresh_token || !data.expire_in) {
    throw new Error("Refresh token response missing fields");
  }

  await upsertToken(
    supabase,
    userId,
    record.shop_id,
    data.access_token,
    data.refresh_token,
    data.expire_in,
  );

  return data.access_token;
}

export async function getValidToken(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  userId: string,
  shopId: number,
): Promise<{ accessToken: string; shopId: number }> {
  const { data, error } = await supabase
    .from("shopee_tokens")
    .select("access_token, refresh_token, shop_id, expires_at")
    .eq("user_id", userId)
    .eq("shop_id", shopId)
    .single();

  if (error || !data) {
    throw new Error(`No Shopee token found for shop ${shopId}. Please reconnect your store.`);
  }

  const record = data as TokenRecord;
  const expiresAt = new Date(record.expires_at).getTime();
  const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;

  // Proactively refresh if within 5 minutes of expiry
  if (expiresAt < fiveMinutesFromNow) {
    const freshToken = await refreshAccessToken(supabase, userId, record);
    return { accessToken: freshToken, shopId };
  }

  return { accessToken: record.access_token, shopId };
}
