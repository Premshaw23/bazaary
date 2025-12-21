"use client";

import { useEffect, useState } from "react";
import { approvePayout, getPendingPayoutRequests } from "@/lib/api/admin";

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);

  async function load() {
    const pending = await getPendingPayoutRequests();
    setPayouts(Array.isArray(pending) ? pending : []);
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(payoutRequestId: string) {
    await approvePayout(payoutRequestId);
    load();
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Payout Requests</h1>
      {payouts.length === 0 && <p>No pending payouts.</p>}
      {payouts.map(p => (
        <div key={p.id} className="border p-4 mb-2">
          <p>Seller: {p.sellerId}</p>
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
