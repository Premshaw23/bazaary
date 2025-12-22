"use client";


import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = {
  BUYER: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/products", label: "Products" },
    { href: "/cart", label: "Cart" },
    { href: "/orders", label: "Orders" },
    {href:"/checkout",label:"Checkout"},
    { href: "/profile", label: "Profile" },
  ],
  SELLER: [
    { href: "/seller", label: "Dashboard" },
    { href: "/seller/products", label: "Products" },
    { href: "/seller/listings", label: "Listings" },
    { href: "/seller/orders", label: "Orders" },
    { href: "/seller/wallets", label: "Wallet" },
    { href: "/seller/profile", label: "Profile" },
  ],
  ADMIN: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/payouts", label: "Payouts" },
    { href: "/admin/wallet", label: "Platform Wallet" },
    { href: "/admin/unlock-requests", label: "Unlock Requests" },
    { href: "/profile", label: "Profile" },
  ],
  PUBLIC: [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/login", label: "Login" },
    { href: "/register", label: "Register" },
  ],
};

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const role = user?.role || "PUBLIC";
  const links = NAV_LINKS[role] || NAV_LINKS.PUBLIC;
  const [open, setOpen] = useState(false);

  // Sidebar content
  const sidebarContent = (
    <div className="flex flex-col h-full relative">
      {/* Close (X) button for mobile */}
      <button
        className="absolute top-4 right-4 z-50 md:hidden bg-white border border-gray-200 rounded-full p-2 shadow-md focus:outline-none"
        onClick={() => setOpen(false)}
        aria-label="Close sidebar"
        type="button"
      >
        <svg width={24} height={24} fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth={2} strokeLinecap="round" d="M6 6l12 12M6 18L18 6"/></svg>
      </button>
      <div className="flex items-center justify-center h-20 border-b border-gray-100">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-blue-700">Bazaary</Link>
      </div>
      <nav className="flex-1 py-6 px-4 space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-2 rounded-lg font-medium transition-colors ${pathname === link.href ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
          >
            {link.label}
          </Link>
        ))}
        {(role === "ADMIN" || role === "BUYER" || role === "SELLER") && (
          <button
            onClick={async () => {
              await logout();
              router.replace("/login");
            }}
            className="block w-full mt-6 px-4 py-2 rounded-lg font-medium text-left text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            Logout
          </button>
        )}
      </nav>
      <footer className="mt-auto py-4 px-4 border-t border-gray-100 text-xs text-gray-400 text-center">
        <div>Bazaary &copy; {new Date().getFullYear()}</div>
        <div>
          Support: <a href="mailto:support@bazaary.com" className="underline">support@bazaary.com</a>
        </div>
        <div className="mt-1">v1.0</div>
      </footer>
    </div>
  );

  return (
    <>
      {/* Hamburger for mobile/desktop */}
      <button
        className="fixed top-4 left-4 z-40 md:hidden bg-white border border-gray-200 rounded-full p-2 shadow-md focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle sidebar"
      >
        <svg width={28} height={28} fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth={2} strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
      {/* Sidebar overlay for mobile */}
      <div
        className={`fixed inset-0 z-30 bg-black/30 transition-opacity md:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      {/* Sidebar itself */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-100 shadow-lg transform transition-transform duration-200 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} md:flex md:flex-col md:static md:shadow-lg md:translate-x-0`}
        style={{ willChange: 'transform' }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
