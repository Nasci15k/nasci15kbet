import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const Withdraw = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  
  const [amount, setAmount] = useState("");
  const [pixKeyType, setPixKeyType] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleWithdraw = async () => {
    if (!user || !profile) {
      navigate("/auth");
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount < 20) {
      toast.error("Valor mínimo de saque é R$ 20,00");
      return;
    }

    if (withdrawAmount > (profile.balance || 0)) {
      toast.error("Saldo insuficiente");
      return;
    }

    if (!pixKeyType || !pixKey) {
      toast.error("Preencha os dados do PIX");
      return;
    }

    setIsLoading(true);
    try {
      // Create withdrawal record
      const { error: withdrawError } = await supabase
        .from("withdrawals")
        .insert({
          user_id: user.id,
          amount: withdrawAmount,
          status: "pending",
          pix_key_type: pixKeyType,
          pix_key: pixKey,
        });

      if (withdrawError) throw withdrawError;

      // Update user balance
      const { error: balanceError } = await supabase
        .from("profiles")
        .update({ 
          balance: (profile.balance || 0) - withdrawAmount 
        })
        .eq("user_id", user.id);

      if (balanceError) throw balanceError;

      await refreshProfile();
      setIsSuccess(true);
      toast.success("Saque solicitado com sucesso!");
    } catch (error: any) {
      console.error("Withdraw error:", error);
      toast.error("Erro ao solicitar saque: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !profile) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-lg mx-auto space-y-6">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => navigate("/wallet")}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        <h1 className="text-3xl font-bold">Sacar</h1>

        {/* Balance Card */}
        <Card className="border-accent/50 bg-accent/10">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Saldo disponível</p>
            <p className="text-3xl font-bold text-accent">
              R$ {(profile.balance || 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {!isSuccess ? (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Dados do Saque</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-xl h-12"
                />
                <p className="text-sm text-muted-foreground">
                  Mínimo: R$ 20,00
                </p>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Chave PIX</Label>
                <Select value={pixKeyType} onValueChange={setPixKeyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Telefone</SelectItem>
                    <SelectItem value="random">Chave Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pixKey">Chave PIX</Label>
                <Input
                  id="pixKey"
                  type="text"
                  placeholder="Digite sua chave PIX"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                />
              </div>

              <Button
                className="w-full h-12 text-lg"
                onClick={handleWithdraw}
                disabled={isLoading || !amount || !pixKeyType || !pixKey}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Solicitar Saque"
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-accent/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <CheckCircle className="w-5 h-5" />
                Saque Solicitado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="py-8">
                <CheckCircle className="w-16 h-16 mx-auto text-accent mb-4" />
                <p className="text-xl font-semibold">
                  R$ {parseFloat(amount).toFixed(2)}
                </p>
                <p className="text-muted-foreground mt-2">
                  Seu saque foi solicitado com sucesso!
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 text-left">
                <p className="text-sm text-muted-foreground">Chave PIX</p>
                <p className="font-mono">{pixKey}</p>
              </div>

              <Button
                className="w-full"
                onClick={() => navigate("/wallet")}
              >
                Voltar à Carteira
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="border-border/50 bg-secondary/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-casino-gold mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Importante</h3>
                <p className="text-sm text-muted-foreground">
                  Saques são processados em até 24 horas. A chave PIX deve estar em seu nome.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Withdraw;