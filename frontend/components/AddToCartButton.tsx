"use client";

import { useCart } from "@/lib/cart/context";
import { useAuth } from "@/lib/auth/context";
import { ShoppingCart, Check, X } from "lucide-react";
import { useState } from "react";

type Props = {
  listingId: string;
  productName: string;
  sellerName: string;
  price: number;
  productImage?: string;
};

export default function AddToCartButton({ 
  listingId, 
  productName, 
  sellerName, 
  price, 
  productImage 
}: Props) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "adding" | "success" | "error">("idle");

  async function handleAdd() {
    if (user?.role !== "BUYER") {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
      return;
    }

    setStatus("adding");
    
    // Simulate async operation
    setTimeout(() => {
      addToCart({
        listingId,
        productName,
        sellerName,
        price,
        quantity: 1,
        productImage,
      });
      setStatus("success");
      
      // Reset after 2 seconds
      setTimeout(() => setStatus("idle"), 2000);
    }, 500);
  }

  const isDisabled = user?.role !== "BUYER" || status === "adding" || status === "success";

  return (
    <button
      onClick={handleAdd}
      disabled={isDisabled}
      className={`
        relative overflow-hidden
        px-8 py-4 rounded-xl
        font-bold text-base
        transition-all duration-300
        flex items-center gap-3
        disabled:cursor-not-allowed
        ${
          status === "idle"
            ? "bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-2xl hover:scale-105"
            : status === "adding"
            ? "bg-linear-to-r from-blue-400 to-purple-500 text-white shadow-lg"
            : status === "success"
            ? "bg-linear-to-r from-green-500 to-green-600 text-white shadow-lg scale-105"
            : "bg-linear-to-r from-red-500 to-red-600 text-white shadow-lg"
        }
      `}
      title={user?.role !== "BUYER" ? "Only buyers can add to cart" : undefined}
    >
      {/* Ripple effect background */}
      {status === "adding" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full bg-white/20 animate-ping rounded-xl"></div>
        </div>
      )}
      
      {/* Button content */}
      <div className="relative flex items-center gap-3">
        {status === "idle" && (
          <>
            <ShoppingCart className="w-5 h-5" />
            <span>Add to Cart</span>
          </>
        )}
        
        {status === "adding" && (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Adding...</span>
          </>
        )}
        
        {status === "success" && (
          <>
            <div className="relative">
              <Check className="w-6 h-6 animate-bounce" />
              <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
            </div>
            <span>Added to Cart!</span>
          </>
        )}
        
        {status === "error" && (
          <>
            <X className="w-5 h-5 animate-pulse" />
            <span>Cannot Add</span>
          </>
        )}
      </div>

      {/* Shine effect on hover */}
      {status === "idle" && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
      )}
    </button>
  );
}