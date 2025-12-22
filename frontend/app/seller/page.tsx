"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSellerOrders } from "@/lib/api/seller-orders";
import { getSellerProfile } from "@/lib/api/seller-profile";

import { useAuth } from "@/lib/auth/context";

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [total, setTotal] = useState(0);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [orders, profileData] = await Promise.all([
          getSellerOrders(),
          getSellerProfile()
        ]);
        setTotal(orders.length);
        setPending(
          orders.filter(o =>
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

  async function handleProfileSave(data: any) {
    // TODO: Call update seller profile API here
    setProfile(data);
    setEditing(false);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-white">
      <div className="card-premium animate-pulse">Loading…</div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-white">
      <div className="card-premium text-red-600">{error}</div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-white py-10 px-2">
      <div className="w-full max-w-4xl">
        <div className="rounded-2xl bg-linear-to-r from-blue-600 to-blue-400 shadow-xl p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-full p-3 shadow-md">
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path fill="#2563eb" d="M12 12c2.7 0 8 1.34 8 4v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2c0-2.66 5.3-4 8-4Zm0-2a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"/></svg>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white mb-1">Welcome, {profile?.name || (user && 'name' in user ? user.name : "Seller")}!</h1>
              <p className="text-blue-100 text-sm">Manage your products, orders, and wallet with ease.</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="bg-white/20 text-white px-4 py-1 rounded-full text-xs font-semibold mb-1">{profile?.email || user?.email}</span>
            <span className="bg-white/20 text-white px-4 py-1 rounded-full text-xs font-semibold">Seller ID: {profile?.id || user?.id}</span>
          </div>
        </div>



        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Stat label="Total Orders" value={total} icon="📦" />
          <Stat label="Pending Orders" value={pending} icon="⏳" />
          <Stat label="Wallet" value="View" link="/seller/wallets" icon="💰" />
        </div>
        <div className="flex flex-wrap gap-4 justify-center mb-4">
          <Nav href="/seller/orders" label="Orders" icon="📑" />
          <Nav href="/seller/products" label="Products" icon="🛒" />
          <Nav href="/seller/listings" label="Listings" icon="📝" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, link, icon }: any) {
  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-md text-center hover:shadow-lg transition-shadow duration-200 flex flex-col items-center">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-base text-blue-700 font-semibold mb-1">{label}</p>
      {link ? (
        <Link href={link} className="btn-premium w-full block text-center py-2 text-base mt-1">
          {value}
        </Link>
      ) : (
        <p className="text-2xl font-extrabold text-gray-900 mt-1">{value}</p>
      )}
    </div>
  );
}

function Nav({ href, label, icon }: any) {
  return (
    <Link
      href={href}
      className="btn-premium flex items-center gap-2 bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 hover:shadow-md transition-all px-6 py-3 rounded-xl font-semibold text-lg"
      style={{ boxShadow: 'none' }}
    >
      <span className="text-xl">{icon}</span>
      {label}
    </Link>
  );
}
