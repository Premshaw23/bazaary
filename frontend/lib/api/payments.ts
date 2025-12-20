export function verifyPayment(
  paymentId: string,
  transactionId: string
) {
  return apiFetch<{ status: string }>("/payments/verify", {
    method: "POST",
    body: JSON.stringify({
      paymentId,
      transactionId,
    }),
  });
}
import { apiFetch } from "./client";

export type PaymentMethod =
  | "CARD"
  | "UPI"
  | "NET_BANKING"
  | "WALLET"
  | "COD";

export type InitiatePaymentResponse = {
  id: string; // paymentId
  status: "SUCCESS" | "FAILED";
  gatewayTransactionId: string;
};

export function initiatePayment(
  orderId: string,
  method: PaymentMethod,
  idempotencyKey: string
) {
  return apiFetch<InitiatePaymentResponse>("/payments/initiate", {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      orderId,
      method,
    }),
  });
}
