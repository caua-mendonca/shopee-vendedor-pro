-- Remove tabela anterior (sem dados reais ainda)
DROP TABLE IF EXISTS public.palmilha_movimentacoes;

-- ── palmilha_lotes ─────────────────────────────────────────────────────────
CREATE TABLE public.palmilha_lotes (
  id          UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preco_total NUMERIC(10,2) NOT NULL CHECK (preco_total >= 0),
  descricao   TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── palmilha_lote_detalhes ─────────────────────────────────────────────────
CREATE TABLE public.palmilha_lote_detalhes (
  id         UUID     NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lote_id    UUID     NOT NULL REFERENCES public.palmilha_lotes(id) ON DELETE CASCADE,
  numeracao  SMALLINT NOT NULL CHECK (numeracao BETWEEN 33 AND 48),
  quantidade INTEGER  NOT NULL CHECK (quantidade > 0),
  UNIQUE (lote_id, numeracao)
);

-- ── palmilha_saidas ────────────────────────────────────────────────────────
CREATE TABLE public.palmilha_saidas (
  id         UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numeracao  SMALLINT    NOT NULL CHECK (numeracao BETWEEN 33 AND 48),
  quantidade INTEGER     NOT NULL CHECK (quantidade > 0),
  descricao  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.palmilha_lotes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palmilha_lote_detalhes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palmilha_saidas        ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own lotes"
  ON public.palmilha_lotes FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage own lote_detalhes"
  ON public.palmilha_lote_detalhes FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.palmilha_lotes l
      WHERE l.id = lote_id AND l.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.palmilha_lotes l
      WHERE l.id = lote_id AND l.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own saidas"
  ON public.palmilha_saidas FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX idx_palmilha_lotes_user_id         ON public.palmilha_lotes(user_id);
CREATE INDEX idx_palmilha_lotes_created_at      ON public.palmilha_lotes(created_at DESC);
CREATE INDEX idx_palmilha_lote_detalhes_lote_id ON public.palmilha_lote_detalhes(lote_id);
CREATE INDEX idx_palmilha_saidas_user_id        ON public.palmilha_saidas(user_id);
CREATE INDEX idx_palmilha_saidas_created_at     ON public.palmilha_saidas(created_at DESC);
CREATE INDEX idx_palmilha_saidas_numeracao      ON public.palmilha_saidas(numeracao);
