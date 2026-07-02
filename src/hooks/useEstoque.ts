import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const SIZES: number[] = Array.from({ length: 16 }, (_, i) => 33 + i);

export interface DetalheRow {
  numeracao: number;
  quantidade: number;
}

export interface LoteComDetalhes {
  id: string;
  user_id: string;
  preco_total: number;
  descricao: string | null;
  created_at: string;
  detalhes: DetalheRow[];
  totalPares: number;
  custoPorPar: number;
}

export interface SaidaRow {
  id: string;
  user_id: string;
  numeracao: number;
  quantidade: number;
  descricao: string | null;
  created_at: string;
}

export type StockMap = Record<number, number>;

export interface EstoqueStats {
  stockMap: StockMap;
  totalEstoque: number;
  totalInvestido: number;
  totalComprado: number;
  custoMedioPorPar: number;
  totalVendido: number;
}

export interface NovaCompraInput {
  preco_total: number;
  descricao: string;
  quantidades: Record<number, number>;
}

export interface RegistrarVendaInput {
  numeracao: number;
  quantidade: number;
  descricao: string;
}

function buildStats(lotes: LoteComDetalhes[], saidas: SaidaRow[]): EstoqueStats {
  const compradoPorNumeracao: StockMap = Object.fromEntries(SIZES.map((s) => [s, 0]));
  let totalInvestido = 0;
  let totalComprado = 0;

  for (const lote of lotes) {
    totalInvestido += Number(lote.preco_total);
    for (const d of lote.detalhes) {
      compradoPorNumeracao[d.numeracao] = (compradoPorNumeracao[d.numeracao] ?? 0) + d.quantidade;
      totalComprado += d.quantidade;
    }
  }

  const vendidoPorNumeracao: StockMap = Object.fromEntries(SIZES.map((s) => [s, 0]));
  let totalVendido = 0;

  for (const s of saidas) {
    vendidoPorNumeracao[s.numeracao] = (vendidoPorNumeracao[s.numeracao] ?? 0) + s.quantidade;
    totalVendido += s.quantidade;
  }

  const stockMap: StockMap = Object.fromEntries(
    SIZES.map((s) => [s, Math.max(0, (compradoPorNumeracao[s] ?? 0) - (vendidoPorNumeracao[s] ?? 0))]),
  );

  return {
    stockMap,
    totalEstoque: Object.values(stockMap).reduce((a, b) => a + b, 0),
    totalInvestido,
    totalComprado,
    custoMedioPorPar: totalComprado > 0 ? totalInvestido / totalComprado : 0,
    totalVendido,
  };
}

export function useEstoqueData() {
  const { user } = useAuth();

  const lotesQuery = useQuery({
    queryKey: ["estoque", "lotes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("palmilha_lotes")
        .select("*, palmilha_lote_detalhes(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data as unknown as Array<{
        id: string;
        user_id: string;
        preco_total: number;
        descricao: string | null;
        created_at: string;
        palmilha_lote_detalhes: DetalheRow[];
      }>).map((row) => {
        const detalhes = row.palmilha_lote_detalhes ?? [];
        const totalPares = detalhes.reduce((acc, d) => acc + d.quantidade, 0);
        const preco = Number(row.preco_total);
        return {
          id: row.id,
          user_id: row.user_id,
          preco_total: preco,
          descricao: row.descricao,
          created_at: row.created_at,
          detalhes,
          totalPares,
          custoPorPar: totalPares > 0 ? preco / totalPares : 0,
        } satisfies LoteComDetalhes;
      });
    },
    enabled: !!user,
  });

  const saidasQuery = useQuery({
    queryKey: ["estoque", "saidas", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("palmilha_saidas")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SaidaRow[];
    },
    enabled: !!user,
  });

  const lotes = lotesQuery.data ?? [];
  const saidas = saidasQuery.data ?? [];
  const stats = buildStats(lotes, saidas);

  return {
    lotes,
    saidas,
    stats,
    isLoading: lotesQuery.isLoading || saidasQuery.isLoading,
  };
}

export function useEstoqueMutations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["estoque"] });

  const novaCompra = useMutation({
    mutationFn: async (input: NovaCompraInput) => {
      const itens = SIZES.filter((s) => (input.quantidades[s] ?? 0) > 0).map((s) => ({
        numeracao: s,
        quantidade: input.quantidades[s],
      }));

      if (itens.length === 0) throw new Error("Informe ao menos um tamanho.");

      const { data: lote, error: loteError } = await supabase
        .from("palmilha_lotes")
        .insert({
          user_id: user!.id,
          preco_total: input.preco_total,
          descricao: input.descricao || null,
        })
        .select("id")
        .single();

      if (loteError || !lote) throw loteError ?? new Error("Falha ao criar lote.");

      const { error: detError } = await supabase
        .from("palmilha_lote_detalhes")
        .insert(itens.map((i) => ({ lote_id: lote.id, ...i })));

      if (detError) throw detError;
    },
    onSuccess: invalidate,
  });

  const registrarVenda = useMutation({
    mutationFn: async (input: RegistrarVendaInput) => {
      const { error } = await supabase.from("palmilha_saidas").insert({
        user_id: user!.id,
        numeracao: input.numeracao,
        quantidade: input.quantidade,
        descricao: input.descricao || null,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { novaCompra, registrarVenda };
}
