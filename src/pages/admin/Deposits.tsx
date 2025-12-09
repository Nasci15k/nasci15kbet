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
import { useDeposits } from "@/hooks/useTransactions";
import { Search, Clock, CheckCircle, XCircle } from "lucide-react";

const Deposits = () => {
  const { data: deposits, isLoading } = useDeposits();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "failed">("all");

  const filteredDeposits = deposits?.filter((d) => {
    if (filter !== "all" && d.status !== filter) return false;
    return true;
  });

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
            Confirmado
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-500 text-xs">
            <XCircle className="h-3 w-3" />
            Falhou
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
          <h2 className="text-2xl font-bold text-foreground">Depósitos</h2>
          <p className="text-muted-foreground">Visualize todos os depósitos</p>
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
                {(["all", "pending", "completed", "failed"] as const).map((status) => (
                  <Button
                    key={status}
                    variant={filter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(status)}
                  >
                    {status === "all" && "Todos"}
                    {status === "pending" && "Pendentes"}
                    {status === "completed" && "Confirmados"}
                    {status === "failed" && "Falhos"}
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
                  <TableHead>Taxa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Confirmado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredDeposits?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Nenhum depósito encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeposits?.map((deposit) => (
                    <TableRow key={deposit.id}>
                      <TableCell>
                        {new Date(deposit.created_at).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {deposit.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-bold text-green-500">
                        R$ {Number(deposit.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        R$ {Number(deposit.fee).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(deposit.status || "pending")}</TableCell>
                      <TableCell>
                        {deposit.confirmed_at
                          ? new Date(deposit.confirmed_at).toLocaleString("pt-BR")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Deposits;
