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
import { Textarea } from "@/components/ui/textarea";
import { useWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from "@/hooks/useTransactions";
import { Check, X, Search, Clock, CheckCircle, XCircle } from "lucide-react";

const Withdrawals = () => {
  const { data: withdrawals, isLoading } = useWithdrawals();
  const approveWithdrawal = useApproveWithdrawal();
  const rejectWithdrawal = useRejectWithdrawal();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "cancelled">("all");
  const [rejectModal, setRejectModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filteredWithdrawals = withdrawals?.filter((w) => {
    if (filter !== "all" && w.status !== filter) return false;
    return true;
  });

  const handleApprove = async (id: string) => {
    if (confirm("Confirmar aprovação deste saque?")) {
      await approveWithdrawal.mutateAsync(id);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal || !rejectReason) return;
    
    await rejectWithdrawal.mutateAsync({
      id: selectedWithdrawal.id,
      reason: rejectReason,
    });
    
    setRejectModal(false);
    setRejectReason("");
    setSelectedWithdrawal(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs">
            <Clock className="h-3 w-3" />
            Pendente
          </span>
        );
      case "completed":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs">
            <CheckCircle className="h-3 w-3" />
            Aprovado
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-500 text-xs">
            <XCircle className="h-3 w-3" />
            Rejeitado
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Saques</h2>
          <p className="text-muted-foreground">Gerencie as solicitações de saque</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                {(["all", "pending", "completed", "cancelled"] as const).map((status) => (
                  <Button
                    key={status}
                    variant={filter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(status)}
                  >
                    {status === "all" && "Todos"}
                    {status === "pending" && "Pendentes"}
                    {status === "completed" && "Aprovados"}
                    {status === "cancelled" && "Rejeitados"}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Chave PIX</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredWithdrawals?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Nenhum saque encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWithdrawals?.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        {new Date(withdrawal.created_at).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {withdrawal.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-bold text-red-500">
                        R$ {Number(withdrawal.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-muted-foreground">{withdrawal.pix_key_type}</p>
                          <p className="font-mono">{withdrawal.pix_key}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(withdrawal.status || "pending")}</TableCell>
                      <TableCell>
                        {withdrawal.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-500 hover:text-green-600"
                              onClick={() => handleApprove(withdrawal.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setRejectModal(true);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {withdrawal.status === "cancelled" && withdrawal.rejected_reason && (
                          <span className="text-xs text-muted-foreground">
                            {withdrawal.rejected_reason}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Reject Modal */}
      <Dialog open={rejectModal} onOpenChange={setRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Saque</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Valor: R$ {Number(selectedWithdrawal?.amount || 0).toFixed(2)}
            </p>
            <div className="space-y-2">
              <Label>Motivo da Rejeição</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Informe o motivo da rejeição..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Rejeitar e Devolver Saldo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Withdrawals;
