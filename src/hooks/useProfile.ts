import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserProfile {
  id?: string;
  user_id: string;
  full_name: string | null;
  store_name: string | null;
  avatar_url: string | null;
  shopee_commission: number;
  target_margin: number;
  stock_alert_threshold: number;
  updated_at?: string;
}

const DEFAULTS: Omit<UserProfile, "user_id"> = {
  full_name: null,
  store_name: null,
  avatar_url: null,
  shopee_commission: 14,
  target_margin: 30,
  stock_alert_threshold: 3,
};

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<UserProfile>({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return {
          ...DEFAULTS,
          user_id: user!.id,
          full_name: (user?.user_metadata?.full_name as string) ?? null,
          store_name: (user?.user_metadata?.store_name as string) ?? null,
        };
      }

      return {
        ...DEFAULTS,
        ...data,
        shopee_commission: Number(data.shopee_commission ?? DEFAULTS.shopee_commission),
        target_margin: Number(data.target_margin ?? DEFAULTS.target_margin),
        stock_alert_threshold: Number(data.stock_alert_threshold ?? DEFAULTS.stock_alert_threshold),
      } as UserProfile;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Omit<UserProfile, "user_id" | "id">>) => {
      const { error } = await supabase.from("profiles").upsert(
        { user_id: user!.id, ...updates, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user!.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;

      await supabase.from("profiles").upsert(
        { user_id: user!.id, avatar_url: url, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );

      return url;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    updateProfile,
    uploadAvatar,
  };
}
