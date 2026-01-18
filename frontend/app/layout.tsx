
import "./globals.css";
import { AuthProvider } from "@/lib/auth/context";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/lib/cart/context";
import { Inter, Outfit } from "next/font/google";
import { SocketProvider } from "@/lib/socket/SocketContext";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Bazaary | The Premium Marketplace",
  description: "Bazaary is a next-generation marketplace for buyers and sellers, featuring real-time wallets, advanced search, and lightning-fast checkout.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans bg-white text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
        <AuthProvider>
          <CartProvider>
            <SocketProvider>
              <Navbar />
              <div className="flex flex-col min-h-screen">
                <main className="flex-1">
                  {children}
                </main>
              </div>
              <Toaster position="top-right" richColors />
            </SocketProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
