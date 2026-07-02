import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildSignature,
  buildTimestamp,
  ShopeeApiError,
} from "../_shared/shopee-signature.ts";
import { upsertToken, createSupabaseAdmin } from "../_shared/token-store.ts";

const PARTNER_ID = parseInt(Deno.env.get("SHOPEE_PARTNER_ID") ?? "0", 10);
const BASE_URL = Deno.env.get("SHOPEE_BASE_URL") ?? "https://partner.shopeemobile.com";
const REDIRECT_URI = Deno.env.get("SHOPEE_REDIRECT_URI") ?? "";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}

async function getUserId(req: Request): Promise<string> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("Missing Authorization header");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  return user.id;
}

// Build and sign the Shopee OAuth authorization URL server-side
// so partner_key never reaches the frontend
async function handleGetAuthUrl(): Promise<Response> {
  const apiPath = "/api/v2/shop/auth_partner";
  const timestamp = buildTimestamp();
  const sign = await buildSignature({ apiPath, timestamp });

  const params = new URLSearchParams({
    partner_id: String(PARTNER_ID),
    timestamp: String(timestamp),
    sign,
    redirect: REDIRECT_URI,
  });

  return jsonResponse({ url: `${BASE_URL}${apiPath}?${params.toString()}` });
}

async function handleExchange(
  userId: string,
  code: string,
  shopId: number,
): Promise<Response> {
  const apiPath = "/api/v2/auth/token/get";
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
    body: JSON.stringify({ code, shop_id: shopId, partner_id: PARTNER_ID }),
  });

  const data = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expire_in?: number;
    error?: string;
    message?: string;
  };

  if (data.error && data.error !== "") {
    throw new ShopeeApiError(data.error, data.message ?? "Token exchange failed", false);
  }

  if (!data.access_token || !data.refresh_token || !data.expire_in) {
    throw new Error("Token exchange response missing required fields");
  }

  const supabase = createSupabaseAdmin();
  await upsertToken(supabase, userId, shopId, data.access_token, data.refresh_token, data.expire_in);

  const expiresAt = new Date(Date.now() + data.expire_in * 1000).toISOString();
  return jsonResponse({ shop_id: shopId, expires_at: expiresAt });
}

async function handleRefresh(userId: string, shopId: number): Promise<Response> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("shopee_tokens")
    .select("refresh_token")
    .eq("user_id", userId)
    .eq("shop_id", shopId)
    .single();

  if (error || !data) {
    return jsonResponse({ error: "no_token", message: "No token found for this shop" }, 404);
  }

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
      shop_id: shopId,
      refresh_token: (data as { refresh_token: string }).refresh_token,
      partner_id: PARTNER_ID,
    }),
  });

  const refreshData = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expire_in?: number;
    error?: string;
    message?: string;
  };

  if (refreshData.error && refreshData.error !== "") {
    throw new ShopeeApiError(
      refreshData.error,
      refreshData.message ?? "Refresh failed",
      false,
    );
  }

  if (!refreshData.access_token || !refreshData.refresh_token || !refreshData.expire_in) {
    throw new Error("Refresh response missing required fields");
  }

  await upsertToken(
    supabase,
    userId,
    shopId,
    refreshData.access_token,
    refreshData.refresh_token,
    refreshData.expire_in,
  );

  const expiresAt = new Date(Date.now() + refreshData.expire_in * 1000).toISOString();
  return jsonResponse({ shop_id: shopId, expires_at: expiresAt });
}

async function handleGetConnectedShops(userId: string): Promise<Response> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("shopee_tokens")
    .select("shop_id, expires_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return jsonResponse({ shops: data ?? [] });
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const body = (await req.json()) as {
      action: "get_auth_url" | "exchange" | "refresh" | "get_connected_shops";
      code?: string;
      shop_id?: number;
    };

    if (body.action === "get_auth_url") {
      return await handleGetAuthUrl();
    }

    const userId = await getUserId(req);

    switch (body.action) {
      case "exchange": {
        if (!body.code || !body.shop_id) {
          return jsonResponse({ error: "missing_params", message: "code and shop_id are required" }, 400);
        }
        return await handleExchange(userId, body.code, body.shop_id);
      }
      case "refresh": {
        if (!body.shop_id) {
          return jsonResponse({ error: "missing_params", message: "shop_id is required" }, 400);
        }
        return await handleRefresh(userId, body.shop_id);
      }
      case "get_connected_shops": {
        return await handleGetConnectedShops(userId);
      }
      default:
        return jsonResponse({ error: "invalid_action", message: "Unknown action" }, 400);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = err instanceof ShopeeApiError && err.isTokenExpired ? 401 : 500;
    console.error("[shopee-auth]", message);
    return jsonResponse({ error: "function_error", message }, status);
  }
});
