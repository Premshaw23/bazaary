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
    return <div className="p-8">Loading order...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        {error}
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">
        Order {order.orderNumber}
      </h1>

      <div className="space-y-2">
        <p>
          <strong>Status:</strong> {order.state}
        </p>
        <p>
          <strong>Total:</strong> ₹{order.totalAmount}
        </p>
      </div>

      {order.state === "CREATED" && (
        <div className="mt-6">
          <a
            href={`/orders/${order.id}/pay`}
            className="inline-block bg-green-600 text-white px-6 py-2 rounded"
          >
            Pay Now
          </a>
        </div>
      )}

      {order.state === "PAYMENT_PENDING" && (
        <div className="mt-6">
          <a
            href={`/orders/${order.id}/pay`}
            className="inline-block bg-yellow-600 text-white px-6 py-2 rounded"
          >
            Continue Payment
          </a>
        </div>
      )}

      {order.state === "PAID" && (
        <p className="text-green-600 mt-4">
          Payment successful. Order is being processed.
        </p>
      )}
    </div>
  );
}
