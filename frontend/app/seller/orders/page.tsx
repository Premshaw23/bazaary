"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import Link from "next/link";
import {
  getSellerOrders,
  SellerOrder,
} from "@/lib/api/seller-orders";

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getSellerOrders();
        setOrders(data);
        
      } catch (err: any) {
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8">Loading orders…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  if (!orders || orders.length === 0) {
    return (
      <div className="p-8 text-gray-600">
        No orders yet.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">
        Seller Orders
      </h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/seller/orders/${order.id}`}
            className="block border rounded-lg p-4 hover:bg-gray-50"
          >
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">
                  {order.orderNumber}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold">
                  ₹{order.totalAmount}
                </p>
                <p className="text-sm">{order.state}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
