
import "./globals.css";
import { AuthProvider } from "@/lib/auth/context";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/lib/cart/context";

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
      <body className="bg-white">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <div className="flex min-h-screen">
              <main className="flex-1 bg-white">
                {children}
              </main>
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
