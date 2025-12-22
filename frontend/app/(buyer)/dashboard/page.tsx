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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="card-premium w-full max-w-lg text-center">
        <h1 className="text-3xl font-extrabold mb-2">Dashboard</h1>
        <p className="mb-6 text-gray-500">Role: <span className="font-semibold text-gray-900">{user.role}</span></p>
        <button
          onClick={handleLogout}
          className="btn-premium w-full max-w-xs mx-auto"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
