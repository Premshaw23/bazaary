import { apiFetch } from "./client";

export function getSellerDashboardStats() {
  return apiFetch<{
    totalOrders: number;
    pendingOrders: number;
  }>("/orders?sellerId=me");
}
