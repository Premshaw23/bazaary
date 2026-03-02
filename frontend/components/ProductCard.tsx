// ==========================================================
// 2. PRODUCT CARD COMPONENT
// ============================================================
"use client";
import WishlistButton from "@/components/WishlistButton";
import { Package, Store, Eye, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ProductCard({ listing }: { listing: any }) {
  return (
    <article className="premium-card group relative p-0 overflow-hidden bg-white/50 backdrop-blur-md">
      {/* Product Image Area */}
      <Link href={`/products/${listing.product.id}`} className="block relative aspect-4/5 overflow-hidden bg-slate-100/50">
        {listing.product?.catalog?.images && listing.product.catalog.images.length > 0 ? (
          <img
            src={
              listing.product.catalog.images.find((img: any) => img.isPrimary)?.url ||
              listing.product.catalog.images[0].url
            }
            alt={listing.product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-slate-300 animate-pulse" />
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-slate-900/60 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex justify-center translate-y-2 group-hover:translate-y-0">
          <div className="btn-secondary py-2 px-6 flex items-center gap-2 text-sm shadow-2xl">
            <Eye size={16} />
            Quick View
          </div>
        </div>

        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2x border-white/20 backdrop-blur-md ${listing.stockQuantity > 0
            ? "bg-green-500/90 text-white"
            : "bg-red-500/90 text-white"
            }`}
          >
            {listing.stockQuantity > 0 ? "In Stock" : "Limited"}
          </div>
          {listing.compareAtPrice && Number(listing.compareAtPrice) > Number(listing.price) && (
            <div className="bg-slate-950 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl">
              -{Math.round(((Number(listing.compareAtPrice) - Number(listing.price)) / Number(listing.compareAtPrice)) * 100)}%
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4">
          <WishlistButton productId={listing.product.id} />
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1 flex-1">
            <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest leading-none">
              {listing.product.brand || "Bazaary Verified"}
            </p>
            <h2 className="text-xl font-display font-black text-slate-950 line-clamp-1 h-7">
              {listing.product.name}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xl font-display font-black text-slate-950">
              ₹{listing.price.toLocaleString()}
            </span>
            {listing.compareAtPrice && Number(listing.compareAtPrice) > Number(listing.price) && (
              <p className="text-xs text-slate-400 line-through font-bold">
                ₹{Number(listing.compareAtPrice).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
          <div className="flex items-center gap-2 group/seller cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-slate-900/5 flex items-center justify-center text-slate-400 group-hover/seller:bg-slate-950 group-hover/seller:text-white transition-all duration-500">
              <Store size={14} />
            </div>
            <span className="text-xs font-bold text-slate-500 group-hover/seller:text-slate-950 transition-colors">
              {listing.seller.businessName}
            </span>
          </div>

          <Link
            href={`/products/${listing.product.id}`}
            className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center hover:bg-brand-600 shadow-lg shadow-slate-950/10 hover:shadow-brand-500/20 active:scale-90 transition-all duration-500"
          >
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </article>

  );
}
