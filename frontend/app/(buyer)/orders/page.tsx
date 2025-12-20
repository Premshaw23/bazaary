"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBuyerOrders, BuyerOrder } from "@/lib/api/orders";

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getBuyerOrders();
        setOrders(data);
      } catch (err: any) {
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  if (loading) {
    return <div className="p-8">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-8 text-gray-600">
        You have not placed any orders yet.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block border rounded-lg p-4 hover:bg-gray-50"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">
                  Order {order.orderNumber}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  ₹{order.totalAmount}
                </p>
                <p
                  className={`text-sm ${
                    order.state === "PAID"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {order.state}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
