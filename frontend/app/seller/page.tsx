"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSellerOrders } from "@/lib/api/seller-orders";
import { getSellerProfile } from "@/lib/api/seller-profile";
import { useAuth } from "@/lib/auth/context";
import { Package, DollarSign, ShoppingCart, TrendingUp, Eye, Edit3 } from "lucide-react";

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [total, setTotal] = useState(0);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const [orders, profileData] = await Promise.all([
          getSellerOrders(),
          getSellerProfile()
        ]);
        setTotal((orders?.length) || 0);
        setPending(
          (orders ?? []).filter(o =>
            ["PAID", "CONFIRMED"].includes(o.state)
          ).length
        );
        setProfile(profileData);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-md w-48"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="premium-card p-8">
            <div className="text-red-600 mb-4">
              <Package className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Error Loading Dashboard</h3>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="premium-card p-6 bg-linear-to-r from-brand-600 to-brand-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-content-center">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Seller Dashboard</h1>
                  <p className="text-brand-100">Welcome back, {profile?.businessName || user?.email}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-brand-100">Seller ID</div>
                <div className="font-mono text-sm">{profile?.id || user?.id}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Orders" 
            value={total.toString()} 
            icon={Package} 
            color="blue"
            trend="+12% from last month"
          />
          <StatCard 
            title="Pending Orders" 
            value={pending.toString()} 
            icon={TrendingUp} 
            color="yellow"
            trend={`${pending} need attention`}
          />
          <StatCard 
            title="Total Revenue" 
            value="₹45,231" 
            icon={DollarSign} 
            color="green"
            trend="+8% from last month"
          />
          <StatCard 
            title="Products" 
            value="24" 
            icon={ShoppingCart} 
            color="purple"
            trend="3 out of stock"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="premium-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <ActionLink 
                  href="/seller/products" 
                  icon={ShoppingCart}
                  title="Manage Products"
                  description="Add or edit your products"
                />
                <ActionLink 
                  href="/seller/orders" 
                  icon={Package}
                  title="View Orders"
                  description="Process customer orders"
                />
                <ActionLink 
                  href="/seller/listings" 
                  icon={Edit3}
                  title="Manage Listings"
                  description="Update pricing and inventory"
                />
                <ActionLink 
                  href="/seller/wallets" 
                  icon={DollarSign}
                  title="Wallet & Payouts"
                  description="Track earnings and payouts"
                />
              </div>
            </div>

            {/* Profile Status */}
            <div className="premium-card p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verification</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Verified
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Store Status</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Active
                  </span>
                </div>
                <Link 
                  href="/seller/profile" 
                  className="text-sm text-brand-600 hover:text-brand-500 font-medium"
                >
                  Edit Profile →
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="premium-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <Link 
                  href="/seller/orders"
                  className="text-sm text-brand-600 hover:text-brand-500 font-medium"
                >
                  View all →
                </Link>
              </div>
              
              {total === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No orders yet</p>
                  <p className="text-xs text-gray-400 mt-1">Orders will appear here once customers start purchasing</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mock recent orders - in real app, this would come from API */}
                  <OrderRow 
                    orderNumber="BAZ-2024-001" 
                    customer="John Doe" 
                    amount="₹1,299" 
                    status="PAID" 
                    date="2 hours ago"
                  />
                  <OrderRow 
                    orderNumber="BAZ-2024-002" 
                    customer="Jane Smith" 
                    amount="₹899" 
                    status="CONFIRMED" 
                    date="5 hours ago"
                  />
                  <OrderRow 
                    orderNumber="BAZ-2024-003" 
                    customer="Mike Johnson" 
                    amount="₹2,199" 
                    status="SHIPPED" 
                    date="1 day ago"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'yellow' | 'green' | 'purple';
  trend?: string;
}

function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  const colorClasses: Record<StatCardProps['color'], string> = {
    blue: 'text-blue-600 bg-blue-100',
    yellow: 'text-yellow-600 bg-yellow-100', 
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100'
  };

  return (
    <div className="premium-card p-6">
      <div className="flex items-center">
        <div className={`shrink-0 p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
        </div>
      </div>
    </div>
  );
}

interface ActionLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function ActionLink({ href, icon: Icon, title, description }: ActionLinkProps) {
  return (
    <Link 
      href={href}
      className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <Icon className="h-5 w-5 text-brand-600 mr-3 shrink-0" />
      <div>
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
    </Link>
  );
}

interface OrderRowProps {
  orderNumber: string;
  customer: string;
  amount: string;
  status: 'PAID' | 'CONFIRMED' | 'SHIPPED' | 'PENDING';
  date: string;
}

function OrderRow({ orderNumber, customer, amount, status, date }: OrderRowProps) {
  const statusColors: Record<OrderRowProps['status'], string> = {
    PAID: 'bg-green-100 text-green-800',
    CONFIRMED: 'bg-blue-100 text-blue-800', 
    SHIPPED: 'bg-purple-100 text-purple-800',
    PENDING: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
      <div>
        <div className="font-medium text-gray-900">{orderNumber}</div>
        <div className="text-sm text-gray-500">{customer} • {date}</div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-gray-900">{amount}</div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
      </div>
    </div>
  );
}
