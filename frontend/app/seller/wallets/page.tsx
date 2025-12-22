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

  if (!summary) return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-white">
      <div className="card-premium animate-pulse">Loading wallet…</div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-white py-10 px-2">
      <div className="w-full max-w-xl">
        <div className="rounded-2xl bg-linear-to-r from-blue-600 to-blue-400 shadow-xl p-7 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-full p-3 shadow-md">
              <svg width={36} height={36} fill="none" viewBox="0 0 24 24"><path fill="#2563eb" d="M12 12c2.7 0 8 1.34 8 4v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2c0-2.66 5.3-4 8-4Zm0-2a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"/></svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">Seller Wallet</h1>
              <p className="text-blue-100 text-sm">Track your balance and request payouts easily.</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <WalletStat label="Available" value={summary.available} icon="💰" color="text-green-600" />
          <WalletStat label="Locked" value={summary.locked} icon="🔒" color="text-yellow-600" />
        </div>
        <div className="mb-6 flex items-center gap-2">
          <Link
            href="/seller/wallets/ledger"
            className="btn-premium px-4 py-2 text-blue-700 border border-blue-200 bg-white hover:bg-blue-50 rounded-xl font-semibold shadow-sm"
          >
            📜 View Ledger
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">Request Payout <span className="text-green-500">💸</span></h2>
          <div className="mb-1 text-sm text-gray-600">
            Available for payout: <span className="font-semibold">₹{summary.available}</span>
          </div>
          {pending.length > 0 && (
            <div className="mb-2 text-yellow-700 bg-yellow-100 p-2 rounded">
              You have a pending payout request awaiting admin approval.
            </div>
          )}
          <input
            className="border border-blue-200 p-2 w-full mb-2 rounded focus:ring-2 focus:ring-blue-200"
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
            className="btn-premium bg-green-600 text-white px-4 py-2 rounded-xl font-semibold w-full mt-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Submitting…" : "Request Payout"}
          </button>
        </div>
      </div>
    </div>
  );
}

function WalletStat({ label, value, icon, color }: any) {
  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-md text-center hover:shadow-lg transition-shadow duration-200 flex flex-col items-center">
      <div className="text-3xl mb-2">{icon}</div>
      <p className={`text-base font-semibold mb-1 ${color}`}>{label}</p>
      <p className="text-2xl font-extrabold text-gray-900 mt-1">₹{value}</p>
    </div>
  );
}
