import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { invokeShopeeFunction } from "./client";
import type {
  ShopeeOrder,
  ShopeeOrderDetailResponse,
  ShopeeOrderListResponse,
  ShopeeOrderStatus,
  ShopeeShipOrderResponse,
} from "./types";

export interface OrderListParams {
  shopId: number;
  orderStatus?: ShopeeOrderStatus;
  timeFrom?: number;
  timeTo?: number;
  pageSize?: number;
  timeRangeField?: "create_time" | "update_time";
}

export interface ShipOrderParams {
  shopId: number;
  orderSn: string;
  packageNumber?: string;
  pickup?: { addressId: number; pickupTimeId: string };
  dropoff?: { branchId: number; senderRealName?: string };
}

export async function fetchOrderList(
  params: OrderListParams,
  cursor?: string,
): Promise<ShopeeOrderListResponse> {
  return invokeShopeeFunction<Record<string, unknown>, ShopeeOrderListResponse>(
    "shopee-orders",
    {
      action: "get_order_list",
      shop_id: params.shopId,
      order_status: params.orderStatus,
      time_from: params.timeFrom,
      time_to: params.timeTo,
      page_size: params.pageSize ?? 50,
      time_range_field: params.timeRangeField ?? "create_time",
      cursor,
    },
    { shopId: params.shopId },
  );
}

export async function fetchOrderDetail(
  shopId: number,
  orderSnList: string[],
  responseOptionalFields?: string,
): Promise<ShopeeOrder[]> {
  const data = await invokeShopeeFunction<Record<string, unknown>, ShopeeOrderDetailResponse>(
    "shopee-orders",
    {
      action: "get_order_detail",
      shop_id: shopId,
      order_sn_list: orderSnList,
      response_optional_fields: responseOptionalFields,
    },
    { shopId },
  );
  return data.response.order_list;
}

export async function shipOrder(params: ShipOrderParams): Promise<void> {
  await invokeShopeeFunction<Record<string, unknown>, ShopeeShipOrderResponse>(
    "shopee-orders",
    {
      action: "ship_order",
      shop_id: params.shopId,
      order_sn: params.orderSn,
      package_number: params.packageNumber,
      pickup: params.pickup
        ? { address_id: params.pickup.addressId, pickup_time_id: params.pickup.pickupTimeId }
        : undefined,
      dropoff: params.dropoff
        ? { branch_id: params.dropoff.branchId, sender_real_name: params.dropoff.senderRealName }
        : undefined,
    },
    { shopId: params.shopId },
  );
}

export function useOrderList(params: OrderListParams) {
  return useInfiniteQuery({
    queryKey: ["shopee", "orders", params],
    queryFn: ({ pageParam }) => fetchOrderList(params, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.response.more ? lastPage.response.next_cursor : undefined,
    staleTime: 60 * 1000,
    enabled: params.shopId > 0,
  });
}

export function useOrderDetail(shopId: number, orderSnList: string[]) {
  return useQuery({
    queryKey: ["shopee", "order-detail", shopId, orderSnList],
    queryFn: () => fetchOrderDetail(shopId, orderSnList),
    staleTime: 2 * 60 * 1000,
    enabled: shopId > 0 && orderSnList.length > 0,
  });
}

export function useShipOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shipOrder,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["shopee", "orders", { shopId: variables.shopId }],
      });
    },
  });
}
