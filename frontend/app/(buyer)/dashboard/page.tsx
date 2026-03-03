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
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Welcome back, {user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="premium-card p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <Package className="h-8 w-8 text-brand-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
            </div>
          </div>
          
          <div className="premium-card p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Paid Orders</p>
                <p className="text-2xl font-bold text-gray-900">{paidOrders}</p>
              </div>
            </div>
          </div>

          <div className="premium-card p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <Package className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="premium-card p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <Heart className="h-8 w-8 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Wishlist</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="premium-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/products"
                  className="flex items-center w-full p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5 text-brand-600 mr-3" />
                  <span className="text-sm font-medium">Browse Products</span>
                </Link>
                <Link
                  href="/cart"
                  className="flex items-center w-full p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Package className="h-5 w-5 text-brand-600 mr-3" />
                  <span className="text-sm font-medium">View Cart</span>
                </Link>
                <Link
                  href="/orders"
                  className="flex items-center w-full p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <User className="h-5 w-5 text-brand-600 mr-3" />
                  <span className="text-sm font-medium">Order History</span>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center w-full p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Heart className="h-5 w-5 text-brand-600 mr-3" />
                  <span className="text-sm font-medium">Manage Profile</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="premium-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No orders yet</p>
                  <Link 
                    href="/products" 
                    className="text-sm text-brand-600 hover:text-brand-500 font-medium"
                  >
                    Start shopping →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">Order #{order.orderNumber}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">₹{order.totalAmount}</div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.state === 'PAID' ? 'bg-green-100 text-green-800' :
                            order.state === 'DELIVERED' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.state}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4">
                    <Link 
                      href="/orders" 
                      className="text-sm text-brand-600 hover:text-brand-500 font-medium"
                    >
                      View all orders →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
