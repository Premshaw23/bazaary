"use client";
import { useEffect, useState } from "react";
import { getUnlockRequests, approveUnlockRequest } from "@/lib/api/unlock";

export default function AdminUnlockRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      const data = await getUnlockRequests();
      setRequests(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    fetchRequests();
  }, []);

  async function handleApprove(id: string) {
    setApproving(id);
    await approveUnlockRequest(id);
    setRequests((prev) => prev.map(r => r.id === id ? { ...r, status: "APPROVED" } : r));
    setApproving(null);
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Unlock Requests</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th>Seller ID</th>
              <th>Status</th>
              <th>Requested At</th>
              <th>Approved At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td>{r.sellerId}</td>
                <td>{r.status}</td>
                <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</td>
                <td>{r.approvedAt ? new Date(r.approvedAt).toLocaleString() : "-"}</td>
                <td>
                  {r.status === "PENDING" && (
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded"
                      onClick={() => handleApprove(r.id)}
                      disabled={approving === r.id}
                    >
                      {approving === r.id ? "Approving..." : "Approve"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
