"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  initiatePayment,
  verifyPayment,
  PaymentMethod,
} from "@/lib/api/payments";
import { getOrderById, OrderDetail } from "@/lib/api/orders";

function generateIdempotencyKey(orderId: string) {
  return `pay_${orderId}_${Date.now()}`;
}

const METHODS: PaymentMethod[] = [
  "CARD",
  "UPI",
];

export default function PaymentPage() {
  const { id: orderId } = useParams();
  const router = useRouter();

  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [idempotencyKey] = useState(() =>
    generateIdempotencyKey(String(orderId))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [orderLoading, setOrderLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await getOrderById(String(orderId));
        setOrder(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch order");
      } finally {
        setOrderLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  // Helper to poll order state
  async function waitForOrderState(
    orderId: string,
    expectedState: string,
    timeoutMs = 5000
  ) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const order = await getOrderById(orderId);
      if (order.state === expectedState) {
        return order;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error(`Order did not reach state ${expectedState}`);
  }

  async function handlePay() {
    if (!order) return;
    setError("");
    setLoading(true);
    try {
      if (order.state === "CREATED") {
        if (!method) {
          setError("Please select a payment method");
          setLoading(false);
          return;
        }
        // 1️⃣ Initiate payment
        const init = await initiatePayment(
          String(orderId),
          method as PaymentMethod,
          idempotencyKey
        );
        console.log("INIT PAYMENT RESPONSE", init);
        if (init.status === "FAILED") {
          setError("Payment initiation failed. No money was deducted.");
          setLoading(false);
          return;
        }
        // 2️⃣ Wait for PAYMENT_PENDING
        await waitForOrderState(String(orderId), "PAYMENT_PENDING");
        // 3️⃣ Refetch order to get latest payment object
        const refreshedOrder = await getOrderById(String(orderId));
        if (
          refreshedOrder.state !== "PAYMENT_PENDING" ||
          !refreshedOrder.payment
        ) {
          throw new Error("Order/payment not ready for verification");
        }
        // 4️⃣ Verify payment using latest payment object
        await verifyPayment(
          refreshedOrder.payment.id,
          refreshedOrder.payment.gatewayTransactionId
        );
        // 5️⃣ Wait for PAID
        await waitForOrderState(String(orderId), "PAID");
        // 6️⃣ Redirect
        router.replace(`/orders/${orderId}`);
      } else if (order.state === "PAYMENT_PENDING" && order.payment) {
        // Only verify, never re-initiate
        await verifyPayment(order.payment.id, order.payment.gatewayTransactionId);
        await waitForOrderState(String(orderId), "PAID");
        router.replace(`/orders/${orderId}`);
      } else {
        setError(
          "Order is not in a payable state. Please refresh or check order status."
        );
        console.log(order);
      }
    } catch (err: any) {
      setError(
        err.message ||
          (err.errorBody && err.errorBody.message) ||
          "Payment error"
      );
    } finally {
      setLoading(false);
    }
  }

  if (orderLoading) {
    return <div className="p-8">Loading order...</div>;
  }
  if (!order) {
    return <div className="p-8 text-red-600">Order not found.</div>;
  }
  if (order.state === "PAID") {
    return (
      <div className="p-8 text-green-600">
        Payment successful. Order is being processed.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">
        {order.state === "CREATED" ? "Complete Payment" : "Verify Payment"}
      </h1>

      {order.state === "CREATED" && (
        <div className="mb-4 space-y-2">
          {METHODS.map((m) => (
            <label key={m} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value={m}
                checked={method === m}
                onChange={() => setMethod(m)}
              />
              <span>{m.replace("_", " ")}</span>
            </label>
          ))}
        </div>
      )}

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <button
        onClick={handlePay}
        disabled={loading || (order.state === "CREATED" && !method)}
        className={`w-full py-2 rounded disabled:opacity-50 ${
          order.state === "CREATED"
            ? "bg-green-600 text-white"
            : "bg-yellow-600 text-white"
        }`}
      >
        {loading
          ? "Processing..."
          : order.state === "CREATED"
          ? "Pay Now"
          : "Verify Payment"}
      </button>
    </div>
  );
}
