import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Produto {
  id: string;
  user_id: string;
  nome: string;
  categoria: string;
  sku: string | null;
  preco_custo: number;
  preco_venda: number | null;
  estoque_atual: number;
  estoque_minimo: number;
  unidade: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export function useProdutos() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ["produtos", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("user_id", user!.id)
        .eq("ativo", true)
        .order("categoria")
        .order("nome");
      if (error) throw error;
      return data as Produto[];
    },
    enabled: !!user,
  });

  const criar = useMutation({
    mutationFn: async (p: Omit<Produto, "id" | "user_id" | "created_at" | "updated_at" | "ativo">) => {
      const { error } = await supabase.from("produtos").insert({ ...p, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produtos"] }),
  });

  const editar = useMutation({
    mutationFn: async ({ id, ...p }: Partial<Produto> & { id: string }) => {
      const { error } = await supabase
        .from("produtos")
        .update({ ...p, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produtos"] }),
  });

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("produtos").update({ ativo: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produtos"] }),
  });

  const movimentar = useMutation({
    mutationFn: async (m: {
      produto_id: string;
      tipo: "entrada" | "saida";
      quantidade: number;
      preco_unitario?: number;
      descricao?: string;
    }) => {
      const produto = produtos.find((p) => p.id === m.produto_id);
      if (!produto) throw new Error("Produto não encontrado");

      const novoEstoque =
        m.tipo === "entrada"
          ? produto.estoque_atual + m.quantidade
          : produto.estoque_atual - m.quantidade;

      if (novoEstoque < 0) throw new Error("Estoque insuficiente");

      const { error: mvErr } = await supabase.from("produto_movimentacoes").insert({
        ...m,
        user_id: user!.id,
      });
      if (mvErr) throw mvErr;

      const { error: upErr } = await supabase
        .from("produtos")
        .update({ estoque_atual: novoEstoque, updated_at: new Date().toISOString() })
        .eq("id", m.produto_id);
      if (upErr) throw upErr;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produtos"] }),
  });

  const alertas = produtos.filter((p) => p.estoque_atual <= p.estoque_minimo);

  return { produtos, isLoading, criar, editar, excluir, movimentar, alertas };
}
