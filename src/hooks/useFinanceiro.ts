import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "./useProfile";

const MONTHS_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export interface FinanceiroData {
  totalInvestido: number;
  totalReceita: number;
  totalTaxas: number;
  totalCustoVendido: number;
  lucroLiquido: number;
  margemMedia: number;
  totalVendas: number;
  custoMedio: number;
  hasRevenueData: boolean;
  mensal: Array<{ mes: string; receita: number; custo: number; lucro: number; vendas: number }>;
  porNumeracao: Array<{ numeracao: number; quantidade: number; receita: number }>;
}

export function useFinanceiro() {
  const { user } = useAuth();
  const { profile } = useProfile();

  return useQuery<FinanceiroData>({
    queryKey: ["financeiro", user?.id, profile?.shopee_commission],
    queryFn: async () => {
      const commission = profile?.shopee_commission ?? 14;

      const [lotesRes, saidasRes, detalhesRes] = await Promise.all([
        supabase.from("palmilha_lotes").select("preco_total").eq("user_id", user!.id),
        supabase.from("palmilha_saidas").select("numeracao, quantidade, preco_venda, created_at").eq("user_id", user!.id).order("created_at"),
        supabase.from("palmilha_lote_detalhes").select("quantidade, lote_id").in(
          "lote_id",
          await supabase.from("palmilha_lotes").select("id").eq("user_id", user!.id).then(r => (r.data ?? []).map(l => l.id))
        ),
      ]);

      if (lotesRes.error) throw lotesRes.error;
      if (saidasRes.error) throw saidasRes.error;
      if (detalhesRes.error) throw detalhesRes.error;

      const lotes = lotesRes.data ?? [];
      const saidas = saidasRes.data ?? [];
      const detalhes = detalhesRes.data ?? [];

      const totalInvestido = lotes.reduce((a, l) => a + Number(l.preco_total), 0);
      const totalComprado = detalhes.reduce((a, d) => a + d.quantidade, 0);
      const custoMedio = totalComprado > 0 ? totalInvestido / totalComprado : 0;

      const saidasComPreco = saidas.filter((s) => s.preco_venda != null);
      const hasRevenueData = saidasComPreco.length > 0;
      const totalReceita = saidasComPreco.reduce((a, s) => a + (s.preco_venda! * s.quantidade), 0);
      const totalTaxas = totalReceita * (commission / 100);
      const totalVendidos = saidasComPreco.reduce((a, s) => a + s.quantidade, 0);
      const totalCustoVendido = totalVendidos * custoMedio;
      const lucroLiquido = totalReceita - totalCustoVendido - totalTaxas;
      const margemMedia = totalReceita > 0 ? (lucroLiquido / totalReceita) * 100 : 0;
      const totalVendas = saidas.reduce((a, s) => a + s.quantidade, 0);

      // Agrupar por mês (últimos 6)
      const byMonth: Record<string, { receita: number; custo: number; vendas: number }> = {};
      for (const s of saidas) {
        const d = new Date(s.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!byMonth[key]) byMonth[key] = { receita: 0, custo: 0, vendas: 0 };
        byMonth[key].receita += s.preco_venda != null ? Number(s.preco_venda) * s.quantidade : 0;
        byMonth[key].custo += s.quantidade * custoMedio;
        byMonth[key].vendas += s.quantidade;
      }

      const mensal = Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([key, v]) => {
          const [, m] = key.split("-");
          const lucro = v.receita - v.custo - v.receita * (commission / 100);
          return { mes: MONTHS_PT[parseInt(m) - 1], receita: v.receita, custo: v.custo, lucro, vendas: v.vendas };
        });

      const byNum: Record<number, { quantidade: number; receita: number }> = {};
      for (const s of saidas) {
        if (!byNum[s.numeracao]) byNum[s.numeracao] = { quantidade: 0, receita: 0 };
        byNum[s.numeracao].quantidade += s.quantidade;
        byNum[s.numeracao].receita += s.preco_venda != null ? Number(s.preco_venda) * s.quantidade : 0;
      }
      const porNumeracao = Object.entries(byNum)
        .map(([n, v]) => ({ numeracao: parseInt(n), ...v }))
        .sort((a, b) => b.quantidade - a.quantidade);

      return {
        totalInvestido, totalReceita, totalTaxas, totalCustoVendido,
        lucroLiquido, margemMedia, totalVendas, custoMedio, hasRevenueData,
        mensal, porNumeracao,
      };
    },
    enabled: !!user,
  });
}
