import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invokeShopeeFunction } from "./client";
import type {
  ShopeeItemListResponse,
  ShopeeItemStatus,
  ShopeeUpdateStockResponse,
} from "./types";

export interface ProductListParams {
  shopId: number;
  pageNo?: number;
  pageSize?: number;
  itemStatus?: ShopeeItemStatus[];
}

export interface StockUpdateItem {
  itemId: number;
  stock: number;
  modelId?: number;
}

export interface StockUpdateParams {
  shopId: number;
  items: StockUpdateItem[];
}

export async function fetchProductList(
  params: ProductListParams,
): Promise<ShopeeItemListResponse> {
  return invokeShopeeFunction<Record<string, unknown>, ShopeeItemListResponse>(
    "shopee-products",
    {
      action: "list_items",
      shop_id: params.shopId,
      page_no: params.pageNo ?? 0,
      page_size: params.pageSize ?? 100,
      item_status: params.itemStatus ?? ["NORMAL"],
    },
    { shopId: params.shopId },
  );
}

export async function updateStock(
  params: StockUpdateParams,
): Promise<ShopeeUpdateStockResponse> {
  const items = params.items.map((item) => {
    if (item.modelId !== undefined) {
      return {
        item_id: item.itemId,
        stock_list: [
          {
            model_id: item.modelId,
            seller_stock: [{ stock: item.stock }],
          },
        ],
      };
    }
    return {
      item_id: item.itemId,
      seller_stock: [{ stock: item.stock }],
    };
  });

  return invokeShopeeFunction<Record<string, unknown>, ShopeeUpdateStockResponse>(
    "shopee-products",
    { action: "update_stock", shop_id: params.shopId, items },
    { shopId: params.shopId },
  );
}

export function useProductList(params: ProductListParams) {
  return useQuery({
    queryKey: ["shopee", "products", params],
    queryFn: () => fetchProductList(params),
    staleTime: 5 * 60 * 1000,
    enabled: params.shopId > 0,
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStock,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["shopee", "products", { shopId: variables.shopId }],
      });
    },
  });
}
