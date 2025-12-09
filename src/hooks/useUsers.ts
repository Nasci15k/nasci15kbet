import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  phone: string | null;
  cpf: string | null;
  avatar_url: string | null;
  balance: number;
  bonus_balance: number;
  total_deposited: number;
  total_withdrawn: number;
  total_wagered: number;
  total_won: number;
  vip_level: number;
  vip_points: number;
  is_blocked: boolean;
  blocked_reason: string | null;
  referral_code: string | null;
  created_at: string;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserProfile[];
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!id,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UserProfile> & { id: string }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar usuário: " + error.message);
    },
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, blocked, reason }: { id: string; blocked: boolean; reason?: string }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({ 
          is_blocked: blocked, 
          blocked_reason: blocked ? reason : null 
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(variables.blocked ? "Usuário bloqueado" : "Usuário desbloqueado");
    },
    onError: (error: Error) => {
      toast.error("Erro: " + error.message);
    },
  });
};

export const useAdjustBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      amount, 
      type 
    }: { 
      userId: string; 
      amount: number; 
      type: "add" | "subtract" 
    }) => {
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("balance, user_id")
        .eq("id", userId)
        .single();

      if (fetchError) throw fetchError;

      const newBalance = type === "add" 
        ? Number(profile.balance) + amount 
        : Number(profile.balance) - amount;

      if (newBalance < 0) {
        throw new Error("Saldo não pode ser negativo");
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Log transaction
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: profile.user_id,
          type: "adjustment",
          amount: type === "add" ? amount : -amount,
          balance_before: profile.balance,
          balance_after: newBalance,
          status: "completed",
        });

      if (transactionError) throw transactionError;

      return { newBalance };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Saldo ajustado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao ajustar saldo: " + error.message);
    },
  });
};
