"use client";

import { addToCart } from "@/lib/cart/cart";

type Props = {
  listingId: string;
  productName: string;
  sellerName: string;
  price: number;
};

export default function AddToCartButton({
  listingId,
  productName,
  sellerName,
  price,
}: Props) {
  function handleAdd() {
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
    >
      Add to cart
    </button>
  );
}
