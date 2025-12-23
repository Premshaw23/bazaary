// ==========================================================
// 2. PRODUCT CARD COMPONENT
// ============================================================
"use client";
import WishlistButton from "@/components/WishlistButton";
import { Package, Store, Eye } from "lucide-react";
import Link from "next/link";

export default function ProductCard({ listing }: { listing: any }) {
  return (
    <article className="bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Product Image */}
      <div className="aspect-square bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6 relative overflow-hidden">
        {listing.product?.catalog?.images && listing.product.catalog.images.length > 0 ? (
          <img
            src={
              listing.product.catalog.images.find((img: any) => img.isPrimary)?.url ||
              listing.product.catalog.images[0].url
            }
            alt={listing.product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Package className="w-20 h-20 text-slate-400" />
        )}
        
        {/* Wishlist Button - Top Right */}
        <div className="absolute top-3 right-3">
          <WishlistButton productId={listing.product.id} />
        </div>

        {/* Stock Badge - Top Left */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
              listing.stockQuantity > 0
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {listing.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5">
        <div className="mb-3">
          <h2 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1" title={listing.product.name}>
            {listing.product.name}
          </h2>
          
          {listing.product.brand && (
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              {listing.product.brand}
            </span>
          )}
        </div>

        {listing.product.catalog?.shortDescription && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-3" title={listing.product.catalog.shortDescription}>
            {listing.product.catalog.shortDescription}
          </p>
        )}

        {/* Seller Info */}
        {listing.seller && (
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 pb-3 border-b border-slate-100">
            <Store className="w-3 h-3" />
            <span className="font-medium text-slate-700">{listing.seller.businessName}</span>
          </div>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ₹{listing.price.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 font-mono">ID: {listing.id.slice(0, 8)}</div>
          </div>
          <Link
            href={`/products/${listing.product.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
          >
            <Eye className="w-4 h-4" />
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
