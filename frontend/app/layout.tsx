
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

import ErrorBoundary from "@/components/ErrorBoundary";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans bg-white text-slate-900 antialiased selection:bg-brand-100 selection:text-brand-700">
        <ErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <SocketProvider>
                <Navbar />
                <div className="flex flex-col min-h-screen relative">
                  {/* Global Background Accents */}
                  <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/5 blur-[120px] rounded-full animate-pulse capitalize" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse delay-700" />
                  </div>

                  <main className="flex-1">
                    {children}
                  </main>
                </div>
                <Toaster
                  position="top-right"
                  richColors
                  closeButton
                  toastOptions={{
                    className: 'glass rounded-2xl border-white/20'
                  }}
                />
              </SocketProvider>
            </CartProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

