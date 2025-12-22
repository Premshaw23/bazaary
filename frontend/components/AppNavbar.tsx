"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { usePathname } from "next/navigation";

const NAV_LINKS = {
  BUYER: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/products", label: "Products" },
    { href: "/cart", label: "Cart" },
    { href: "/orders", label: "Orders" },
    { href: "/profile", label: "Profile" },
  ],
  SELLER: [
    { href: "/seller", label: "Dashboard" },
    { href: "/seller/products", label: "Products" },
    { href: "/seller/listings", label: "Listings" },
    { href: "/seller/orders", label: "Orders" },
    { href: "/seller/wallets", label: "Wallet" },
    { href: "/profile", label: "Profile" },
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

export default function AppNavbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const role = user?.role || "PUBLIC";
  const links = NAV_LINKS[role] || NAV_LINKS.PUBLIC;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden bg-white border-t border-gray-100 shadow-lg">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`flex-1 text-center py-3 font-medium transition-colors ${pathname === link.href ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
