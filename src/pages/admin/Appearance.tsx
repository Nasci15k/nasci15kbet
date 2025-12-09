import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppearanceSettings, useUpdateAppearanceSettings } from "@/hooks/useSettings";
import { Save, Palette, Type, Image, Code, Globe } from "lucide-react";

const Appearance = () => {
  const { data: settings, isLoading } = useAppearanceSettings();
  const updateSettings = useUpdateAppearanceSettings();

  const [formData, setFormData] = useState({
    site_name: "Nasci15kBet",
    site_logo: "",
    site_favicon: "",
    primary_color: "#F59E0B",
    secondary_color: "#10B981",
    accent_color: "#8B5CF6",
    background_color: "#0A0E1A",
    header_color: "#0F1629",
    sidebar_color: "#0F1629",
    font_family: "Outfit",
    footer_text: "",
    custom_css: "",
    custom_js: "",
    maintenance_mode: false,
    maintenance_message: "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        site_name: settings.site_name || "Nasci15kBet",
        site_logo: settings.site_logo || "",
        site_favicon: settings.site_favicon || "",
        primary_color: settings.primary_color || "#F59E0B",
        secondary_color: settings.secondary_color || "#10B981",
        accent_color: settings.accent_color || "#8B5CF6",
        background_color: settings.background_color || "#0A0E1A",
        header_color: settings.header_color || "#0F1629",
        sidebar_color: settings.sidebar_color || "#0F1629",
        font_family: settings.font_family || "Outfit",
        footer_text: settings.footer_text || "",
        custom_css: settings.custom_css || "",
        custom_js: settings.custom_js || "",
        maintenance_mode: settings.maintenance_mode || false,
        maintenance_message: settings.maintenance_message || "",
      });
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings.mutateAsync(formData);
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Aparência</h2>
            <p className="text-muted-foreground">Personalize o visual do seu cassino</p>
          </div>
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">
              <Globe className="h-4 w-4 mr-2" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="colors">
              <Palette className="h-4 w-4 mr-2" />
              Cores
            </TabsTrigger>
            <TabsTrigger value="typography">
              <Type className="h-4 w-4 mr-2" />
              Tipografia
            </TabsTrigger>
            <TabsTrigger value="images">
              <Image className="h-4 w-4 mr-2" />
              Imagens
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Code className="h-4 w-4 mr-2" />
              Avançado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Configure as informações básicas do site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Nome do Site</Label>
                  <Input
                    value={formData.site_name}
                    onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                    placeholder="Nome do seu cassino"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Texto do Rodapé</Label>
                  <Textarea
                    value={formData.footer_text}
                    onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                    placeholder="© 2024 Seu Cassino. Todos os direitos reservados."
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <Label>Modo de Manutenção</Label>
                    <p className="text-sm text-muted-foreground">
                      Ative para bloquear acesso temporariamente
                    </p>
                  </div>
                  <Switch
                    checked={formData.maintenance_mode}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, maintenance_mode: checked })
                    }
                  />
                </div>

                {formData.maintenance_mode && (
                  <div className="space-y-2">
                    <Label>Mensagem de Manutenção</Label>
                    <Textarea
                      value={formData.maintenance_message}
                      onChange={(e) =>
                        setFormData({ ...formData, maintenance_message: e.target.value })
                      }
                      placeholder="Estamos em manutenção. Voltamos em breve!"
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle>Cores do Tema</CardTitle>
                <CardDescription>Personalize as cores do seu cassino</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Cor Primária</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) =>
                          setFormData({ ...formData, primary_color: e.target.value })
                        }
                        className="h-10 w-20 rounded cursor-pointer"
                      />
                      <Input
                        value={formData.primary_color}
                        onChange={(e) =>
                          setFormData({ ...formData, primary_color: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cor Secundária</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) =>
                          setFormData({ ...formData, secondary_color: e.target.value })
                        }
                        className="h-10 w-20 rounded cursor-pointer"
                      />
                      <Input
                        value={formData.secondary_color}
                        onChange={(e) =>
                          setFormData({ ...formData, secondary_color: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cor de Destaque</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.accent_color}
                        onChange={(e) =>
                          setFormData({ ...formData, accent_color: e.target.value })
                        }
                        className="h-10 w-20 rounded cursor-pointer"
                      />
                      <Input
                        value={formData.accent_color}
                        onChange={(e) =>
                          setFormData({ ...formData, accent_color: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cor de Fundo</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.background_color}
                        onChange={(e) =>
                          setFormData({ ...formData, background_color: e.target.value })
                        }
                        className="h-10 w-20 rounded cursor-pointer"
                      />
                      <Input
                        value={formData.background_color}
                        onChange={(e) =>
                          setFormData({ ...formData, background_color: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cor do Header</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.header_color}
                        onChange={(e) =>
                          setFormData({ ...formData, header_color: e.target.value })
                        }
                        className="h-10 w-20 rounded cursor-pointer"
                      />
                      <Input
                        value={formData.header_color}
                        onChange={(e) =>
                          setFormData({ ...formData, header_color: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cor da Sidebar</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.sidebar_color}
                        onChange={(e) =>
                          setFormData({ ...formData, sidebar_color: e.target.value })
                        }
                        className="h-10 w-20 rounded cursor-pointer"
                      />
                      <Input
                        value={formData.sidebar_color}
                        onChange={(e) =>
                          setFormData({ ...formData, sidebar_color: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="typography">
            <Card>
              <CardHeader>
                <CardTitle>Tipografia</CardTitle>
                <CardDescription>Configure as fontes do site</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Família da Fonte</Label>
                    <select
                      value={formData.font_family}
                      onChange={(e) => setFormData({ ...formData, font_family: e.target.value })}
                      className="w-full h-10 rounded-md border border-input bg-background px-3"
                    >
                      <option value="Outfit">Outfit</option>
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Montserrat">Montserrat</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Imagens</CardTitle>
                <CardDescription>Configure logo e favicon</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>URL do Logo</Label>
                  <Input
                    type="url"
                    value={formData.site_logo}
                    onChange={(e) => setFormData({ ...formData, site_logo: e.target.value })}
                    placeholder="https://exemplo.com/logo.png"
                  />
                </div>

                <div className="space-y-2">
                  <Label>URL do Favicon</Label>
                  <Input
                    type="url"
                    value={formData.site_favicon}
                    onChange={(e) => setFormData({ ...formData, site_favicon: e.target.value })}
                    placeholder="https://exemplo.com/favicon.ico"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>CSS Personalizado</CardTitle>
                  <CardDescription>Adicione estilos CSS personalizados</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.custom_css}
                    onChange={(e) => setFormData({ ...formData, custom_css: e.target.value })}
                    placeholder=".minha-classe { color: red; }"
                    rows={10}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>JavaScript Personalizado</CardTitle>
                  <CardDescription>Adicione scripts JavaScript personalizados</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.custom_js}
                    onChange={(e) => setFormData({ ...formData, custom_js: e.target.value })}
                    placeholder="console.log('Hello World');"
                    rows={10}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Appearance;
