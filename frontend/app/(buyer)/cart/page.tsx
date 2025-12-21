"use client";

import { useCart } from "@/lib/cart/context";
import { useAuth } from "@/lib/auth/context";


export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();

  if (!user || user.role !== "BUYER") {
    return <div className="p-8 text-red-600">Only buyers can access the cart.</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="p-8 text-gray-600">
        Your cart is empty.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="space-y-4">
        {cart.map((item) => (
          <div
            key={item.listingId}
            className="border p-4 rounded flex justify-between"
          >
            <div>
              <p className="font-semibold">{item.productName}</p>
              <p className="text-sm text-gray-500">
                Seller: {item.sellerName}
              </p>
              <p className="text-sm">₹{item.price}</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => {
                  updateQuantity(item.listingId, Number(e.target.value));
                }}
                className="w-16 border px-2"
              />

              <button
                onClick={() => {
                  removeFromCart(item.listingId);
                }}
                className="text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
