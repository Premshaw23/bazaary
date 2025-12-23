import { apiFetch } from "./client";

export function getWishlist() {
  return apiFetch<{ wishlist: string[] }>("/auth/me").then(res => res?.wishlist || []);
}

export function setWishlist(wishlist: string[]) {
  return apiFetch("/auth/me", {
    method: "PATCH",
    body: JSON.stringify({ wishlist }),
    headers: { "Content-Type": "application/json" },
  });
}
