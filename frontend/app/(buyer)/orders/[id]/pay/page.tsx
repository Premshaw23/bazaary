"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart/context";
import { useParams, useRouter } from "next/navigation";
import {
  initiatePayment,
  verifyPayment,
  PaymentMethod,
} from "@/lib/api/payments";
import { getOrderById, OrderDetail } from "@/lib/api/orders";
import CustomLoader from "@/components/CustomLoader";

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

  const { clearCart } = useCart();

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

  useEffect(() => {
    if (order && order.state === "PAID") {
      clearCart();
    }
    // Only clear once per payment success
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order && order.state === "PAID"]);

  if (orderLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100"><CustomLoader/></div>;
  }
  if (!order) {
    return <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100"><div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-red-600 text-center">Order not found.</div></div>;
  }

  if (order.state === "PAID") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-green-700 text-center">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Payment Successful</h2>
          <p>Your order is being processed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-extrabold mb-6 text-gray-900 text-center">
          {order.state === "CREATED" ? "Complete Payment" : "Verify Payment"}
        </h1>

        {order.state === "CREATED" && (
          <div className="mb-6 space-y-3">
            <div className="flex flex-col gap-3">
              {METHODS.map((m) => (
                <label key={m} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${method === m ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m}
                    checked={method === m}
                    onChange={() => setMethod(m)}
                    className="accent-blue-600"
                  />
                  <span className="font-semibold text-gray-800">{m.replace("_", " ")}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {error && <div className="mb-4 text-red-600 text-center font-semibold bg-red-50 rounded p-2">{error}</div>}

        <button
          onClick={handlePay}
          disabled={loading || (order.state === "CREATED" && !method)}
          className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-200
            ${order.state === "CREATED"
              ? "bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              : "bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"}
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading
            ? "Processing..."
            : order.state === "CREATED"
            ? "Pay Now"
            : "Verify Payment"}
        </button>
      </div>
    </div>
  );
}
