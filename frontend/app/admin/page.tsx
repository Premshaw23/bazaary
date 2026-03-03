

"use client";
import Link from "next/link";
import { Wallet, Package, User, PlusCircle, CreditCard, Shield, TrendingUp, Users, Eye } from "lucide-react";
import { useAuth } from "@/lib/auth/context";

export default function AdminDashboardPage() {
  const { user, isHydrated } = useAuth();

  if (!isHydrated) {
    return (
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
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="premium-card p-8">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Unauthorized Access</h3>
              <p className="text-gray-600 mt-2">You need admin privileges to access this page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="premium-card p-6 bg-linear-to-r from-purple-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                  <p className="text-purple-100">Platform Management & Control</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-purple-100">Admin</div>
                <div className="font-medium">{user.email}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AdminStatCard 
            title="Total Revenue" 
            value="₹2,45,890" 
            icon={TrendingUp} 
            color="green"
            trend="+15% from last month"
          />
          <AdminStatCard 
            title="Active Sellers" 
            value="47" 
            icon={Users} 
            color="blue"
            trend="3 pending approval"
          />
          <AdminStatCard 
            title="Total Orders" 
            value="1,234" 
            icon={Package} 
            color="purple"
            trend="+23% from last month"
          />
          <AdminStatCard 
            title="Platform Fee" 
            value="₹12,295" 
            icon={Wallet} 
            color="indigo"
            trend="This month earnings"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="premium-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <AdminActionLink 
                  href="/admin/payouts" 
                  icon={CreditCard}
                  title="Payout Approvals"
                  description="Review seller payout requests"
                  badge="3 pending"
                />
                <AdminActionLink 
                  href="/admin/wallet" 
                  icon={Wallet}
                  title="Platform Wallet"
                  description="View platform earnings"
                />
                <AdminActionLink 
                  href="/admin/orders" 
                  icon={Package}
                  title="Order Management"
                  description="Monitor all platform orders"
                />
                <AdminActionLink 
                  href="/admin/products" 
                  icon={PlusCircle}
                  title="Product Management"
                  description="Manage product catalog"
                />
                <AdminActionLink 
                  href="/admin/unlock-requests" 
                  icon={Eye}
                  title="Unlock Requests"
                  description="Review wallet unlock requests"
                />
              </div>
            </div>
          </div>

          {/* Platform Metrics */}
          <div className="lg:col-span-2">
            <div className="premium-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Platform Overview</h3>
                <select className="text-sm border-gray-300 rounded-md">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Recent Activity</h4>
                  <div className="space-y-3 text-sm">
                    <ActivityItem 
                      type="order"
                      message="New order by John Doe"
                      time="2 minutes ago"
                      status="success"
                    />
                    <ActivityItem 
                      type="payout"
                      message="Payout request from TechStore"
                      time="15 minutes ago"
                      status="pending"
                    />
                    <ActivityItem 
                      type="product"
                      message="New product added by FashionHub"
                      time="1 hour ago"
                      status="review"
                    />
                    <ActivityItem 
                      type="seller"
                      message="Seller application approved"
                      time="2 hours ago"
                      status="success"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">System Status</h4>
                  <div className="space-y-3">
                    <StatusItem label="Database" status="healthy" />
                    <StatusItem label="Payment Gateway" status="healthy" />
                    <StatusItem label="Search Service" status="healthy" />
                    <StatusItem label="Email Service" status="degraded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
interface AdminStatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'green' | 'blue' | 'purple' | 'indigo';
  trend?: string;
}

function AdminStatCard({ title, value, icon: Icon, color, trend }: AdminStatCardProps) {
  const colorClasses: Record<AdminStatCardProps['color'], string> = {
    green: 'text-green-600 bg-green-100',
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
    indigo: 'text-indigo-600 bg-indigo-100'
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

interface AdminActionLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
}

function AdminActionLink({ href, icon: Icon, title, description, badge }: AdminActionLinkProps) {
  return (
    <Link 
      href={href}
      className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <Icon className="h-5 w-5 text-purple-600 mr-3 shrink-0" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">{title}</span>
          {badge && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
              {badge}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
    </Link>
  );
}

interface ActivityItemProps {
  type: string;
  message: string;
  time: string;
  status: 'success' | 'pending' | 'review';
}

function ActivityItem({ type, message, time, status }: ActivityItemProps) {
  const statusColors: Record<ActivityItemProps['status'], string> = {
    success: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    review: 'bg-blue-100 text-blue-800'
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-gray-900">{message}</div>
        <div className="text-gray-500 text-xs">{time}</div>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status}
      </span>
    </div>
  );
}

function StatusItem({ label, status }: any) {
  const isHealthy = status === 'healthy';
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center">
        <div className={`w-2 h-2 rounded-full mr-2 ${isHealthy ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
        <span className="text-sm capitalize text-gray-900">{status}</span>
      </div>
    </div>
  );
}