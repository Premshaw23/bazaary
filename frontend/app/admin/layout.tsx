"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";

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

  if (!isHydrated) return <div className="p-8">Loading…</div>;
  if (!user || user.role !== "ADMIN") return null;

  return <>{children}</>;
}
