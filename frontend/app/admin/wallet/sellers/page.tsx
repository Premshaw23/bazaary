"use client";
import { useEffect, useState } from "react";


import { getAllSellers } from "@/lib/api/admin";

// Fetch wallet summary for a seller (calls backend API directly)
async function fetchWalletSummary(sellerId: string) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const res = await fetch(`${API_BASE_URL}/wallets/summary/${sellerId}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }
  );
  if (!res.ok) throw new Error("Failed to fetch wallet summary");
  return res.json();
}

// Unlock ledger for a seller (calls backend API directly)
async function unlockLedger(sellerId: string) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const res = await fetch(`${API_BASE_URL}/wallets/unlock-for-test`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ sellerId }),
  });
  if (!res.ok) throw new Error("Failed to unlock ledger");
  return res.json();
}

export default function AdminSellersWalletPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [wallets, setWallets] = useState<Record<string, any>>({});

  useEffect(() => {
    getAllSellers()
      .then((value) => setSellers(value as any[]))
      .catch(e => setError(e.message || "Failed to fetch sellers"))
      .finally(() => setLoading(false));
  }, []);

  async function handleUnlock(sellerId: string) {
    setUnlocking(sellerId);
    try {
      await unlockLedger(sellerId);
      // Refresh wallet summary after unlock
      const summary = await fetchWalletSummary(sellerId);
      setWallets(w => ({ ...w, [sellerId]: summary }));
    } catch (e) {
      alert("Failed to unlock ledger for this seller.");
    }
    setUnlocking(null);
  }

  async function handleShowWallet(sellerId: string) {
    setWallets(w => ({ ...w, [sellerId]: { loading: true } }));
    try {
      const summary = await fetchWalletSummary(sellerId);
      setWallets(w => ({ ...w, [sellerId]: summary }));
    } catch (e) {
      setWallets(w => ({ ...w, [sellerId]: { error: "Failed to load" } }));
    }
  }

  if (loading) return <div className="p-8">Loading sellers...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">All Sellers - Wallet Admin</h2>
      <table className="w-full border mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Seller</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Locked Payment</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {sellers.map(seller => (
            <tr key={seller.id} className="border-b">
              <td className="p-2">
                <div className="font-semibold">{seller.businessName}</div>
                <div className="text-xs text-gray-500">{seller.id}</div>
              </td>
              <td className="p-2">{seller.contactEmail || seller.user?.email || "-"}</td>
              <td className="p-2">
                {wallets[seller.id]?.loading ? "..." : wallets[seller.id]?.locked ?? <button className="text-blue-600 underline" onClick={() => handleShowWallet(seller.id)}>Show</button>}
              </td>
              <td className="p-2">
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  onClick={() => handleUnlock(seller.id)}
                  disabled={!!unlocking}
                >
                  {unlocking === seller.id ? "Unlocking..." : "Unlock Ledger"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-sm text-gray-500">Click "Show" to see locked payment, then "Unlock Ledger" to unlock for payout.</div>
    </div>
  );
}
