"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBuyerOrders, BuyerOrder } from "@/lib/api/orders";
import CustomLoader from "@/components/CustomLoader";

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getBuyerOrders();
        setOrders(data ?? []);
      } catch (err: any) {
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100"><CustomLoader/></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-red-600 text-center">{error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-gray-500 text-center font-semibold">You have not placed any orders yet.</div>
      </div>
    );
  }

  // Status badge color helper
  function statusBadge(state: string) {
    if (state === "PAID") return "bg-green-100 text-green-700";
    if (state === "PAYMENT_PENDING") return "bg-yellow-100 text-yellow-700";
    if (state === "CREATED") return "bg-blue-100 text-blue-700";
    return "bg-gray-200 text-gray-600";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-900 tracking-tight">My Orders</h1>
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg hover:bg-blue-50 transition"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="font-bold text-lg text-gray-900 mb-1">Order #{order.orderNumber}</div>
                  <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex flex-col md:items-end gap-2">
                  <span className="text-xl font-bold text-gray-900">₹{order.totalAmount}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusBadge(order.state)}`}>
                    {order.state.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
