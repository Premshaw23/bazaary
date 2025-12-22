import { apiFetch } from "./client";

export function getWalletSummaryForSeller(sellerId: string) {
  return apiFetch(`/wallets/summary/${sellerId}`, {
    cache: "no-store",
    credentials: "include",
  });
}

export function unlockLedgerForSeller(sellerId: string) {
  return apiFetch(`/wallets/unlock-for-test`, {
    method: "POST",
    body: JSON.stringify({ sellerId }),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
}
