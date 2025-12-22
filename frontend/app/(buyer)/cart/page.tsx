"use client";

import { useCart } from "@/lib/cart/context";
import { useAuth } from "@/lib/auth/context";

import { useRouter } from "next/navigation";


export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  if (!user || user.role !== "BUYER") {
    return <div className="min-h-screen flex items-center justify-center bg-white"><div className="card-premium text-red-600">Only buyers can access the cart.</div></div>;
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="card-premium w-full max-w-xl text-center py-12">
          <h1 className="text-3xl font-extrabold mb-4">Your cart is empty</h1>
          <p className="mb-6 text-gray-600">Add products to your cart to start shopping.</p>
          <button
            className="btn-premium bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
            onClick={() => router.push('/products')}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="card-premium w-full max-w-2xl">
        <h1 className="text-3xl font-extrabold mb-6">Your Cart</h1>
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.listingId}
              className="border border-gray-100 rounded-xl p-4 flex justify-between items-center bg-white shadow-sm"
            >
              <div>
                <p className="font-semibold text-gray-900">{item.productName}</p>
                <p className="text-sm text-gray-400">Seller: {item.sellerName}</p>
                <p className="text-sm text-gray-900">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => {
                    updateQuantity(item.listingId, Number(e.target.value));
                  }}
                  className="w-16 border border-gray-200 px-2 py-1 rounded-lg text-center"
                />
                <button
                  onClick={() => {
                    removeFromCart(item.listingId);
                  }}
                  className="btn-premium bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          className="btn-premium w-full mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          onClick={() => router.push("/checkout")}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
