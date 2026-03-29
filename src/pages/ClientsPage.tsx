import { useState } from "react";
import { useStore } from "@/lib/store";
import { formatMoney } from "@/lib/format";
import { Link } from "react-router-dom";
import { Search, Plus, UserCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ClientsPage() {
  const { clients, addClient, DEBT_LIMIT, loading } = useStore();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!name.trim()) {
      toast({ title: "Xato", description: "Ism kiriting", variant: "destructive" });
      return;
    }
    setSaving(true);
    await addClient(name.trim(), phone.trim(), address.trim());
    toast({ title: "Muvaffaqiyat", description: `${name} qo'shildi` });
    setName(""); setPhone(""); setAddress("");
    setDialogOpen(false);
    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mijozlar</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-none">
              <Plus className="h-4 w-4 mr-1" /> Yangi mijoz
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yangi mijoz qo'shish</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Ism *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mijoz ismi" />
              </div>
              <div>
                <Label>Telefon</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 XX XXX XX XX" />
              </div>
              <div>
                <Label>Manzil</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Manzil (ixtiyoriy)" />
              </div>
              <Button onClick={handleAdd} className="w-full gradient-primary border-none" disabled={saving}>
                {saving ? "Saqlanmoqda..." : "Qo'shish"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Mijoz qidirish..." className="pl-10" />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UserCircle className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">{search ? "Mijoz topilmadi" : "Hali mijozlar yo'q"}</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((client) => (
            <Link key={client.id} to={`/clients/${client.id}`}>
              <Card className="hover:shadow-elevated transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{client.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.phone || "Telefon yo'q"}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${client.totalDebt >= DEBT_LIMIT ? "text-destructive" : client.totalDebt > 0 ? "text-foreground" : "text-success"}`}>
                    {formatMoney(client.totalDebt)}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
