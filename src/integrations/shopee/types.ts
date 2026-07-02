// ─── Auth ──────────────────────────────────────────────────────────────────

export interface ShopeeConnectedShop {
  shop_id: number;
  expires_at: string;
}

export interface ShopeeAuthUrlResponse {
  url: string;
}

export interface ShopeeTokenExchangeResponse {
  shop_id: number;
  expires_at: string;
}

// ─── Products ──────────────────────────────────────────────────────────────

export type ShopeeItemStatus = "NORMAL" | "BANNED" | "DELETED" | "UNLIST";

export interface ShopeeItemBasic {
  item_id: number;
  item_status: ShopeeItemStatus;
  update_time: number;
}

export interface ShopeeItemListResponse {
  response: {
    item: ShopeeItemBasic[];
    has_next_page: boolean;
    next_offset: number;
    total_count: number;
  };
  error: string;
  message: string;
  request_id: string;
}

export interface ShopeeStockUpdateItem {
  item_id: number;
  stock_list?: Array<{
    model_id: number;
    seller_stock: Array<{ stock: number }>;
  }>;
  seller_stock?: Array<{ stock: number }>;
}

export interface ShopeeUpdateStockResponse {
  response: {
    failure_list: Array<{ item_id: number; fail_id: string; failed_reason: string }>;
    success_list: number[];
  };
  error: string;
  message: string;
  request_id: string;
}

// ─── Orders ────────────────────────────────────────────────────────────────

export type ShopeeOrderStatus =
  | "READY_TO_SHIP"
  | "PROCESSED"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED"
  | "IN_CANCEL";

export interface ShopeeOrderSummary {
  order_sn: string;
  order_status: ShopeeOrderStatus;
}

export interface ShopeeOrderListResponse {
  response: {
    order_list: ShopeeOrderSummary[];
    more: boolean;
    next_cursor: string;
  };
  error: string;
  message: string;
  request_id: string;
}

export interface ShopeeOrderItem {
  item_id: number;
  item_name: string;
  model_id: number;
  model_name: string;
  model_quantity_purchased: number;
  model_discounted_price: string;
  image_url: string;
}

export interface ShopeeOrder {
  order_sn: string;
  order_status: ShopeeOrderStatus;
  create_time: number;
  update_time: number;
  total_amount: string;
  currency: string;
  buyer_username: string;
  item_list: ShopeeOrderItem[];
  recipient_address?: {
    name: string;
    phone: string;
    town: string;
    district: string;
    city: string;
    state: string;
    region: string;
    zipcode: string;
    full_address: string;
  };
}

export interface ShopeeOrderDetailResponse {
  response: {
    order_list: ShopeeOrder[];
  };
  error: string;
  message: string;
  request_id: string;
}

export interface ShopeeShipOrderResponse {
  response: Record<string, never>;
  error: string;
  message: string;
  request_id: string;
}

// ─── Errors ────────────────────────────────────────────────────────────────

export interface ShopeeEdgeFunctionError {
  error: string;
  message: string;
}
