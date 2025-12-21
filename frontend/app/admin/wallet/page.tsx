"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPlatformLedger } from "@/lib/api/admin";

const PAGE_SIZE = 20;
const BACKEND_URL = "http://localhost:3001/api";

export default function AdminWalletPage() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // Removed unlock-related state


  async function loadMore(reset = false) {
    setLoading(true);
    const nextPage = reset ? 0 : page;
    const data = await getPlatformLedger(nextPage * PAGE_SIZE, PAGE_SIZE);
    if (Array.isArray(data)) {
      const newData = [...data].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      setLedger((prev) => {
        if (reset) return newData;
        const ids = new Set(prev.map((x) => x.id));
        return [...prev, ...newData.filter((x) => !ids.has(x.id))];
      });
      setHasMore(data.length === PAGE_SIZE);
      setPage((p) => reset ? 1 : p + 1);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  }

  // Reloads the ledger from scratch
  async function reloadLedger() {
    await loadMore(true);
  }


  useEffect(() => {
    loadMore(true);
    // eslint-disable-next-line
  }, []);

  // Removed unlock-related functions

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold mr-4">Platform Ledger</h1>
        <button
          onClick={reloadLedger}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Reload"}
        </button>
      </div>
      <div style={{ maxHeight: 480, overflowY: "auto" }}>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th>Date (IST)</th>
              <th>Type</th>
              <th>Amount</th>
              <th>
                Reference{/* Context or note, e.g. 'PAYOUT', 'ORDER_1234' */}
              </th>
              <th>
                Seller{/* Seller ID (who owns the funds) */}
              </th>
              <th>Status</th>
              {/* <th>Action</th> */}
            </tr>
          </thead>
          <tbody>
            {ledger.map((l, idx) => (
              <tr key={l.id + "-" + idx}>
                <td>{
                  l.createdAt
                    ? new Date(l.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                    : ''
                }</td>
                <td>{l.type}</td>
                <td>₹{l.amount}</td>
                <td>{l.reference}</td>
                <td>{
                  l.sellerId === "00000000-0000-0000-0000-000000000000"
                    ? "Platform"
                    : l.sellerId || "-"
                }</td>
                <td>{l.status ? l.status : "-"}</td>
                {/* Unlock action removed */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <button
          onClick={() => loadMore()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
      {/* Unlock side panel removed */}
    </div>
  );
}
