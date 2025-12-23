"use client";

import { useEffect, useState } from "react";
import { getWalletLedger } from "@/lib/api/wallet";

export default function WalletLedgerPage() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getWalletLedger();
      setLedger(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-white">
      <div className="card-premium animate-pulse">Loading ledger…</div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-white py-10 px-2">
      <div className="w-full max-w-5xl">
        <div className="rounded-2xl bg-linear-to-r from-blue-600 to-blue-400 shadow-xl p-7 mb-8 flex items-center gap-4">
          <div className="bg-white rounded-full p-3 shadow-md">
            <svg width={32} height={32} fill="none" viewBox="0 0 24 24"><path fill="#2563eb" d="M12 12c2.7 0 8 1.34 8 4v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2c0-2.66 5.3-4 8-4Zm0-2a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"/></svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">Wallet Ledger</h1>
            <p className="text-blue-100 text-sm">All your wallet transactions in one place.</p>
          </div>
        </div>
        {ledger.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500 text-lg">No transactions yet.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-2 md:p-6 overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="bg-blue-50 text-blue-700">
                  <th className="p-3 font-semibold">Date (IST)</th>
                  <th className="p-3 font-semibold">Type</th>
                  <th className="p-3 font-semibold">Amount</th>
                  <th className="p-3 font-semibold">Balance After</th>
                  <th className="p-3 font-semibold">Reference</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map(entry => (
                  <tr key={entry.id} className="even:bg-blue-50/40 hover:bg-blue-100/40 transition-colors">
                    <td className="p-3 whitespace-nowrap">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : ''}
                    </td>
                    <td className="p-3 font-semibold text-blue-700">{entry.type}</td>
                    <td className={`p-3 font-bold ${entry.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>₹{entry.amount}</td>
                    <td className="p-3">
                      {entry.balanceAfter === null || entry.balanceAfter === undefined || entry.balanceAfter === ''
                        ? <span className="text-yellow-600 font-semibold">Pending</span>
                        : <>₹{entry.balanceAfter}</>}
                    </td>
                    <td className="p-3 text-gray-600">{entry.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
