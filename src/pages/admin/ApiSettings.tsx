import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useApiSettings, useUpdateApiSettings } from "@/hooks/useSettings";
import { Save, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const ApiSettings = () => {
  const { data: apiSettings, isLoading } = useApiSettings();
  const updateApiSettings = useUpdateApiSettings();

  const [showToken, setShowToken] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  
  const [formData, setFormData] = useState({
    provider: "playfivers",
    agent_token: "",
    secret_key: "",
    webhook_url: "",
    is_active: true,
    rtp_default: 97,
  });

  useEffect(() => {
    const playfivers = apiSettings?.find((s) => s.provider === "playfivers");
    if (playfivers) {
      setFormData({
        provider: "playfivers",
        agent_token: playfivers.agent_token || "",
        secret_key: playfivers.secret_key || "",
        webhook_url: playfivers.webhook_url || "",
        is_active: playfivers.is_active,
        rtp_default: playfivers.rtp_default || 97,
      });
    }
  }, [apiSettings]);

  const handleSave = async () => {
    const existing = apiSettings?.find((s) => s.provider === "playfivers");
    
    await updateApiSettings.mutateAsync({
      id: existing?.id,
      ...formData,
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configurações da API</h2>
          <p className="text-muted-foreground">Configure a integração com a Playfivers</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <img 
                src="https://playfivers.com/favicon.ico" 
                alt="Playfivers" 
                className="h-6 w-6"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              Playfivers API
            </CardTitle>
            <CardDescription>
              Configure suas credenciais da API Playfivers para habilitar os jogos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-yellow-500">Importante</p>
                  <p className="text-sm text-muted-foreground">
                    Essas credenciais são necessárias para iniciar jogos e processar transações
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>API Ativa</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilitar ou desabilitar a integração
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Agent Token</Label>
                <div className="relative">
                  <Input
                    type={showToken ? "text" : "password"}
                    placeholder="SEU_TOKEN_DE_AGENTE"
                    value={formData.agent_token}
                    onChange={(e) =>
                      setFormData({ ...formData, agent_token: e.target.value })
                    }
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Secret Key</Label>
                <div className="relative">
                  <Input
                    type={showSecret ? "text" : "password"}
                    placeholder="SUA_CHAVE_SECRETA"
                    value={formData.secret_key}
                    onChange={(e) =>
                      setFormData({ ...formData, secret_key: e.target.value })
                    }
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  type="url"
                  placeholder="https://seusite.com/api/webhook"
                  value={formData.webhook_url}
                  onChange={(e) =>
                    setFormData({ ...formData, webhook_url: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  URL que receberá as notificações de transações da Playfivers
                </p>
              </div>

              <div className="space-y-2">
                <Label>RTP Padrão (%)</Label>
                <Input
                  type="number"
                  min={50}
                  max={100}
                  value={formData.rtp_default}
                  onChange={(e) =>
                    setFormData({ ...formData, rtp_default: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Taxa de retorno ao jogador padrão (50-100%)
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={updateApiSettings.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentação da API</CardTitle>
            <CardDescription>
              Endpoints disponíveis para integração
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <code className="text-sm">
                  <span className="text-green-500">POST</span>{" "}
                  <span className="text-primary">/api/v2/game_launch</span>
                </code>
                <p className="text-sm text-muted-foreground mt-1">
                  Iniciar um jogo para o usuário
                </p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <code className="text-sm">
                  <span className="text-blue-500">GET</span>{" "}
                  <span className="text-primary">/api/v2/games</span>
                </code>
                <p className="text-sm text-muted-foreground mt-1">
                  Listar todos os jogos disponíveis
                </p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <code className="text-sm">
                  <span className="text-blue-500">GET</span>{" "}
                  <span className="text-primary">/api/v2/providers</span>
                </code>
                <p className="text-sm text-muted-foreground mt-1">
                  Listar todos os provedores
                </p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <code className="text-sm">
                  <span className="text-green-500">POST</span>{" "}
                  <span className="text-primary">/api/v2/free_bonus</span>
                </code>
                <p className="text-sm text-muted-foreground mt-1">
                  Conceder rodadas grátis ao jogador
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ApiSettings;
