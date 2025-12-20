export type BuyerOrder = {
  id: string;
  orderNumber: string;
  state: string;
  totalAmount: number;
  createdAt: string;
};

export function getBuyerOrders() {
  return apiFetch<BuyerOrder[]>("/orders?buyerId=me", {
    cache: "no-store",
  });
}
import { apiFetch } from "./client";

export type CreateOrderPayload = {
  items: {
    listingId: string;
    quantity: number;
  }[];
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
};

export type OrderResponse = {
  id: string;
  orderNumber: string;
  totalAmount: number;
};

export function createOrder(payload: CreateOrderPayload) {
  return apiFetch<OrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type OrderDetail = {
  id: string;
  orderNumber: string;
  state: "CREATED" | "PAYMENT_PENDING" | "PAID";
  totalAmount: number;
  payment?: {
    id: string;
    gatewayTransactionId: string;
    status: string;
  };
};

export async function getOrderById(orderId: string) {
  return apiFetch<OrderDetail>(`/orders/${orderId}`, {
    cache: "no-store",
  });
}
