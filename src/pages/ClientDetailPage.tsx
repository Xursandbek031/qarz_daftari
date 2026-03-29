import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { formatMoney, formatDateTime } from "@/lib/format";
import { ArrowLeft, Plus, Minus, Trash2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClient, getClientTransactions, addDebt, addPayment, deleteClient, DEBT_LIMIT, loading } = useStore();
  const { toast } = useToast();

  const client = getClient(id!);
  const transactions = getClientTransactions(id!);

  const [debtOpen, setDebtOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Yuklanmoqda...</div>;
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Mijoz topilmadi</p>
        <Button variant="ghost" onClick={() => navigate("/clients")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Orqaga
        </Button>
      </div>
    );
  }

  const handleAddDebt = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast({ title: "Xato", description: "To'g'ri summa kiriting", variant: "destructive" });
      return;
    }
    setSaving(true);
    await addDebt(client.id, val, note.trim());
    if (client.totalDebt + val >= DEBT_LIMIT) {
      toast({ title: "⚠️ Ogohlantirish", description: `${client.name} ning qarzi ${formatMoney(DEBT_LIMIT)} dan oshdi!`, variant: "destructive" });
    } else {
      toast({ title: "Qarz qo'shildi", description: `${formatMoney(val)} qarz yozildi` });
    }
    setAmount(""); setNote(""); setDebtOpen(false); setSaving(false);
  };

  const handlePayment = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast({ title: "Xato", description: "To'g'ri summa kiriting", variant: "destructive" });
      return;
    }
    setSaving(true);
    await addPayment(client.id, val);
    toast({ title: "To'lov qabul qilindi", description: `${formatMoney(val)} to'lov yozildi` });
    setAmount(""); setPaymentOpen(false); setSaving(false);
  };

  const handleDelete = async () => {
    await deleteClient(client.id);
    toast({ title: "O'chirildi", description: `${client.name} o'chirildi` });
    navigate("/clients");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{client.name}</h2>
          <p className="text-sm text-muted-foreground">{client.phone || "Telefon yo'q"}</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive">
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mijozni o'chirish</AlertDialogTitle>
              <AlertDialogDescription>
                {client.name} va uning barcha amallarini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                O'chirish
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className={`shadow-elevated ${client.totalDebt >= DEBT_LIMIT ? "gradient-danger" : "gradient-primary"} border-none`}>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-primary-foreground/70">Jami qarz</p>
          <p className="text-3xl font-bold text-primary-foreground mt-1">{formatMoney(client.totalDebt)}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Dialog open={debtOpen} onOpenChange={(o) => { setDebtOpen(o); if (!o) { setAmount(""); setNote(""); } }}>
          <DialogTrigger asChild>
            <Button className="h-12 gradient-danger border-none text-destructive-foreground">
              <Plus className="h-4 w-4 mr-2" /> Qarz qo'shish
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Qarz qo'shish</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Summa *</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100000" /></div>
              <div><Label>Izoh</Label><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Non, sut, ..." /></div>
              <Button onClick={handleAddDebt} className="w-full gradient-danger border-none" disabled={saving}>
                {saving ? "Saqlanmoqda..." : "Qarz yozish"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={paymentOpen} onOpenChange={(o) => { setPaymentOpen(o); if (!o) setAmount(""); }}>
          <DialogTrigger asChild>
            <Button className="h-12 gradient-primary border-none">
              <Minus className="h-4 w-4 mr-2" /> To'lov qilish
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>To'lov qilish</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Summa *</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50000" /></div>
              <Button onClick={handlePayment} className="w-full gradient-primary border-none" disabled={saving}>
                {saving ? "Saqlanmoqda..." : "To'lov yozish"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3"><CardTitle className="text-base">Amallar tarixi</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Hali amallar yo'q</p>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.type === "debt" ? "bg-destructive/10" : "bg-success/10"}`}>
                    {tx.type === "debt" ? <ArrowUpRight className="h-4 w-4 text-destructive" /> : <ArrowDownLeft className="h-4 w-4 text-success" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.type === "debt" ? "Qarz" : "To'lov"}</p>
                    <p className="text-xs text-muted-foreground">{tx.note ? `${tx.note} · ` : ""}{formatDateTime(tx.date)}</p>
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
