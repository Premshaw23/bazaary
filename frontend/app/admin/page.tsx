

"use client";
import Link from "next/link";
import { Wallet, Package, User, PlusCircle, CreditCard } from "lucide-react";
import { useAuth } from "@/lib/auth/context";

export default function AdminDashboardPage() {
  const { user, isHydrated } = useAuth();

  if (!isHydrated) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><span>Loading...</span></div>;
  }
  if (!user || user.role !== "ADMIN") {
    return <div className="min-h-screen flex items-center justify-center bg-white"><span>Unauthorized</span></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50">
      <div className="card-premium w-full max-w-2xl p-8 rounded-2xl shadow-xl bg-white">
        {/* Profile Section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow">
            <User size={32} />
          </div>
          <div>
            <div className="text-xl font-extrabold text-gray-900">{user.email}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
            <div className="text-xs text-purple-700 font-semibold mt-1">Admin</div>
          </div>
        </div>
        {/* Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Nav href="/admin/payouts" label="Payout Approvals" icon={<CreditCard />} />
          <Nav href="/admin/wallet" label="Platform Wallet" icon={<Wallet />} />
          <Nav href="/admin/orders" label="Orders" icon={<Package />} />
          <Nav href="/admin/products" label="Manage Product" icon={<PlusCircle />} />
        </div>
      </div>
    </div>
  );
}

function Nav({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 btn-premium bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 w-full py-4 px-4 rounded-xl shadow transition-all text-lg font-semibold"
      style={{ boxShadow: 'none' }}
    >
      <span className="text-blue-500">{icon}</span>
      {label}
    </Link>
  );
}
