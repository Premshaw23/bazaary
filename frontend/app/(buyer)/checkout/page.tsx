"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { emptyCart } from "@/lib/cart/cart";
import { createOrder } from "@/lib/api/orders";
import { useCart } from "@/lib/cart/context";

import { useAuth } from "@/lib/auth/context";
import CustomLoader from "@/components/CustomLoader";
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
    if (!user || user.role !== "BUYER") {
      router.replace("/auth/login");
      return;
    }
    // No redirect to /cart if cart is empty; UI handles empty cart state
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

      // order successfully created → redirect to payment page
      // Do NOT clear cart here; clear after payment
      router.replace(`/orders/${order.id}/pay`);
    } catch (err: any) {
      setError(err.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (cartLoading) return <div className="p-8 text-center"><CustomLoader/></div>;
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="card-premium w-full max-w-xl text-center py-12">
          <h1 className="text-3xl font-extrabold mb-4">Your cart is empty</h1>
          <p className="mb-6 text-gray-600">Please add products to your cart before checking out.</p>
          <button
            className="btn-premium bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
            onClick={() => router.replace('/cart')}
          >
            Go to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="card-premium w-full max-w-xl">
        <h1 className="text-3xl font-extrabold mb-6">Checkout</h1>

        {error && (
          <p className="mb-4 text-red-600">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(address).map((field) => (
            <input
              key={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={(address as any)[field]}
              onChange={(e) =>
                setAddress({
                  ...address,
                  [field]: e.target.value,
                })
              }
              className="w-full border border-gray-200 px-3 py-2 rounded-lg bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none transition"
              required
            />
          ))}

          <button
            type="submit"
            disabled={loading}
            className="btn-premium w-full disabled:opacity-50 bg-green-600 hover:bg-green-700"
          >
            {loading ? "Placing order..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}