
// ============================================================
// 3. WISHLIST BUTTON COMPONENT
// ============================================================
"use client";
import { useState, useEffect } from "react";
import { getWishlist, setWishlist } from "@/lib/api/wishlist";
import { useAuth } from "@/lib/auth/context";
import { Heart } from "lucide-react";

interface WishlistButtonProps {
  productId: string;
}

export default function WishlistButton({ productId }: WishlistButtonProps) {
  const { user } = useAuth();
  const [wishlist, setLocalWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    getWishlist().then(setLocalWishlist);
  }, [user]);

  const isWishlisted = wishlist.includes(productId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    setLoading(true);
    let newWishlist;
    if (isWishlisted) {
      newWishlist = wishlist.filter(id => id !== productId);
    } else {
      newWishlist = [...wishlist, productId];
    }
    await setWishlist(newWishlist);
    setLocalWishlist(newWishlist);
    setLoading(false);
  };

  if (!user) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 ${
        isWishlisted 
          ? "bg-pink-500 text-white" 
          : "bg-white text-slate-400 hover:text-pink-500"
      }`}
    >
      <Heart 
        className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`}
      />
    </button>
  );
}
