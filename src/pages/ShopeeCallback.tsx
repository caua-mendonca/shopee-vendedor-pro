import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { exchangeShopeeCode } from "@/integrations/shopee/auth";
import { ShopeeClientError } from "@/integrations/shopee/client";

export default function ShopeeCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    // Guard against StrictMode double-invoke
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get("code");
    const shopId = searchParams.get("shop_id");
    const error = searchParams.get("error");

    if (error) {
      toast.error(`Autorização negada pela Shopee: ${error}`);
      navigate("/");
      return;
    }

    if (!code || !shopId) {
      toast.error("Parâmetros inválidos no retorno da Shopee.");
      navigate("/");
      return;
    }

    exchangeShopeeCode(code, parseInt(shopId, 10))
      .then(() => {
        toast.success("Loja Shopee conectada com sucesso!");
        navigate("/");
      })
      .catch((err: unknown) => {
        const message =
          err instanceof ShopeeClientError
            ? err.message
            : "Erro ao conectar a loja Shopee.";
        toast.error(message);
        navigate("/");
      });
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Conectando sua loja Shopee…</p>
      </div>
    </div>
  );
}
