
import "./globals.css";
import { AuthProvider } from "@/lib/auth/context";
import AppSidebar from "@/components/AppSidebar";
import AppNavbar from "@/components/AppNavbar";

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
          <div className="flex min-h-screen">
            <AppSidebar />
            <main className="flex-1 pb-16 md:pb-0 bg-white">
              {children}
            </main>
            <AppNavbar />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
