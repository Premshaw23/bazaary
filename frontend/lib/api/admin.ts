import { apiFetch } from "./client";

/* Wallet */
export function getPlatformLedger(offset = 0, limit = 20) {
  const params = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  return apiFetch(`/wallets/platform-ledger?${params.toString()}`, {
    cache: "no-store",
  });
}

export function approvePayout(payoutId: string) {
  return apiFetch("/wallets/admin/payout/approve", {
    method: "POST",
    body: JSON.stringify({ payoutId }),
  });
}

/* Orders */
export function getAllOrders() {
  return apiFetch("/orders", {
    cache: "no-store",
  });
}
