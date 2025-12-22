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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="card-premium w-full max-w-2xl">
        <h1 className="text-3xl font-extrabold mb-6">Payout Requests</h1>
        {payouts.length === 0 && <div className="text-gray-500">No pending payouts.</div>}
        <div className="space-y-4">
          {payouts.map(p => (
            <div key={p.id} className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-gray-900 font-semibold">Seller: <span className="font-mono">{p.sellerId}</span></p>
                <p className="text-gray-500">Amount: <span className="font-bold text-green-700">₹{p.amount}</span></p>
              </div>
              <button
                onClick={() => approve(p.id)}
                className="btn-premium bg-green-600 hover:bg-green-700 mt-3 sm:mt-0"
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
