"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2">Role: {user.role}</p>

      <button
        onClick={handleLogout}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
