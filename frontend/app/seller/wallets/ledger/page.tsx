"use client";

import { useEffect, useState } from "react";
import { getWalletLedger } from "@/lib/api/wallet";

export default function WalletLedgerPage() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getWalletLedger();
      setLedger(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-8">Loading ledger…</div>;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">
        Wallet Ledger
      </h1>

      {ledger.length === 0 && (
        <p className="text-gray-600">
          No transactions yet.
        </p>
      )}

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Date (IST)</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Balance After</th>
            <th className="p-2 border">Reference</th>
          </tr>
        </thead>
        <tbody>
          {ledger.map(entry => (
            <tr key={entry.id}>
              <td className="p-2 border">
                {entry.createdAt ? new Date(entry.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : ''}
              </td>
              <td className="p-2 border">{entry.type}</td>
              <td className="p-2 border">₹{entry.amount}</td>
              <td className="p-2 border">
                ₹{entry.balanceAfter}
              </td>
              <td className="p-2 border">{entry.reference}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
