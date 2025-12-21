"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { emptyCart } from "@/lib/cart/cart";
import { createOrder } from "@/lib/api/orders";
import { useCart } from "@/lib/cart/context";

import { useAuth } from "@/lib/auth/context";
export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  useEffect(() => {
    if (cartLoading) return;
    console.log("[Checkout] user:", user);
    console.log("[Checkout] cart:", cart);
    if (!user || user.role !== "BUYER") {
      router.replace("/auth/login");
      return;
    }
    if (cart.length === 0) {
      router.replace("/cart");
    }
  }, [cart, router, user, cartLoading]);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Check all items are from the same seller
    const sellerNames = Array.from(new Set(cart.map((item) => item.sellerName)));
    if (sellerNames.length > 1) {
      setError("All items in the cart must be from the same seller to checkout.");
      setLoading(false);
      return;
    }

    try {
      const order = await createOrder({
        items: cart.map((item) => ({
          listingId: item.listingId,
          quantity: item.quantity,
        })),
        shippingAddress: address,
      });

      // order successfully created → cart is no longer needed
      clearCart();
      router.replace(`/orders/${order.id}`);
    } catch (err: any) {
      setError(err.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (cartLoading) return <div className="p-8 text-center">Loading cart...</div>;
  if (cart.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {error && (
        <p className="mb-4 text-red-600">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.keys(address).map((field) => (
          <input
            key={field}
            placeholder={field}
            value={(address as any)[field]}
            onChange={(e) =>
              setAddress({
                ...address,
                [field]: e.target.value,
              })
            }
            className="w-full border px-3 py-2 rounded"
            required
          />
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Placing order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}