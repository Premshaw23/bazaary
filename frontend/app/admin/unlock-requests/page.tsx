"use client";
import { useEffect, useState } from "react";
import { getAllSellers } from "@/lib/api/admin";
import { getWalletSummaryForSeller, unlockLedgerForSeller } from "@/lib/api/unlock-ledger";

export default function AdminSellersWalletPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [wallets, setWallets] = useState<Record<string, any>>({});
  const [shownWallets, setShownWallets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getAllSellers()
      .then((value) => setSellers(value as any[]))
      .catch(e => setError(e.message || "Failed to fetch sellers"))
      .finally(() => setLoading(false));
  }, []);

  async function handleUnlock(sellerId: string) {
    setUnlocking(sellerId);
    try {
      await unlockLedgerForSeller(sellerId);
      const summary = await getWalletSummaryForSeller(sellerId);
      setWallets(w => ({ ...w, [sellerId]: summary }));
    } catch (e) {
      setWallets(w => ({ ...w, [sellerId]: { error: "Failed to unlock" } }));
    }
    setUnlocking(null);
  }

  async function handleToggleWallet(sellerId: string) {
    setShownWallets((prev) => {
      const isShown = !!prev[sellerId];
      if (isShown) return { ...prev, [sellerId]: false };
      if (!wallets[sellerId]) {
        setWallets(w => ({ ...w, [sellerId]: { loading: true } }));
        getWalletSummaryForSeller(sellerId)
          .then(summary => setWallets(w => ({ ...w, [sellerId]: summary })))
          .catch(() => setWallets(w => ({ ...w, [sellerId]: { error: "Failed to load" } })));
      }
      return { ...prev, [sellerId]: true };
    });
  }

  if (loading) return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4" />
        <span className="text-xl font-medium text-gray-700">Loading sellers...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
        <div className="text-red-600 text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">Error Loading Data</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">Seller Wallets</h1>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
              {sellers.length} {sellers.length === 1 ? 'Seller' : 'Sellers'}
            </div>
          </div>
          <p className="text-gray-600">Manage seller wallet balances and unlock ledgers for payout processing</p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <span className="font-semibold">Quick Guide:</span> Click <span className="font-semibold">Show Wallet</span> to view locked payment details, then use <span className="font-semibold">Unlock Ledger</span> to release funds for payout.
          </div>
        </div>

        {/* Sellers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {sellers.map(seller => (
            <div key={seller.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200">
              {/* Card Header */}
              <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{seller.businessName}</h3>
                    <p className="text-blue-100 text-sm font-mono">{seller.id}</p>
                  </div>
                  <div className="bg-blue-500 bg-opacity-50 rounded-full p-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 py-5">
                {/* Contact Info */}
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{seller.contactEmail || seller.user?.email || "No email"}</span>
                </div>

                {/* Wallet Info Section */}
                {shownWallets[seller.id] && (
                  <div className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {wallets[seller.id]?.loading ? (
                      <div className="flex items-center justify-center py-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600 mr-3" />
                        <span className="text-sm text-gray-600">Loading wallet data...</span>
                      </div>
                    ) : wallets[seller.id]?.error ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">{wallets[seller.id].error}</span>
                      </div>
                    ) : wallets[seller.id] ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Locked Payment:</span>
                            <span className="text-lg font-bold text-gray-900">{wallets[seller.id].locked ?? 0}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 text-center py-2">Click "Show Wallet" to load</div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                      wallets[seller.id]?.loading
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : shownWallets[seller.id]
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                    }`}
                    onClick={() => handleToggleWallet(seller.id)}
                    disabled={wallets[seller.id]?.loading}
                  >
                    {wallets[seller.id]?.loading ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600 mr-2" />
                        Loading
                      </span>
                    ) : shownWallets[seller.id] ? (
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                        Hide Wallet
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Show Wallet
                      </span>
                    )}
                  </button>

                  <button
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm text-white transition-all duration-200 shadow-sm ${
                      unlocking === seller.id
                        ? "bg-green-400 cursor-not-allowed"
                        : unlocking
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                    onClick={() => handleUnlock(seller.id)}
                    disabled={!!unlocking}
                  >
                    {unlocking === seller.id ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Unlocking...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                        Unlock Ledger
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sellers.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Sellers Found</h3>
            <p className="text-gray-500">There are no sellers registered in the system yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}