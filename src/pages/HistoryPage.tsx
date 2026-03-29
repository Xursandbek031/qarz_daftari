import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { formatMoney, formatDateTime } from "@/lib/format";
import { ArrowUpRight, ArrowDownLeft, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function HistoryPage() {
  const { transactions, clients } = useStore();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const clientMap = useMemo(() => {
    const map: Record<string, string> = {};
    clients.forEach((c) => (map[c.id] = c.name));
    return map;
  }, [clients]);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      const txDate = tx.date.slice(0, 10);
      if (dateFrom && txDate < dateFrom) return false;
      if (dateTo && txDate > dateTo) return false;
      return true;
    });
  }, [transactions, typeFilter, dateFrom, dateTo]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Tarix</h2>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtr</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Turi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barchasi</SelectItem>
                <SelectItem value="debt">Qarzlar</SelectItem>
                <SelectItem value="payment">To'lovlar</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="Dan" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="Gacha" />
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Amallar ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Amallar topilmadi</p>
          ) : (
            filtered.map((tx) => (
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
                    <p className="text-sm font-medium">{clientMap[tx.clientId] || "Noma'lum"}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.type === "debt" ? "Qarz" : "To'lov"}
                      {tx.note ? ` · ${tx.note}` : ""} · {formatDateTime(tx.date)}
                    </p>
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
  );
}
