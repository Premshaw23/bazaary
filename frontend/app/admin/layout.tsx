"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import CustomLoader from "@/components/CustomLoader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user || user.role !== "ADMIN") {
      router.replace("/login");
    }
  }, [user, isHydrated, router]);

  if (!isHydrated) return <div className="p-8"><CustomLoader/></div>;
  if (!user || user.role !== "ADMIN") return null;

  return <>{children}</>;
}
