
// ============================================================
// 4. WISHLIST PAGE
// ============================================================
"use client";
import { useEffect, useState } from "react";
import { getWishlist, setWishlist } from "@/lib/api/wishlist";
import { getProductById } from "@/lib/api/products";
import { useAuth } from "@/lib/auth/context";
import Link from "next/link";
import { Heart, Trash2, Eye, Package, Loader2 } from "lucide-react";

export default function WishlistPage() {
  const { user } = useAuth();
  const [wishlist, setLocalWishlist] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getWishlist().then(async (ids) => {
      setLocalWishlist(ids);
      const prods = await Promise.all(
        ids.map(async (id) => {
          try {
            return await getProductById(id);
          } catch {
            return null;
          }
        })
      );
      setProducts(prods.filter(Boolean));
      setLoading(false);
    });
  }, [user]);

  const handleRemove = async (id: string) => {
    const newWishlist = wishlist.filter(pid => pid !== id);
    await setWishlist(newWishlist);
    setLocalWishlist(newWishlist);
    setProducts(products.filter(p => p.id !== id));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Login Required</h2>
          <p className="text-slate-600 mb-4">Please login to view your wishlist.</p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-3">
              <Heart className="w-8 h-8 text-pink-500 fill-current" />
              My Wishlist
            </h1>
            <p className="text-slate-600 mt-2">Your favorite products saved for later</p>
          </div>
          {!loading && products.length > 0 && (
            <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="text-xs text-slate-500">Items</div>
              <div className="text-2xl font-bold text-pink-600">{products.length}</div>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Loading your wishlist...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 shadow-lg p-12 text-center">
            <Heart className="w-20 h-20 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Wishlist is Empty</h2>
            <p className="text-slate-600 mb-6">Start adding products you love!</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row gap-4 p-5">
                  {/* Product Image */}
                  <div className="w-full sm:w-32 h-32 shrink-0 bg-linear-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center p-4">
                    {product.catalog?.images?.[0]?.url ? (
                      <img
                        src={product.catalog.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-slate-400" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{product.name}</h3>
                    {product.brand && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium mb-2">
                        {product.brand}
                      </span>
                    )}
                    {product.catalog?.shortDescription && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {product.catalog.shortDescription}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 justify-end">
                    <Link
                      href={`/products/${product.id}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-sm transition-all duration-300 border border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}