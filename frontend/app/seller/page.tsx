"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSellerOrders } from "@/lib/api/seller-orders";
import { getSellerProfile, applyAsSeller } from "@/lib/api/seller-profile";
import { useAuth } from "@/lib/auth/context";

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [total, setTotal] = useState(0);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const orders = await getSellerOrders();
        setTotal(orders.length);
        setPending(
          orders.filter(o =>
            ["PAID", "CONFIRMED"].includes(o.state)
          ).length
        );
      } catch (err: any) {
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">
        Seller Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Stat label="Total Orders" value={total} />
        <Stat label="Pending Orders" value={pending} />
        <Stat label="Wallet" value="View" link="/seller/wallets" />
      </div>

      <div className="mt-8 flex gap-4">
        <Nav href="/seller/orders" label="Orders" />
        <Nav href="/seller/products" label="Products" />
        <Nav href="/seller/listings" label="Listings" />
      </div>
    </div>
  );
}

function Stat({ label, value, link }: any) {
  return (
    <div className="border rounded p-4">
      <p className="text-sm text-gray-500">{label}</p>
      {link ? (
        <Link href={link} className="text-blue-600 font-semibold">
          {value}
        </Link>
      ) : (
        <p className="text-xl font-bold">{value}</p>
      )}
    </div>
  );
}

function Nav({ href, label }: any) {
  return (
    <Link
      href={href}
      className="px-4 py-2 border rounded hover:bg-gray-50"
    >
      {label}
    </Link>
  );
}
