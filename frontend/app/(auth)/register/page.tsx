"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerApi } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/context";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"BUYER" | "SELLER">("BUYER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await registerApi(email, password, role);
      login(res.access_token);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form
        onSubmit={handleSubmit}
        className="card-premium w-full max-w-sm"
        autoComplete="off"
      >
        <h1 className="text-3xl font-extrabold mb-6 text-gray-900">Register</h1>

        {error && (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        )}

        <label className="block mb-1 text-gray-700 font-medium" htmlFor="email">Email</label>
        <input
          id="email"
          className="w-full mb-3 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none transition"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block mb-1 text-gray-700 font-medium" htmlFor="password">Password</label>
        <input
          id="password"
          className="w-full mb-3 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none transition"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="block mb-1 text-gray-700 font-medium" htmlFor="role">Role</label>
        <select
          id="role"
          className="w-full mb-6 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none transition"
          value={role}
          onChange={(e) =>
            setRole(e.target.value as "BUYER" | "SELLER")
          }
        >
          <option value="BUYER">Buyer</option>
          <option value="SELLER">Seller</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="btn-premium w-full disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
}
