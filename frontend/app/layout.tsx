import "./globals.css";
import { AuthProvider } from "@/lib/auth/context";
import Link from "next/link";

function Nav({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 border rounded hover:bg-gray-50"
    >
      {label}
    </Link>
  );
}

function SellerNavbar() {
  return (
    <nav className="flex items-center justify-between mb-8 p-4 border-b bg-gray-500 sticky top-0 z-10">
      <span className="text-xl font-bold text-blue-700">Bazaary Seller</span>
      <div className="flex gap-4">
        <Nav href="/seller" label="Dashboard" />
        <Nav href="/seller/orders" label="Orders" />
        <Nav href="/seller/products" label="Products" />
        <Nav href="/seller/listings" label="Listings" />
        <Nav href="/seller/wallets" label="Wallet" />
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Bazaary Seller Portal</title>
        <meta name="description" content="Bazaary Seller Portal for managing products, orders, listings, and wallet." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AuthProvider>
          <SellerNavbar/>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
