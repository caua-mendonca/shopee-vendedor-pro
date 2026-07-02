import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { shopeeRequest, ShopeeApiError } from "../_shared/shopee-signature.ts";
import { getValidToken, createSupabaseAdmin } from "../_shared/token-store.ts";

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

type OrderStatus = "READY_TO_SHIP" | "PROCESSED" | "SHIPPED" | "COMPLETED" | "CANCELLED" | "IN_CANCEL";

interface GetOrderListBody {
  action: "get_order_list";
  shop_id: number;
  order_status?: OrderStatus;
  time_from?: number;
  time_to?: number;
  page_size?: number;
  cursor?: string;
  time_range_field?: "create_time" | "update_time";
}

interface GetOrderDetailBody {
  action: "get_order_detail";
  shop_id: number;
  order_sn_list: string[];
  response_optional_fields?: string;
}

interface ShipOrderBody {
  action: "ship_order";
  shop_id: number;
  order_sn: string;
  package_number?: string;
  pickup?: {
    address_id: number;
    pickup_time_id: string;
  };
  dropoff?: {
    branch_id: number;
    sender_real_name?: string;
  };
}

type RequestBody = GetOrderListBody | GetOrderDetailBody | ShipOrderBody;

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const userId = await getUserId(req);
    const body = (await req.json()) as RequestBody;
    const supabase = createSupabaseAdmin();

    const { accessToken, shopId } = await getValidToken(supabase, userId, body.shop_id);

    switch (body.action) {
      case "get_order_list": {
        const now = Math.floor(Date.now() / 1000);
        const sevenDaysAgo = now - 7 * 24 * 60 * 60;

        const queryParams: Record<string, string | number> = {
          time_range_field: body.time_range_field ?? "create_time",
          time_from: body.time_from ?? sevenDaysAgo,
          time_to: body.time_to ?? now,
          page_size: Math.min(body.page_size ?? 50, 100),
        };

        if (body.order_status) queryParams.order_status = body.order_status;
        if (body.cursor) queryParams.cursor = body.cursor;

        const data = await shopeeRequest({
          apiPath: "/api/v2/order/get_order_list",
          method: "GET",
          accessToken,
          shopId,
          queryParams,
        });

        return jsonResponse(data);
      }

      case "get_order_detail": {
        if (!body.order_sn_list?.length) {
          return jsonResponse({ error: "missing_params", message: "order_sn_list is required" }, 400);
        }

        const queryParams: Record<string, string | number> = {
          order_sn_list: body.order_sn_list.slice(0, 50).join(","),
        };

        if (body.response_optional_fields) {
          queryParams.response_optional_fields = body.response_optional_fields;
        }

        const data = await shopeeRequest({
          apiPath: "/api/v2/order/get_order_detail",
          method: "GET",
          accessToken,
          shopId,
          queryParams,
        });

        return jsonResponse(data);
      }

      case "ship_order": {
        const shipBody: Record<string, unknown> = { order_sn: body.order_sn };

        if (body.package_number) shipBody.package_number = body.package_number;
        if (body.pickup) {
          shipBody.pickup = {
            address_id: body.pickup.address_id,
            pickup_time_id: body.pickup.pickup_time_id,
          };
        }
        if (body.dropoff) {
          shipBody.dropoff = {
            branch_id: body.dropoff.branch_id,
            ...(body.dropoff.sender_real_name && { sender_real_name: body.dropoff.sender_real_name }),
          };
        }

        const data = await shopeeRequest({
          apiPath: "/api/v2/logistics/ship_order",
          method: "POST",
          accessToken,
          shopId,
          body: shipBody,
        });

        return jsonResponse(data);
      }

      default:
        return jsonResponse({ error: "invalid_action", message: "Unknown action" }, 400);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = err instanceof ShopeeApiError && err.isTokenExpired ? 401 : 500;
    console.error("[shopee-orders]", message);
    return jsonResponse({ error: "function_error", message }, status);
  }
});
