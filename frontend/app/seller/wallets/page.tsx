"use client";

import { useEffect, useState } from "react";
import {
  getWalletSummary,
  requestPayout,
} from "@/lib/api/wallet";
import { getPendingPayoutRequests } from "@/lib/api/admin";
import { getMyPendingPayoutRequests } from "@/lib/api/wallet";
import Link from "next/link";

export default function SellerWalletPage() {
  const [summary, setSummary] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<any[]>([]);

  async function load() {
    const data = await getWalletSummary();
    setSummary(data);
    // Fetch pending payout requests for this seller
    const myPending = await getMyPendingPayoutRequests();
    setPending(Array.isArray(myPending) ? myPending : []);
  }

  useEffect(() => {
    load();
  }, []);

  async function submitPayout() {
    setError("");
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid payout amount (number > 0)");
      return;
    }
    if (summary && numAmount > summary.available) {
      setError("Amount exceeds available balance");
      return;
    }
    setLoading(true);
    try {
      await requestPayout(numAmount);
      setAmount("");
      load();
      alert("Payout request submitted");
    } catch (err: any) {
      setError(err.message || "Payout failed");
    } finally {
      setLoading(false);
    }
  }

  if (!summary) return <div className="p-8">Loading wallet…</div>;

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">
        Wallet
      </h1>

      <div className="border rounded p-4 mb-6">
        <p>
          <strong>Available:</strong> ₹{summary.available}
        </p>
        <p>
          <strong>Locked:</strong> ₹{summary.locked}
        </p>
      </div>

      <Link
        href="/seller/wallets/ledger"
        className="text-blue-600 underline"
      >
        View Ledger
      </Link>

      <div className="mt-6">
        <h2 className="font-semibold mb-2">
          Request Payout
        </h2>
        <div className="mb-1 text-sm text-gray-600">
          Available for payout: <span className="font-semibold">₹{summary.available}</span>
        </div>
        {pending.length > 0 && (
          <div className="mb-2 text-yellow-700 bg-yellow-100 p-2 rounded">
            You have a pending payout request awaiting admin approval.
          </div>
        )}
        <input
          className="border p-2 w-full mb-2"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min={1}
          type="number"
          disabled={pending.length > 0}
        />
        {error && (
          <p className="text-red-600 mb-2">{error}</p>
        )}
        <button
          onClick={submitPayout}
          disabled={loading || !amount || isNaN(Number(amount)) || Number(amount) <= 0 || (summary && Number(amount) > summary.available) || pending.length > 0}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Submitting…" : "Request Payout"}
        </button>
      </div>
    </div>
  );
}
