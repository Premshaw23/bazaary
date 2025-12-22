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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="card-premium w-full max-w-4xl">
        <h1 className="text-3xl font-extrabold mb-6">Orders</h1>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-100 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t border-gray-100 hover:bg-blue-50 transition">
                  <td className="px-4 py-2 font-mono text-gray-900">{o.orderNumber}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${o.state === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{o.state}</span>
                  </td>
                  <td className="px-4 py-2 text-right font-bold text-gray-900">₹{o.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
