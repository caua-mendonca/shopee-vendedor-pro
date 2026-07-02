const BASE_URL = Deno.env.get("SHOPEE_BASE_URL") ?? "https://partner.shopeemobile.com";
const PARTNER_ID = parseInt(Deno.env.get("SHOPEE_PARTNER_ID") ?? "0", 10);
const PARTNER_KEY = Deno.env.get("SHOPEE_PARTNER_KEY") ?? "";

export interface SignatureParams {
  apiPath: string;
  timestamp: number;
  accessToken?: string;
  shopId?: number;
}

export interface ShopeeRequestOptions {
  apiPath: string;
  method: "GET" | "POST";
  queryParams?: Record<string, string | number | string[]>;
  body?: Record<string, unknown>;
  accessToken?: string;
  shopId?: number;
}

export class ShopeeApiError extends Error {
  constructor(
    public readonly code: string | number,
    message: string,
    public readonly isTokenExpired: boolean,
  ) {
    super(message);
    this.name = "ShopeeApiError";
  }
}

export function buildTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export async function buildSignature(params: SignatureParams): Promise<string> {
  const { apiPath, timestamp, accessToken, shopId } = params;

  // Public endpoints (token exchange/refresh): partner_id + path + timestamp
  // Shop-level endpoints: partner_id + path + timestamp + access_token + shop_id
  const baseString =
    shopId !== undefined && accessToken !== undefined
      ? `${PARTNER_ID}${apiPath}${timestamp}${accessToken}${shopId}`
      : `${PARTNER_ID}${apiPath}${timestamp}`;

  const keyBytes = new TextEncoder().encode(PARTNER_KEY);
  const msgBytes = new TextEncoder().encode(baseString);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sigBuffer = await crypto.subtle.sign("HMAC", cryptoKey, msgBytes);
  return Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function shopeeRequest<T>(options: ShopeeRequestOptions): Promise<T> {
  const { apiPath, method, queryParams = {}, body, accessToken, shopId } = options;
  const timestamp = buildTimestamp();
  const sign = await buildSignature({ apiPath, timestamp, accessToken, shopId });

  const params = new URLSearchParams();
  params.set("partner_id", String(PARTNER_ID));
  params.set("timestamp", String(timestamp));
  params.set("sign", sign);

  if (accessToken) params.set("access_token", accessToken);
  if (shopId !== undefined) params.set("shop_id", String(shopId));

  for (const [key, value] of Object.entries(queryParams)) {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.set(key, String(value));
    }
  }

  const url = `${BASE_URL}${apiPath}?${params.toString()}`;

  const fetchOptions: RequestInit = { method };
  if (method === "POST" && body) {
    fetchOptions.headers = { "Content-Type": "application/json" };
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);
  const data = (await response.json()) as T & { error?: string; message?: string };

  if (data.error && data.error !== "") {
    const isTokenExpired =
      data.error === "error_auth" ||
      data.error === "invalid_access_token" ||
      data.error === "token_expired";
    throw new ShopeeApiError(data.error, data.message ?? "Shopee API error", isTokenExpired);
  }

  return data;
}
