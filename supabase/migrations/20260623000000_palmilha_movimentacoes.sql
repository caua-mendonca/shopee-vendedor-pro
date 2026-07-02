CREATE TABLE public.palmilha_movimentacoes (
  id          UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  quantidade  INTEGER NOT NULL CHECK (quantidade > 0),
  descricao   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.palmilha_movimentacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own movimentacoes"
  ON public.palmilha_movimentacoes
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_palmilha_movimentacoes_user_id ON public.palmilha_movimentacoes(user_id);
CREATE INDEX idx_palmilha_movimentacoes_created_at ON public.palmilha_movimentacoes(created_at DESC);
