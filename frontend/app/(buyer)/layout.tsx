"use client";

import { useEffect } from "react";
import { CartProvider } from "@/lib/cart/context";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import CustomLoader from "@/components/CustomLoader";

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated) {
    return <div className="p-8"><CustomLoader/></div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <CartProvider>{children}</CartProvider>;
}
