import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Fornecedor {
  id: string;
  user_id: string;
  nome: string;
  cnpj: string | null;
  contato_nome: string | null;
  contato_telefone: string | null;
  contato_email: string | null;
  prazo_pagamento_dias: number;
  observacoes: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export type FornecedorInput = Omit<Fornecedor, "id" | "user_id" | "ativo" | "created_at" | "updated_at">;

export function useFornecedores() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: fornecedores = [], isLoading } = useQuery({
    queryKey: ["fornecedores", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fornecedores")
        .select("*")
        .eq("user_id", user!.id)
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data as Fornecedor[];
    },
    enabled: !!user,
  });

  const criar = useMutation({
    mutationFn: async (f: FornecedorInput) => {
      const { error } = await supabase.from("fornecedores").insert({ ...f, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fornecedores"] }),
  });

  const editar = useMutation({
    mutationFn: async ({ id, ...f }: Partial<Fornecedor> & { id: string }) => {
      const { error } = await supabase
        .from("fornecedores")
        .update({ ...f, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fornecedores"] }),
  });

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fornecedores").update({ ativo: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fornecedores"] }),
  });

  return { fornecedores, isLoading, criar, editar, excluir };
}
