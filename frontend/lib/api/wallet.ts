import { apiFetch } from "./client";

export type WalletSummary = {
  locked: number;
  available: number;
  sellerId: string;
};

export type WalletLedgerEntry = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  reference: string;
  createdAt: string;
};

export function getWalletSummary() {
  return apiFetch<WalletSummary>("/wallets/summary", {
    cache: "no-store",
  });
}

// Get current seller's pending payout requests
export function getMyPendingPayoutRequests() {
  return apiFetch("/wallets/payout/requests");
}

export function getWalletLedger() {
  return apiFetch<WalletLedgerEntry[]>("/wallets/ledger", {
    cache: "no-store",
  });
}

export function requestPayout(amount: number) {
  return apiFetch("/wallets/payout", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}
