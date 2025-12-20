"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import {
  getSellerOrderById,
  updateOrderState,
} from "@/lib/api/seller-orders";

const NEXT_ACTION: Record<string, "CONFIRMED" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | null> = {
  PAID: "CONFIRMED",
  CONFIRMED: "PACKED",
  PACKED: "SHIPPED",
    SHIPPED: "OUT_FOR_DELIVERY",
    OUT_FOR_DELIVERY: "DELIVERED",
  DELIVERED: null,
};

export default function SellerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await getSellerOrderById(id);
      setOrder(data);
      // Debug: log user and order sellerId
      console.log("[DEBUG] Current user:", user);
      console.log("[DEBUG] Order.sellerId:", data.sellerId);
    } catch (err: any) {
      setError(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function advance() {
    const next = NEXT_ACTION[order.state];
    if (!next) return;

    // Debug: Log access token and request details
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    console.log("[DEBUG] access_token:", token);
    console.log("[DEBUG] PATCH /orders/" + order.id + "/state", { state: next });

    try {
      await updateOrderState(order.id, next);
    } catch (err) {
      console.error("[DEBUG] updateOrderState error:", err);
      let errorMsg = "Failed to update order state";
      if (err && typeof err === "object" && "message" in err) {
        errorMsg = (err as any).message || errorMsg;
      }
      setError(errorMsg);
      return;
    }
    await load();
  }

  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!order) return null;

  const next = NEXT_ACTION[order.state];

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">
        {order.orderNumber}
      </h1>

      <p className="mb-2">
        <strong>Status:</strong> {order.state}
      </p>
      <p className="mb-6">
        <strong>Total:</strong> ₹{order.totalAmount}
      </p>

      {next && (
        <button
          onClick={advance}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Mark as {next}
        </button>
      )}

      {!next && (
        <p className="text-gray-500">
          No further action available.
        </p>
      )}
    </div>
  );
}
