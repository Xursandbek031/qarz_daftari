import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalDebt: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  clientId: string;
  amount: number;
  type: "debt" | "payment";
  note: string;
  date: string;
}

const DEBT_LIMIT = 1000000;

export function useStore() {
  const { shopId } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!shopId) {
      setClients([]);
      setTransactions([]);
      setLoading(false);
      return;
    }

    const [clientsRes, txRes] = await Promise.all([
      supabase.from("clients").select("*").eq("shop_id", shopId).order("created_at", { ascending: false }),
      supabase.from("transactions").select("*").eq("shop_id", shopId).order("date", { ascending: false }),
    ]);

    setClients(
      (clientsRes.data || []).map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        address: c.address,
        totalDebt: Number(c.total_debt),
        createdAt: c.created_at,
      }))
    );

    setTransactions(
      (txRes.data || []).map((t) => ({
        id: t.id,
        clientId: t.client_id,
        amount: Number(t.amount),
        type: t.type as "debt" | "payment",
        note: t.note,
        date: t.date,
      }))
    );

    setLoading(false);
  }, [shopId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addClient = useCallback(
    async (name: string, phone: string, address: string) => {
      if (!shopId) return null;
      const { data, error } = await supabase
        .from("clients")
        .insert({ name, phone, address, shop_id: shopId })
        .select()
        .single();
      if (data) {
        await fetchData();
        return { id: data.id, name: data.name, phone: data.phone, address: data.address, totalDebt: 0, createdAt: data.created_at };
      }
      return null;
    },
    [shopId, fetchData]
  );

  const deleteClient = useCallback(
    async (id: string) => {
      await supabase.from("transactions").delete().eq("client_id", id);
      await supabase.from("clients").delete().eq("id", id);
      await fetchData();
    },
    [fetchData]
  );

  const addDebt = useCallback(
    async (clientId: string, amount: number, note: string) => {
      if (!shopId) return null;
      const client = clients.find((c) => c.id === clientId);
      if (!client) return null;

      await supabase.from("transactions").insert({
        client_id: clientId,
        shop_id: shopId,
        amount,
        type: "debt",
        note,
      });

      await supabase
        .from("clients")
        .update({ total_debt: client.totalDebt + amount })
        .eq("id", clientId);

      await fetchData();
    },
    [shopId, clients, fetchData]
  );

  const addPayment = useCallback(
    async (clientId: string, amount: number) => {
      if (!shopId) return null;
      const client = clients.find((c) => c.id === clientId);
      if (!client) return null;

      await supabase.from("transactions").insert({
        client_id: clientId,
        shop_id: shopId,
        amount,
        type: "payment",
        note: "",
      });

      await supabase
        .from("clients")
        .update({ total_debt: client.totalDebt - amount })
        .eq("id", clientId);

      await fetchData();
    },
    [shopId, clients, fetchData]
  );

  const getClient = useCallback((id: string) => clients.find((c) => c.id === id), [clients]);

  const getClientTransactions = useCallback(
    (clientId: string) => transactions.filter((t) => t.clientId === clientId),
    [transactions]
  );

  const totalDebt = clients.reduce((sum, c) => sum + c.totalDebt, 0);

  const todayDebt = transactions
    .filter((t) => t.type === "debt" && t.date.startsWith(new Date().toISOString().slice(0, 10)))
    .reduce((sum, t) => sum + t.amount, 0);

  const topDebtors = [...clients].sort((a, b) => b.totalDebt - a.totalDebt).slice(0, 5);

  const recentTransactions = transactions.slice(0, 10);

  const highDebtClients = clients.filter((c) => c.totalDebt >= DEBT_LIMIT);

  return {
    clients,
    transactions,
    loading,
    addClient,
    deleteClient,
    addDebt,
    addPayment,
    getClient,
    getClientTransactions,
    totalDebt,
    todayDebt,
    topDebtors,
    recentTransactions,
    highDebtClients,
    DEBT_LIMIT,
    refetch: fetchData,
  };
}
