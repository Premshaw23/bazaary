"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useEffect, useState } from "react";
import { getBuyerOrders, BuyerOrder } from "@/lib/api/orders";
import Link from "next/link";
import { ShoppingCart, Package, User, Heart } from "lucide-react";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getBuyerOrders().then((data) => {
      setOrders(data || []);
      setLoading(false);
    });
  }, [user]);

  if (!user) return null;

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  // Order stats
  const totalOrders = orders.length;
  const paidOrders = orders.filter(o => o.state === "PAID").length;
  const pendingOrders = orders.filter(o => o.state === "PAYMENT_PENDING" || o.state === "CREATED").length;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50 p-4">
      <div className="card-premium w-full max-w-5xl p-8 rounded-2xl shadow-xl bg-white">
        {/* Profile Section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow">
            <User size={32} />
          </div>
          <div>
            <div className="text-xl font-extrabold text-gray-900">{user.email}</div>
            <div className="text-sm text-gray-500 mb-1">Role: <span className="font-semibold text-gray-900">{user.role}</span></div>
          </div>
          <button
            onClick={handleLogout}
            className="ml-auto btn-premium px-6 py-2"
          >
            Logout
          </button>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Link href="/orders" className="flex flex-col items-center bg-blue-50 hover:bg-blue-100 rounded-xl p-4 transition">
            <Package className="mb-1 text-blue-600" />
            <span className="font-semibold text-blue-900 text-sm">My Orders</span>
            <span className="text-xs text-blue-700">{totalOrders}</span>
          </Link>
          <Link href="/cart" className="flex flex-col items-center bg-blue-50 hover:bg-blue-100 rounded-xl p-4 transition">
            <ShoppingCart className="mb-1 text-blue-600" />
            <span className="font-semibold text-blue-900 text-sm">Cart</span>
          </Link>
          <Link href="/wishlist" className="flex flex-col items-center bg-blue-50 hover:bg-blue-100 rounded-xl p-4 transition">
            <Heart className="mb-1 text-blue-600" />
            <span className="font-semibold text-blue-900 text-sm">Wishlist</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center bg-blue-50 hover:bg-blue-100 rounded-xl p-4 transition">
            <User className="mb-1 text-blue-600" />
            <span className="font-semibold text-blue-900 text-sm">Profile</span>
          </Link>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-linear-to-br from-blue-100 to-purple-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{totalOrders}</div>
            <div className="text-xs text-gray-600">Total Orders</div>
          </div>
          <div className="bg-linear-to-br from-green-100 to-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{paidOrders}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="bg-linear-to-br from-yellow-100 to-yellow-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-700">{pendingOrders}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
        </div>

        {/* Recent Orders */}
        <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
        {loading ? (
          <div className="text-gray-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-400">No orders found.</div>
        ) : (
          <ul className="mb-6 text-left">
            {orders.slice(0, 5).map((order) => (
              <li key={order.id} className="mb-2 p-3 rounded-lg border border-gray-100 bg-gray-50">
                <div className="font-semibold">Order #{order.orderNumber}</div>
                <div className="text-xs text-gray-500">Status: {order.state}</div>
                <div className="text-xs text-gray-500">Total: ₹{order.totalAmount}</div>
                <div className="text-xs text-gray-400">Placed: {new Date(order.createdAt).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
