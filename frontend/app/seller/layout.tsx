"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { getSellerProfile } from "@/lib/api/seller-profile";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user || user.role !== "SELLER") {
      router.replace("/login");
      return;
    }
    async function checkSellerProfile() {
      try {
        await getSellerProfile();
      } catch {
        router.replace("/seller/apply");
      }
    }
    checkSellerProfile();
  }, [user, isHydrated, router]);

  if (!isHydrated) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user || user.role !== "SELLER") {
    return null;
  }

  return <>{children}</>;
}
