"use client";

import { useCart } from "@/lib/cart/context";
import { useAuth } from "@/lib/auth/context";

type Props = {
  listingId: string;
  productName: string;
  sellerName: string;
  price: number;
};

export default function AddToCartButton({ listingId, productName, sellerName, price }: Props) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  function handleAdd() {
    if (user?.role !== "BUYER") {
      alert("Only buyers can add to cart.");
      return;
    }
    addToCart({
      listingId,
      productName,
      sellerName,
      price,
      quantity: 1,
    });
    alert("Added to cart");
  }

  return (
    <button
      onClick={handleAdd}
      className="bg-blue-600 text-white px-4 py-2 rounded"
      disabled={user?.role !== "BUYER"}
      title={user?.role !== "BUYER" ? "Only buyers can add to cart" : undefined}
    >
      Add to cart
    </button>
  );
}
