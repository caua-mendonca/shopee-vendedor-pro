CREATE TABLE public.shopee_tokens (
  id            UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id       BIGINT NOT NULL,
  access_token  TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expire_in     INTEGER NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  token_type    TEXT NOT NULL DEFAULT 'shop',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, shop_id)
);

ALTER TABLE public.shopee_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shopee tokens"
  ON public.shopee_tokens
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_shopee_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_shopee_tokens_updated_at
  BEFORE UPDATE ON public.shopee_tokens
  FOR EACH ROW EXECUTE FUNCTION public.handle_shopee_tokens_updated_at();
