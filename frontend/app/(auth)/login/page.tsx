"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginApi } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginApi(email, password);
      login(res.access_token);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Login</h1>

        {error && (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        )}

        <label className="block mb-1 text-gray-700" htmlFor="email">Email</label>
        <input
          id="email"
          className="w-full mb-3 px-3 py-2 border rounded text-gray-900 bg-gray-100 focus:bg-white focus:border-blue-500 focus:outline-none"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block mb-1 text-gray-700" htmlFor="password">Password</label>
        <input
          id="password"
          className="w-full mb-4 px-3 py-2 border rounded text-gray-900 bg-gray-100 focus:bg-white focus:border-blue-500 focus:outline-none"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50 font-semibold hover:bg-blue-700 transition-colors"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
