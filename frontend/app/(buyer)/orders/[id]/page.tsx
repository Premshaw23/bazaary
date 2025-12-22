"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrderById } from "@/lib/api/orders";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await getOrderById(String(id));
        setOrder(data);
      } catch (err: any) {
        setError(err.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100"><span className="text-lg text-gray-500">Loading order...</span></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-red-600 text-center">{error}</div>
      </div>
    );
  }

  if (!order) return null;

  // Status badge color
  const statusColor = order.state === "PAID"
    ? "bg-green-100 text-green-700"
    : order.state === "PAYMENT_PENDING"
    ? "bg-yellow-100 text-yellow-700"
    : order.state === "CREATED"
    ? "bg-blue-100 text-blue-700"
    : "bg-gray-200 text-gray-600";

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-xl w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Order #{order.orderNumber}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColor}`}>
            {order.state.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="flex items-center gap-8 mb-6">
          <div>
            <div className="text-gray-500 text-sm mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-900">₹{order.totalAmount}</div>
          </div>
        </div>

        {order.state === "CREATED" && (
          <div className="mt-6">
            <a
              href={`/orders/${order.id}/pay`}
              className="inline-block w-full py-3 rounded-lg font-bold text-white text-lg bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-center transition-all"
            >
              Pay Now
            </a>
          </div>
        )}

        {order.state === "PAYMENT_PENDING" && (
          <div className="mt-6">
            <a
              href={`/orders/${order.id}/pay`}
              className="inline-block w-full py-3 rounded-lg font-bold text-white text-lg bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-center transition-all"
            >
              Continue Payment
            </a>
          </div>
        )}

        {order.state === "PAID" && (
          <div className="flex flex-col items-center mt-8">
            <svg className="w-12 h-12 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-700 text-lg font-semibold">Payment successful. Order is being processed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
