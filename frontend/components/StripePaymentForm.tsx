"use client";

import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";

export default function StripePaymentForm({
    onSuccess,
    onError
}: {
    onSuccess: (paymentIntentId: string) => void;
    onError: (error: string) => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            console.error("Stripe.js has not loaded yet.");
            return;
        }

        setLoading(true);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.href,
                },
                redirect: "if_required",
            });

            if (error) {
                console.error("[StripePaymentForm] error:", error);
                onError(error.message || "An error occurred during payment.");
                setLoading(false);
            } else if (paymentIntent && paymentIntent.status === "succeeded") {
                console.log("[StripePaymentForm] success:", paymentIntent);
                onSuccess(paymentIntent.id);
            } else {
                console.warn("[StripePaymentForm] unusual status:", paymentIntent?.status);
                onError("Payment failed or requires further action. Status: " + (paymentIntent?.status || 'unknown'));
                setLoading(false);
            }
        } catch (err: any) {
            console.error("[StripePaymentForm] catch:", err);
            onError(err.message || "An unexpected error occurred.");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                <PaymentElement />
            </div>
            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition-all shadow-lg hover:shadow-green-900/20"
            >
                {loading ? "Processing Securely..." : "Confirm & Pay Now"}
            </button>
        </form>
    );
}
