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
import { useUsers, useBlockUser, useAdjustBalance } from "@/hooks/useUsers";
import { Search, Ban, DollarSign, Eye } from "lucide-react";
import { toast } from "sonner";

const Users = () => {
  const { data: users, isLoading } = useUsers();
  const blockUser = useBlockUser();
  const adjustBalance = useAdjustBalance();

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [balanceModal, setBalanceModal] = useState(false);
  const [blockModal, setBlockModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustType, setAdjustType] = useState<"add" | "subtract">("add");
  const [blockReason, setBlockReason] = useState("");

  const filteredUsers = users?.filter(
    (user) =>
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdjustBalance = async () => {
    if (!selectedUser || !adjustAmount) return;
    
    await adjustBalance.mutateAsync({
      userId: selectedUser.id,
      amount: Number(adjustAmount),
      type: adjustType,
    });
    
    setBalanceModal(false);
    setAdjustAmount("");
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;
    
    await blockUser.mutateAsync({
      id: selectedUser.id,
      blocked: !selectedUser.is_blocked,
      reason: blockReason,
    });
    
    setBlockModal(false);
    setBlockReason("");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Usuários</h2>
            <p className="text-muted-foreground">Gerencie todos os usuários</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por email ou nome..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Saldo Bônus</TableHead>
                  <TableHead>Total Depositado</TableHead>
                  <TableHead>VIP</TableHead>
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
                ) : filteredUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name || "Sem nome"}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-green-500">
                        R$ {Number(user.balance).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-primary">
                        R$ {Number(user.bonus_balance).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        R$ {Number(user.total_deposited).toFixed(2)}
                      </TableCell>
                      <TableCell>Nível {user.vip_level}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.is_blocked
                              ? "bg-red-500/20 text-red-500"
                              : "bg-green-500/20 text-green-500"
                          }`}
                        >
                          {user.is_blocked ? "Bloqueado" : "Ativo"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setBalanceModal(true);
                            }}
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setBlockModal(true);
                            }}
                          >
                            <Ban className="h-4 w-4" />
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

      {/* Balance Modal */}
      <Dialog open={balanceModal} onOpenChange={setBalanceModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Saldo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Usuário: {selectedUser?.email}
              </p>
              <p className="text-sm text-muted-foreground">
                Saldo atual: R$ {Number(selectedUser?.balance || 0).toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <div className="flex gap-2">
                <Button
                  variant={adjustType === "add" ? "default" : "outline"}
                  onClick={() => setAdjustType("add")}
                  className="flex-1"
                >
                  Adicionar
                </Button>
                <Button
                  variant={adjustType === "subtract" ? "default" : "outline"}
                  onClick={() => setAdjustType("subtract")}
                  className="flex-1"
                >
                  Remover
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBalanceModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdjustBalance}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Modal */}
      <Dialog open={blockModal} onOpenChange={setBlockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.is_blocked ? "Desbloquear" : "Bloquear"} Usuário
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Usuário: {selectedUser?.email}
            </p>
            {!selectedUser?.is_blocked && (
              <div className="space-y-2">
                <Label>Motivo do bloqueio</Label>
                <Input
                  placeholder="Digite o motivo..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockModal(false)}>
              Cancelar
            </Button>
            <Button
              variant={selectedUser?.is_blocked ? "default" : "destructive"}
              onClick={handleBlockUser}
            >
              {selectedUser?.is_blocked ? "Desbloquear" : "Bloquear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Users;
