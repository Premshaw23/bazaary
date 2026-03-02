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
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm from "@/components/StripePaymentForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "");


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
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);


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
      console.log(`[waitForOrderState] Polled order state:`, order?.state);
      if (order && order.state === expectedState) {
        console.log(`[waitForOrderState] Order reached expected state:`, expectedState);
        return order;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error(`Order did not reach state ${expectedState}`);
  }

  async function handleStartPayment() {
    if (!order) return;
    if (!method) {
      setError("Please select a payment method");
      return;
    }

    setError("");
    setLoading(true);

    try {
      console.log("[handleStartPayment] Initiating for method:", method);
      const init = await initiatePayment(
        String(orderId),
        method as PaymentMethod,
        idempotencyKey
      );

      if (!init || init.status === "FAILED") {
        setError("Payment initiation failed. Please try again.");
        setLoading(false);
        return;
      }

      setCurrentPaymentId(init.id);

      if (method === "CARD" && init.gatewayResponse?.client_secret) {
        setClientSecret(init.gatewayResponse.client_secret);
        // We don't call verify yet, we wait for StripeForm to finish
      } else {
        // For other methods (MOCK/UPI), we proceed to verify immediately
        // (Assuming MOCK or simple UPI flow)
        await handleVerify(init.id, init.gatewayTransactionId);
      }
    } catch (err: any) {
      setError(err.message || "Initiation failed");
      setLoading(false);
    }
  }

  async function handleVerify(pId: string, tId: string) {
    setLoading(true);
    setError("");
    try {
      console.log("[handleVerify] Verifying:", pId, tId);
      await verifyPayment(pId, tId);
      await waitForOrderState(String(orderId), "PAID");
      clearCart();
      router.replace(`/orders/${orderId}`);
    } catch (err: any) {
      setError(err.message || "Verification failed");
      setLoading(false);
    }
  }

  const handleStripeSuccess = async (paymentIntentId: string) => {
    if (!currentPaymentId) return;
    await handleVerify(currentPaymentId, paymentIntentId);
  };


  useEffect(() => {
    if (order && order.state === "PAID") {
      console.log("[PaymentPage] Order is PAID, clearing cart...");
      clearCart();
    } else {
      console.log("[PaymentPage] Order state:", order?.state);
    }
    // Only clear once per payment success
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order && order.state === "PAID"]);

  if (orderLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100"><CustomLoader /></div>;
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

        {order.state === "CREATED" && !clientSecret && (
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

        {clientSecret && (
          <div className="mb-6">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm
                onSuccess={handleStripeSuccess}
                onError={(msg) => setError(msg)}
              />
            </Elements>
          </div>
        )}

        {error && <div className="mb-4 text-red-600 text-center font-semibold bg-red-50 rounded p-2">{error}</div>}

        {!clientSecret && (
          <button
            onClick={order.state === "CREATED" ? handleStartPayment : () => order.payment && handleVerify(order.payment.id, order.payment.gatewayTransactionId)}
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
                ? "Proceed to Payment"
                : "Verify Previous Payment"}
          </button>
        )}
      </div>

    </div>
  );
}
