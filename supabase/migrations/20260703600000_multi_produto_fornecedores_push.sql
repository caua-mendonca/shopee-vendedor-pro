-- 1. preco_venda nas saídas de palmilha (para P&L real)
ALTER TABLE public.palmilha_saidas
  ADD COLUMN IF NOT EXISTS preco_venda NUMERIC(10,2);

-- 2. Produtos genéricos (estoque multi-produto)
CREATE TABLE IF NOT EXISTS public.produtos (
  id              UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome            TEXT    NOT NULL,
  categoria       TEXT    NOT NULL DEFAULT 'Geral',
  sku             TEXT,
  preco_custo     NUMERIC(10,2) NOT NULL DEFAULT 0,
  preco_venda     NUMERIC(10,2),
  estoque_atual   INTEGER NOT NULL DEFAULT 0,
  estoque_minimo  INTEGER NOT NULL DEFAULT 3,
  unidade         TEXT    NOT NULL DEFAULT 'un',
  ativo           BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia próprios produtos" ON public.produtos;
CREATE POLICY "Usuário gerencia próprios produtos" ON public.produtos FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 3. Movimentações de estoque genérico
CREATE TABLE IF NOT EXISTS public.produto_movimentacoes (
  id              UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id      UUID    REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
  user_id         UUID    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo            TEXT    NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  quantidade      INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario  NUMERIC(10,2),
  descricao       TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.produto_movimentacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia próprias movimentações" ON public.produto_movimentacoes;
CREATE POLICY "Usuário gerencia próprias movimentações" ON public.produto_movimentacoes FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 4. Fornecedores
CREATE TABLE IF NOT EXISTS public.fornecedores (
  id                    UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome                  TEXT    NOT NULL,
  cnpj                  TEXT,
  contato_nome          TEXT,
  contato_telefone      TEXT,
  contato_email         TEXT,
  prazo_pagamento_dias  INTEGER DEFAULT 30,
  observacoes           TEXT,
  ativo                 BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia próprios fornecedores" ON public.fornecedores;
CREATE POLICY "Usuário gerencia próprios fornecedores" ON public.fornecedores FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
