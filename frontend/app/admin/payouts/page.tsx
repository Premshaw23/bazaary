"use client";

import { useEffect, useState } from "react";
import { approvePayout, getPlatformLedger } from "@/lib/api/admin";

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);

  async function load() {
    const ledger = await getPlatformLedger();
    const ledgerArr = Array.isArray(ledger) ? ledger : [];
    setPayouts(ledgerArr.filter((e: any) => e.type === "PAYOUT_REQUEST"));
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: string) {
    await approvePayout(id);
    load();
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Payout Requests</h1>
      {payouts.length === 0 && <p>No pending payouts.</p>}
      {payouts.map(p => (
        <div key={p.id} className="border p-4 mb-2">
          <p>Seller: {p.reference}</p>
          <p>Amount: ₹{p.amount}</p>
          <button
            onClick={() => approve(p.id)}
            className="mt-2 bg-green-600 text-white px-4 py-1 rounded"
          >
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}
