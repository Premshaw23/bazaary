import { apiFetch } from "./client";

export type SellerOrder = {
  id: string;
  orderNumber: string;
  state: string;
  totalAmount: number;
  createdAt: string;
  sellerId: string;
};

export function getSellerOrders() {
  return apiFetch<SellerOrder[]>("/orders?sellerId=me", {
    cache: "no-store",
  });
}

export function getSellerOrderById(orderId: string) {
  return apiFetch<SellerOrder>(`/orders/${orderId}`, {
    cache: "no-store",
  });
}

export function updateOrderState(
  orderId: string,
  state: "CONFIRMED" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED"
) {
  return apiFetch(`/orders/${orderId}/state`, {
    method: "PATCH",
    body: JSON.stringify({ state }),
  });
}
