import { useStore } from "@/lib/store";
import { formatMoney, formatDateTime } from "@/lib/format";
import { Link } from "react-router-dom";
import { TrendingUp, CalendarPlus, AlertTriangle, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { totalDebt, todayDebt, topDebtors, recentTransactions, highDebtClients, clients, DEBT_LIMIT, loading } = useStore();

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Bosh sahifa</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="gradient-primary border-none shadow-elevated">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-foreground/70">Jami qarz</p>
                <p className="text-2xl font-bold text-primary-foreground mt-1">{formatMoney(totalDebt)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bugungi qarzlar</p>
                <p className="text-2xl font-bold text-foreground mt-1">{formatMoney(todayDebt)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <CalendarPlus className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mijozlar soni</p>
                <p className="text-2xl font-bold text-foreground mt-1">{clients.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning */}
      {highDebtClients.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Ogohlantirish</p>
              <p className="text-sm text-muted-foreground">
                {highDebtClients.length} ta mijozning qarzi {formatMoney(DEBT_LIMIT)} dan oshgan:{" "}
                {highDebtClients.map((c) => c.name).join(", ")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top debtors */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top qarzdorlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topDebtors.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Hali mijozlar yo'q</p>
            ) : (
              topDebtors.map((client, i) => (
                <Link
                  key={client.id}
                  to={`/clients/${client.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <span className="font-medium text-sm">{client.name}</span>
                  </div>
                  <span className={`text-sm font-semibold ${client.totalDebt >= DEBT_LIMIT ? "text-destructive" : "text-foreground"}`}>
                    {formatMoney(client.totalDebt)}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent transactions */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">So'nggi amallar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Hali amallar yo'q</p>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.type === "debt" ? "bg-destructive/10" : "bg-success/10"}`}>
                      {tx.type === "debt" ? (
                        <ArrowUpRight className="h-4 w-4 text-destructive" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-success" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.type === "debt" ? "Qarz" : "To'lov"}</p>
                      <p className="text-xs text-muted-foreground">{tx.note || formatDateTime(tx.date)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === "debt" ? "text-destructive" : "text-success"}`}>
                    {tx.type === "debt" ? "+" : "-"}{formatMoney(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
