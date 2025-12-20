import { apiFetch } from "./client";

export function getSellerProfile() {
  return apiFetch("/sellers/me");
}

export function applyAsSeller(data: any) {
  return apiFetch("/sellers/apply", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
