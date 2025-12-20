"use client";

import { useEffect, useRef, useState } from "react";
import { getPlatformLedger } from "@/lib/api/admin";

const PAGE_SIZE = 20;

export default function AdminWalletPage() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockStatus, setUnlockStatus] = useState<string | null>(null);
  const sidePanelRef = useRef<HTMLDivElement>(null);

  async function loadMore() {
    setLoading(true);
    // Assume backend supports ?offset & ?limit, otherwise filter client-side
    const data = await getPlatformLedger(page * PAGE_SIZE, PAGE_SIZE);
    if (Array.isArray(data)) {
      setLedger((prev) => {
        // Avoid duplicates by id
        const ids = new Set(prev.map((x) => x.id));
        return [...prev, ...data.filter((x) => !ids.has(x.id))];
      });
      setHasMore(data.length === PAGE_SIZE);
      setPage((p) => p + 1);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line
  }, []);

  async function unlockSeller(sellerId: string) {
    setUnlocking(true);
    setUnlockStatus(null);
    try {
      const res = await fetch("/api/wallets/unlock-for-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId }),
      });
      const data = await res.json();
      setUnlockStatus(data.status || "Unlocked");
    } catch (e) {
      setUnlockStatus("Error unlocking");
    }
    setUnlocking(false);
  }

  function openPanel(sellerId: string) {
    setSelectedSeller(sellerId);
    setSidePanelOpen(true);
    setUnlockStatus(null);
  }

  function closePanel() {
    setSidePanelOpen(false);
    setSelectedSeller(null);
    setUnlockStatus(null);
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Platform Ledger</h1>
      <div style={{ maxHeight: 480, overflowY: "auto" }}>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Reference</th>
              <th>Seller</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((l, idx) => (
              <tr key={l.id + "-" + idx}>
                <td>{new Date(l.createdAt).toLocaleString()}</td>
                <td>{l.type}</td>
                <td>₹{l.amount}</td>
                <td>{l.reference}</td>
                <td>{l.sellerId || "-"}</td>
                <td>
                  {l.sellerId && (
                    <button
                      className="px-2 py-1 bg-green-600 text-white rounded"
                      onClick={() => openPanel(l.sellerId)}
                    >
                      Unlock
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <button
          onClick={loadMore}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
      {/* Side Panel for Unlock */}
      {sidePanelOpen && selectedSeller && (
        <div
          ref={sidePanelRef}
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: 340,
            height: "100%",
            background: "#fff",
            boxShadow: "-2px 0 8px rgba(0,0,0,0.1)",
            zIndex: 1000,
            padding: 24,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <button
            onClick={closePanel}
            style={{ alignSelf: "flex-end", marginBottom: 16 }}
            className="text-gray-500 hover:text-black"
          >
            Close
          </button>