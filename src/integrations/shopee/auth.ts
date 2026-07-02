import { useQuery } from "@tanstack/react-query";
import { invokeShopeeFunction } from "./client";
import type {
  ShopeeAuthUrlResponse,
  ShopeeConnectedShop,
  ShopeeTokenExchangeResponse,
} from "./types";

export async function getShopeeAuthUrl(): Promise<string> {
  const data = await invokeShopeeFunction<{ action: string }, ShopeeAuthUrlResponse>(
    "shopee-auth",
    { action: "get_auth_url" },
  );
  return data.url;
}

export async function exchangeShopeeCode(
  code: string,
  shopId: number,
): Promise<ShopeeTokenExchangeResponse> {
  return invokeShopeeFunction<
    { action: string; code: string; shop_id: number },
    ShopeeTokenExchangeResponse
  >("shopee-auth", { action: "exchange", code, shop_id: shopId });
}

export async function getConnectedShops(): Promise<ShopeeConnectedShop[]> {
  const data = await invokeShopeeFunction<
    { action: string },
    { shops: ShopeeConnectedShop[] }
  >("shopee-auth", { action: "get_connected_shops" });
  return data.shops;
}

export function useShopeeConnection() {
  const query = useQuery({
    queryKey: ["shopee", "connected-shops"],
    queryFn: getConnectedShops,
    staleTime: 5 * 60 * 1000,
  });

  async function connectShop() {
    const url = await getShopeeAuthUrl();
    window.location.href = url;
  }

  return {
    shops: query.data ?? [],
    isLoading: query.isLoading,
    isConnected: (query.data?.length ?? 0) > 0,
    connectShop,
    refetch: query.refetch,
  };
}
