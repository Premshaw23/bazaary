"use client";


import { useCart } from "@/lib/cart/context";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowRight } from "lucide-react";
import Image from "next/image";


export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  // // Debug: log cart data
  // if (typeof window !== "undefined") {
  //   console.log("[CartPage] cart data:", cart);
  // }

  if (!user || user.role !== "BUYER") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50">
        <div className="card-premium text-red-600 text-lg shadow-lg p-8 rounded-xl bg-white flex flex-col items-center gap-4">
          <ShoppingCart size={48} className="text-red-400 mb-2" />
          Only buyers can access the cart.
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50">
        <div className="card-premium w-full max-w-xl text-center py-12 bg-white rounded-xl shadow-lg flex flex-col items-center gap-4">
          <ShoppingCart size={56} className="mx-auto text-gray-300 mb-2" />
          <h1 className="text-3xl font-extrabold mb-2">Your cart is empty</h1>
          <p className="mb-4 text-gray-500">Add products to your cart to start shopping.</p>
          <button
            className="btn-premium bg-linear-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md hover:scale-105 transition"
            onClick={() => router.push('/products')}
          >
            <ArrowRight size={18} /> Browse Products
          </button>
        </div>
      </div>
    );
  }

  // Calculate subtotal
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen flex justify-center bg-linear-to-br from-blue-50 to-purple-50 py-10 px-2">
      <div className="card-premium w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-3">
          <ShoppingCart size={32} className="text-blue-500" /> Your Cart
        </h1>
        <div className="divide-y divide-gray-100">
          {cart.map((item) => (
            <div
              key={item.listingId}
              className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Product image or placeholder */}
                {item.productImage ? (
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-3xl font-bold">
                    <span>{item.productName[0]}</span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{item.productName}</p>
                  <p className="text-sm text-gray-400">Seller: {item.sellerName}</p>
                  <p className="text-sm text-gray-900 mt-1">₹{item.price.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => {
                    updateQuantity(item.listingId, Number(e.target.value));
                  }}
                  className="w-16 border border-gray-200 px-2 py-1 rounded-lg text-center focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={() => {
                    removeFromCart(item.listingId);
                  }}
                  className="btn-premium bg-linear-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:scale-105 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
          <div className="text-lg font-semibold text-gray-700">
            Subtotal: <span className="text-2xl text-blue-600 font-bold">₹{subtotal.toLocaleString()}</span>
          </div>
          <button
            className="btn-premium flex items-center gap-2 bg-linear-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:scale-105 transition"
            onClick={() => router.push("/checkout")}
          >
            Checkout <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
