import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUsers } from "@/hooks/useUsers";
import { useAllGames } from "@/hooks/useGames";
import { useDeposits, useWithdrawals } from "@/hooks/useTransactions";
import { Users, Gamepad2, CreditCard, TrendingUp, DollarSign, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const { data: users } = useUsers();
  const { data: games } = useAllGames();
  const { data: deposits } = useDeposits();
  const { data: withdrawals } = useWithdrawals();

  const totalDeposits = deposits?.reduce((acc, d) => d.status === "completed" ? acc + Number(d.amount) : acc, 0) || 0;
  const totalWithdrawals = withdrawals?.reduce((acc, w) => w.status === "completed" ? acc + Number(w.amount) : acc, 0) || 0;
  const pendingWithdrawals = withdrawals?.filter((w) => w.status === "pending").length || 0;
  const totalUsers = users?.length || 0;
  const totalGames = games?.length || 0;

  const stats = [
    {
      title: "Total de Usuários",
      value: totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Jogos Ativos",
      value: totalGames.toLocaleString(),
      icon: Gamepad2,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Total Depósitos",
      value: `R$ ${totalDeposits.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Saques",
      value: `R$ ${totalWithdrawals.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: CreditCard,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Lucro Líquido",
      value: `R$ ${(totalDeposits - totalWithdrawals).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Saques Pendentes",
      value: pendingWithdrawals.toLocaleString(),
      icon: AlertCircle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral do seu cassino</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Últimos Depósitos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deposits?.slice(0, 5).map((deposit) => (
                  <div key={deposit.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        deposit.status === "completed" ? "bg-green-500" :
                        deposit.status === "pending" ? "bg-yellow-500" : "bg-red-500"
                      }`} />
                      <span className="text-sm text-muted-foreground">
                        {new Date(deposit.created_at).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <span className="font-medium text-green-500">
                      +R$ {Number(deposit.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
                {(!deposits || deposits.length === 0) && (
                  <p className="text-sm text-muted-foreground">Nenhum depósito ainda</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimos Saques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {withdrawals?.slice(0, 5).map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        withdrawal.status === "completed" ? "bg-green-500" :
                        withdrawal.status === "pending" ? "bg-yellow-500" : "bg-red-500"
                      }`} />
                      <span className="text-sm text-muted-foreground">
                        {new Date(withdrawal.created_at).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <span className="font-medium text-red-500">
                      -R$ {Number(withdrawal.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
                {(!withdrawals || withdrawals.length === 0) && (
                  <p className="text-sm text-muted-foreground">Nenhum saque ainda</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
