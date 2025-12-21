"use client";
import { useState } from "react";

async function unlockLedger(sellerId: string) {
  const res = await fetch("/api/wallets/unlock-for-test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sellerId }),
  });
  if (!res.ok) throw new Error("Failed to unlock ledger");
  return res.json();
}

export default function AdminUnlockLedgerPage() {
  const [sellerId, setSellerId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUnlock() {
    setLoading(true);
    setStatus(null);
    try {
      await unlockLedger(sellerId);
      setStatus("Ledger unlocked for seller: " + sellerId);
    } catch (e) {
      setStatus("Failed to unlock ledger.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-xl font-bold mb-4">Admin: Unlock Seller Wallet Ledger</h2>
      <input
        className="border px-3 py-2 rounded w-full mb-4"
        type="text"
        placeholder="Seller ID"
        value={sellerId}
        onChange={e => setSellerId(e.target.value)}
        disabled={loading}
      />
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleUnlock}
        disabled={loading || !sellerId}
      >
        {loading ? "Unlocking..." : "Unlock Ledger"}
      </button>
      {status && <div className="mt-4 text-green-700">{status}</div>}
    </div>
  );
}
