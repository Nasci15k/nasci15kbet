import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Gift, Search } from "lucide-react";
import { toast } from "sonner";

interface Bonus {
  id: string;
  name: string;
  description: string | null;
  type: string;
  value: number;
  value_type: string | null;
  code: string | null;
  min_deposit: number | null;
  max_bonus: number | null;
  wagering_requirement: number | null;
  valid_days: number | null;
  is_active: boolean;
  max_uses: number | null;
  current_uses: number | null;
}

const Bonuses = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBonus, setEditingBonus] = useState<Bonus | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "deposit",
    value: 100,
    value_type: "percent",
    code: "",
    min_deposit: 50,
    max_bonus: 500,
    wagering_requirement: 35,
    valid_days: 7,
    is_active: true,
    max_uses: null as number | null,
  });

  const { data: bonuses, isLoading } = useQuery({
    queryKey: ["bonuses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bonuses").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Bonus[];
    },
  });

  const createBonus = useMutation({
    mutationFn: async (bonus: Omit<Bonus, "id" | "current_uses">) => {
      const { data, error } = await supabase.from("bonuses").insert([bonus]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonuses"] });
      toast.success("Bônus criado com sucesso!");
      setModalOpen(false);
      resetForm();
    },
  });

  const updateBonus = useMutation({
    mutationFn: async ({ id, ...bonus }: Partial<Bonus> & { id: string }) => {
      const { data, error } = await supabase.from("bonuses").update(bonus).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonuses"] });
      toast.success("Bônus atualizado!");
      setModalOpen(false);
      resetForm();
    },
  });

  const deleteBonus = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bonuses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonuses"] });
      toast.success("Bônus deletado!");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "deposit",
      value: 100,
      value_type: "percent",
      code: "",
      min_deposit: 50,
      max_bonus: 500,
      wagering_requirement: 35,
      valid_days: 7,
      is_active: true,
      max_uses: null,
    });
    setEditingBonus(null);
  };

  const handleEdit = (bonus: Bonus) => {
    setEditingBonus(bonus);
    setFormData({
      name: bonus.name,
      description: bonus.description || "",
      type: bonus.type,
      value: bonus.value,
      value_type: bonus.value_type || "percent",
      code: bonus.code || "",
      min_deposit: bonus.min_deposit || 0,
      max_bonus: bonus.max_bonus || 0,
      wagering_requirement: bonus.wagering_requirement || 35,
      valid_days: bonus.valid_days || 7,
      is_active: bonus.is_active,
      max_uses: bonus.max_uses,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editingBonus) {
      updateBonus.mutate({ id: editingBonus.id, ...formData });
    } else {
      createBonus.mutate(formData as any);
    }
  };

  const filteredBonuses = bonuses?.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Bônus</h2>
            <p className="text-muted-foreground">Gerencie os bônus do cassino</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Bônus
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar bônus..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Rollover</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredBonuses?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Nenhum bônus encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBonuses?.map((bonus) => (
                    <TableRow key={bonus.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-primary" />
                          <span className="font-medium">{bonus.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{bonus.type}</TableCell>
                      <TableCell className="text-primary font-bold">
                        {bonus.value}{bonus.value_type === "percent" ? "%" : " BRL"}
                      </TableCell>
                      <TableCell>
                        {bonus.code ? (
                          <code className="px-2 py-1 bg-secondary rounded text-xs">
                            {bonus.code}
                          </code>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{bonus.wagering_requirement}x</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            bonus.is_active
                              ? "bg-green-500/20 text-green-500"
                              : "bg-red-500/20 text-red-500"
                          }`}
                        >
                          {bonus.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(bonus)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Deletar este bônus?")) {
                                deleteBonus.mutate(bonus.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingBonus ? "Editar Bônus" : "Novo Bônus"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Bônus de Boas-Vindas"
              />
            </div>
            <div className="space-y-2">
              <Label>Código (opcional)</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="BEMVINDO100"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do bônus..."
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="deposit">Depósito</option>
                <option value="signup">Cadastro</option>
                <option value="reload">Recarga</option>
                <option value="cashback">Cashback</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Valor</Label>
              <select
                value={formData.value_type}
                onChange={(e) => setFormData({ ...formData, value_type: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="percent">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Depósito Mínimo</Label>
              <Input
                type="number"
                value={formData.min_deposit || ""}
                onChange={(e) => setFormData({ ...formData, min_deposit: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Bônus Máximo</Label>
              <Input
                type="number"
                value={formData.max_bonus || ""}
                onChange={(e) => setFormData({ ...formData, max_bonus: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Rollover (x)</Label>
              <Input
                type="number"
                value={formData.wagering_requirement || ""}
                onChange={(e) =>
                  setFormData({ ...formData, wagering_requirement: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Validade (dias)</Label>
              <Input
                type="number"
                value={formData.valid_days || ""}
                onChange={(e) => setFormData({ ...formData, valid_days: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Bônus Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Bonuses;
