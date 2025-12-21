import { apiFetch } from "./client";

// Seller requests unlock
export function requestUnlock() {
  return apiFetch("/wallets/unlock-request", {
    method: "POST",
  });
}

// Admin gets all unlock requests
export function getUnlockRequests() {
  return apiFetch("/wallets/unlock-request", {
    method: "GET",
  });
}

// Admin approves unlock request
export function approveUnlockRequest(requestId: string) {
  return apiFetch("/wallets/unlock-request/approve", {
    method: "POST",
    body: JSON.stringify({ requestId }),
  });
}
