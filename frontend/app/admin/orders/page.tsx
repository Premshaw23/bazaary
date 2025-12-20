"use client";

import { useEffect, useState } from "react";
import { getAllOrders } from "@/lib/api/admin";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    getAllOrders().then((data) => {
      setOrders(Array.isArray(data) ? data : []);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Order</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.orderNumber}</td>
              <td>{o.state}</td>
              <td>₹{o.totalAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
