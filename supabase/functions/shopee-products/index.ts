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

interface ListItemsBody {
  action: "list_items";
  shop_id: number;
  page_no?: number;
  page_size?: number;
  item_status?: ("NORMAL" | "BANNED" | "DELETED" | "UNLIST")[];
}

interface StockUpdateItem {
  item_id: number;
  stock_list?: Array<{
    model_id: number;
    seller_stock: Array<{ stock: number }>;
  }>;
  seller_stock?: Array<{ stock: number }>;
}

interface UpdateStockBody {
  action: "update_stock";
  shop_id: number;
  items: StockUpdateItem[];
}

type RequestBody = ListItemsBody | UpdateStockBody;

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
      case "list_items": {
        const pageNo = body.page_no ?? 0;
        const pageSize = Math.min(body.page_size ?? 100, 100);
        const itemStatus = body.item_status ?? ["NORMAL"];

        const data = await shopeeRequest({
          apiPath: "/api/v2/product/get_item_list",
          method: "GET",
          accessToken,
          shopId,
          queryParams: {
            offset: pageNo * pageSize,
            page_size: pageSize,
            item_status: itemStatus,
          },
        });

        return jsonResponse(data);
      }

      case "update_stock": {
        const data = await shopeeRequest({
          apiPath: "/api/v2/product/update_stock",
          method: "POST",
          accessToken,
          shopId,
          body: { item_list: body.items },
        });

        return jsonResponse(data);
      }

      default:
        return jsonResponse({ error: "invalid_action", message: "Unknown action" }, 400);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = err instanceof ShopeeApiError && err.isTokenExpired ? 401 : 500;
    console.error("[shopee-products]", message);
    return jsonResponse({ error: "function_error", message }, status);
  }
});
