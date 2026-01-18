"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    async function onSubmit(data: ForgotPasswordFormData) {
        setError("");
        setSuccess(false);
        setLoading(true);

        try {
            await apiFetch("/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({ email: data.email }),
            });
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Failed to send reset email");
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
                    Forgot Password
                </h1>
                <p className="text-sm text-gray-600 mb-6">
                    Enter your email and we'll send you a reset link
                </p>

                {success && (
                    <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded border border-green-100">
                        <p className="font-medium">Check your email!</p>
                        <p className="mt-1">
                            If an account exists with this email, you will receive a password
                            reset link.
                        </p>
                    </div>
                )}

                {error && (
                    <p className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
                        {error}
                    </p>
                )}

                <div className="mb-6">
                    <label
                        className="block mb-1 text-gray-700 font-medium"
                        htmlFor="email"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        className={`w-full px-3 py-2 border rounded-lg text-gray-900 bg-gray-50 focus:bg-white focus:outline-none transition ${errors.email
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-200 focus:border-blue-500"
                            }`}
                        placeholder="your@email.com"
                        type="email"
                        {...register("email")}
                    />
                    {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || success}
                    className="btn-premium w-full disabled:opacity-50"
                >
                    {loading ? "Sending..." : success ? "Email Sent" : "Send Reset Link"}
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
