import { supabase } from "@/integrations/supabase/client";
import type { ShopeeEdgeFunctionError } from "./types";

type ShopeeFunctionName = "shopee-auth" | "shopee-products" | "shopee-orders";

export class ShopeeClientError extends Error {
  constructor(
    message: string,
    public readonly code?: string | number,
    public readonly isTokenExpired = false,
  ) {
    super(message);
    this.name = "ShopeeClientError";
  }
}

export async function invokeShopeeFunction<TBody, TResponse>(
  functionName: ShopeeFunctionName,
  body: TBody,
  options: { retryOnTokenExpired?: boolean; shopId?: number } = {},
): Promise<TResponse> {
  const { data, error } = await supabase.functions.invoke<TResponse>(functionName, { body });

  if (error) {
    // Supabase wraps Edge Function HTTP errors — parse the body for details
    const errorBody = error as unknown as { context?: Response };
    let detail: ShopeeEdgeFunctionError | null = null;

    try {
      if (errorBody.context instanceof Response) {
        detail = (await errorBody.context.json()) as ShopeeEdgeFunctionError;
      }
    } catch {
      // ignore parse errors
    }

    const message = detail?.message ?? error.message ?? "Shopee integration error";
    const code = detail?.error;
    const isTokenExpired = code === "token_expired" || code === "error_auth";

    // Auto-retry once after refreshing the token
    if (isTokenExpired && options.retryOnTokenExpired !== false && options.shopId) {
      await invokeShopeeFunction(
        "shopee-auth",
        { action: "refresh", shop_id: options.shopId },
        { retryOnTokenExpired: false },
      );
      return invokeShopeeFunction<TBody, TResponse>(functionName, body, {
        ...options,
        retryOnTokenExpired: false,
      });
    }

    throw new ShopeeClientError(message, code, isTokenExpired);
  }

  if (!data) {
    throw new ShopeeClientError("Empty response from Shopee function");
  }

  return data;
}
