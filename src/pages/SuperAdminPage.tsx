import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
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
import { Plus, Store, Trash2, Edit, Eye } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Shop = Tables<"shops">;

export default function SuperAdminPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editShop, setEditShop] = useState<Shop | null>(null);

  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const fetchShops = async () => {
    const { data } = await supabase.from("shops").select("*").order("created_at", { ascending: false });
    setShops(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchShops(); }, []);

  const resetForm = () => {
    setShopName(""); setOwnerName(""); setPhone("");
    setAdminEmail(""); setAdminPassword("");
    setEditShop(null);
  };

  const handleCreateShop = async () => {
    if (!shopName.trim() || !ownerName.trim()) {
      toast({ title: "Xato", description: "Do'kon nomi va egasi kiritilishi kerak", variant: "destructive" });
      return;
    }

    const { data: shop, error } = await supabase
      .from("shops")
      .insert({ name: shopName.trim(), owner_name: ownerName.trim(), phone: phone.trim() })
      .select()
      .single();

    if (error || !shop) {
      toast({ title: "Xato", description: error?.message || "Do'kon yaratilmadi", variant: "destructive" });
      return;
    }

    // Create shop admin user if email provided
    if (adminEmail.trim() && adminPassword.trim()) {
      const { data: result, error: fnError } = await supabase.functions.invoke("create-shop-user", {
        body: {
          email: adminEmail.trim(),
          password: adminPassword.trim(),
          shopId: shop.id,
          displayName: ownerName.trim(),
        },
      });

      if (fnError || result?.error) {
        toast({
          title: "Ogohlantirish",
          description: `Do'kon yaratildi, lekin admin: ${fnError?.message || result?.error}`,
          variant: "destructive",
        });
      } else {
        toast({ title: "Muvaffaqiyat", description: `${shopName} va admin yaratildi` });
      }
    } else {
      toast({ title: "Muvaffaqiyat", description: `${shopName} yaratildi` });
    }

    resetForm();
    setDialogOpen(false);
    fetchShops();
  };

  const handleEditShop = async () => {
    if (!editShop) return;
    const { error } = await supabase
      .from("shops")
      .update({ name: shopName.trim(), owner_name: ownerName.trim(), phone: phone.trim() })
      .eq("id", editShop.id);

    if (error) {
      toast({ title: "Xato", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Muvaffaqiyat", description: "Do'kon yangilandi" });
    }
    resetForm();
    setDialogOpen(false);
    fetchShops();
  };

  // const handleDeleteShop = async (shopId: string) => {
  //   const { error } = await supabase.from("shops").delete().eq("id", shopId);
  //   if (error) {
  //     toast({ title: "Xato", description: error.message, variant: "destructive" });
  //   } else {
  //     toast({ title: "O'chirildi", description: "Do'kon o'chirildi" });
  //     fetchShops();
  //   }
  // };

  const handleDeleteShop = async (shopId: string) => {
    const { data, error } = await supabase.functions.invoke("delete-shop", {
      body: { shopId },
    })

    if (error || data?.error) {
      toast({
        title: "Xato",
        description: error?.message || data?.error,
        variant: "destructive",
      })
    } else {
      toast({ title: "O'chirildi", description: "Do'kon to‘liq o‘chirildi" })
      fetchShops()
    }
  };

  const openEdit = (shop: Shop) => {
    setEditShop(shop);
    setShopName(shop.name);
    setOwnerName(shop.owner_name);
    setPhone(shop.phone);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Do'konlar boshqaruvi</h2>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-none">
              <Plus className="h-4 w-4 mr-1" /> Yangi do'kon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editShop ? "Do'konni tahrirlash" : "Yangi do'kon yaratish"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Do'kon nomi *</Label>
                <Input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Do'kon nomi" />
              </div>
              <div>
                <Label>Egasi ismi *</Label>
                <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Egasi ismi" />
              </div>
              <div>
                <Label>Telefon</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 XX XXX XX XX" />
              </div>
              {!editShop && (
                <>
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Admin uchun login</p>
                  </div>
                  <div>
                    <Label>Admin email</Label>
                    <Input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@shop.com" />
                  </div>
                  <div>
                    <Label>Admin parol</Label>
                    <Input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Kamida 6 belgi" />
                  </div>
                </>
              )}
              <Button
                onClick={editShop ? handleEditShop : handleCreateShop}
                className="w-full gradient-primary border-none"
              >
                {editShop ? "Saqlash" : "Yaratish"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Yuklanmoqda...</p>
        ) : shops.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Store className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Hali do'konlar yo'q</p>
            </CardContent>
          </Card>
        ) : (
          shops.map((shop) => (
            <Card key={shop.id} className="shadow-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
                    <Store className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{shop.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {shop.owner_name} · {shop.phone || "Tel. yo'q"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(shop)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Do'konni o'chirish</AlertDialogTitle>
                        <AlertDialogDescription>
                          {shop.name} va uning barcha ma'lumotlarini o'chirmoqchimisiz?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteShop(shop.id)} className="bg-destructive text-destructive-foreground">
                          O'chirish
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
