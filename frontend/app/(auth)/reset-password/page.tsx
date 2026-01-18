"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[0-9]/, "Password must contain at least one number"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    useEffect(() => {
        if (!token) {
            setError("Invalid reset link. Please request a new password reset.");
        }
    }, [token]);

    async function onSubmit(data: ResetPasswordFormData) {
        if (!token) return;

        setError("");
        setSuccess(false);
        setLoading(true);

        try {
            await apiFetch("/auth/reset-password", {
                method: "POST",
                body: JSON.stringify({ token, password: data.password }),
            });
            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Failed to reset password");
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
                <h1 className="text-3xl font-extrabold mb-2 text-gray-900">
                    Reset Password
                </h1>
                <p className="text-sm text-gray-600 mb-6">
                    Enter your new password below
                </p>

                {success && (
                    <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded border border-green-100">
                        <p className="font-medium">Password reset successful!</p>
                        <p className="mt-1">Redirecting to login...</p>
                    </div>
                )}

                {error && (
                    <p className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
                        {error}
                    </p>
                )}

                <div className="mb-3">
                    <label
                        className="block mb-1 text-gray-700 font-medium"
                        htmlFor="password"
                    >
                        New Password
                    </label>
                    <input
                        id="password"
                        className={`w-full px-3 py-2 border rounded-lg text-gray-900 bg-gray-50 focus:bg-white focus:outline-none transition ${errors.password
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-200 focus:border-blue-500"
                            }`}
                        placeholder="New password"
                        type="password"
                        disabled={!token || success}
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.password.message}
                        </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        Must contain 8+ chars, 1 uppercase, 1 number.
                    </p>
                </div>

                <div className="mb-6">
                    <label
                        className="block mb-1 text-gray-700 font-medium"
                        htmlFor="confirmPassword"
                    >
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        className={`w-full px-3 py-2 border rounded-lg text-gray-900 bg-gray-50 focus:bg-white focus:outline-none transition ${errors.confirmPassword
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-200 focus:border-blue-500"
                            }`}
                        placeholder="Confirm password"
                        type="password"
                        disabled={!token || success}
                        {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || success || !token}
                    className="btn-premium w-full disabled:opacity-50"
                >
                    {loading ? "Resetting..." : success ? "Success!" : "Reset Password"}
                </button>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Remember your password?{" "}
                    <Link
                        href="/login"
                        className="text-blue-600 hover:underline font-medium"
                    >
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
