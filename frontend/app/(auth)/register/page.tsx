"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerApi } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/context";
import { registerSchema, RegisterFormData } from "@/lib/validation/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "BUYER",
    },
  });

  async function onSubmit(data: RegisterFormData) {
    setError("");
    setLoading(true);

    try {
      const res = await registerApi(data.email, data.password, data.role);
      // res contains { access_token: "..." } but also sets cookie via api
      if (res && res.access_token) {
        // Wait for context to update (re-fetch /auth/me)
        await login(res.access_token);
        router.refresh(); // Refresh server components
        router.replace("/dashboard");
      } else {
        setError("Registration failed: No access token returned");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="card-premium w-full max-w-sm"
        autoComplete="off"
      >
        <h1 className="text-3xl font-extrabold mb-6 text-gray-900">Register</h1>

        {error && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">{error}</p>
        )}

        <div className="mb-3">
          <label className="block mb-1 text-gray-700 font-medium" htmlFor="email">Email</label>
          <input
            id="email"
            className={`w-full px-3 py-2 border rounded-lg text-gray-900 bg-gray-50 focus:bg-white focus:outline-none transition ${errors.email ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-green-500"
              }`}
            placeholder="Email"
            type="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-3">
          <label className="block mb-1 text-gray-700 font-medium" htmlFor="password">Password</label>
          <input
            id="password"
            className={`w-full px-3 py-2 border rounded-lg text-gray-900 bg-gray-50 focus:bg-white focus:outline-none transition ${errors.password ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-green-500"
              }`}
            placeholder="Password"
            type="password"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Must contain 8+ chars, 1 uppercase, 1 number.</p>
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-gray-700 font-medium" htmlFor="role">Role</label>
          <select
            id="role"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none transition"
            {...register("role")}
          >
            <option value="BUYER">Buyer</option>
            <option value="SELLER">Seller</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-premium w-full disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
