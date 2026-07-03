-- Adiciona preferências do usuário na tabela profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS shopee_commission  NUMERIC(5,2) NOT NULL DEFAULT 14,
  ADD COLUMN IF NOT EXISTS target_margin      NUMERIC(5,2) NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS stock_alert_threshold INTEGER    NOT NULL DEFAULT 3;

-- Bucket de avatares (público, max 5 MB, apenas imagens)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS do storage (drop antes de criar para idempotência)
DROP POLICY IF EXISTS "Avatares são públicos"           ON storage.objects;
DROP POLICY IF EXISTS "Usuário faz upload do próprio avatar" ON storage.objects;
DROP POLICY IF EXISTS "Usuário atualiza o próprio avatar"    ON storage.objects;
DROP POLICY IF EXISTS "Usuário deleta o próprio avatar"      ON storage.objects;

CREATE POLICY "Avatares são públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Usuário faz upload do próprio avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuário atualiza o próprio avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuário deleta o próprio avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Trigger para criar perfil automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, store_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'store_name'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
