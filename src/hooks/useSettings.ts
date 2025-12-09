import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AppearanceSettings {
  id: string;
  site_name: string | null;
  site_logo: string | null;
  site_favicon: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  background_color: string | null;
  header_color: string | null;
  sidebar_color: string | null;
  font_family: string | null;
  hero_banners: any[];
  social_links: Record<string, string>;
  footer_text: string | null;
  custom_css: string | null;
  custom_js: string | null;
  maintenance_mode: boolean;
  maintenance_message: string | null;
}

export interface ApiSettings {
  id: string;
  provider: string;
  agent_token: string | null;
  secret_key: string | null;
  webhook_url: string | null;
  is_active: boolean;
  rtp_default: number | null;
}

export const useAppearanceSettings = () => {
  return useQuery({
    queryKey: ["appearance-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appearance_settings")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as AppearanceSettings | null;
    },
  });
};

export const useUpdateAppearanceSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<AppearanceSettings>) => {
      const { data: existing } = await supabase
        .from("appearance_settings")
        .select("id")
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from("appearance_settings")
          .update(settings)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("appearance_settings")
          .insert(settings)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appearance-settings"] });
      toast.success("Configurações salvas com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao salvar: " + error.message);
    },
  });
};

export const useApiSettings = () => {
  return useQuery({
    queryKey: ["api-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_settings")
        .select("*")
        .order("provider");

      if (error) throw error;
      return data as ApiSettings[];
    },
  });
};

export const useUpdateApiSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<ApiSettings> & { id?: string; provider: string }) => {
      if (settings.id) {
        const { data, error } = await supabase
          .from("api_settings")
          .update(settings)
          .eq("id", settings.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("api_settings")
          .insert(settings)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-settings"] });
      toast.success("API configurada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao configurar API: " + error.message);
    },
  });
};
