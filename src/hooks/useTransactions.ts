import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Transaction {
  id: string;
  user_id: string;
  type: "deposit" | "withdrawal" | "bet" | "win" | "bonus" | "refund" | "adjustment";
  amount: number;
  balance_before: number | null;
  balance_after: number | null;
  status: "pending" | "completed" | "failed" | "cancelled";
  reference_id: string | null;
  game_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  payment_method_id: string | null;
  pix_code: string | null;
  qr_code: string | null;
  external_id: string | null;
  fee: number;
  created_at: string;
  confirmed_at: string | null;
  expires_at: string | null;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  payment_method_id: string | null;
  pix_key: string | null;
  pix_key_type: string | null;
  fee: number;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  rejected_reason: string | null;
}

export const useTransactions = (userId?: string) => {
  return useQuery({
    queryKey: ["transactions", userId],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Transaction[];
    },
  });
};

export const useDeposits = (userId?: string) => {
  return useQuery({
    queryKey: ["deposits", userId],
    queryFn: async () => {
      let query = supabase
        .from("deposits")
        .select("*")
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Deposit[];
    },
  });
};

export const useWithdrawals = (userId?: string) => {
  return useQuery({
    queryKey: ["withdrawals", userId],
    queryFn: async () => {
      let query = supabase
        .from("withdrawals")
        .select("*")
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Withdrawal[];
    },
  });
};

export const useApproveWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("withdrawals")
        .update({
          status: "completed",
          approved_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      toast.success("Saque aprovado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao aprovar saque: " + error.message);
    },
  });
};

export const useRejectWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      // First get the withdrawal info
      const { data: withdrawal, error: fetchError } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Update withdrawal status
      const { error: updateError } = await supabase
        .from("withdrawals")
        .update({
          status: "cancelled",
          rejected_reason: reason,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // Refund user balance
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("user_id", withdrawal.user_id)
        .single();

      if (profileError) throw profileError;

      const { error: balanceError } = await supabase
        .from("profiles")
        .update({
          balance: Number(profile.balance) + Number(withdrawal.amount),
        })
        .eq("user_id", withdrawal.user_id);

      if (balanceError) throw balanceError;

      return withdrawal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Saque rejeitado e saldo devolvido!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao rejeitar saque: " + error.message);
    },
  });
};
