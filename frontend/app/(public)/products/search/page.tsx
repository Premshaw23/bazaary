"use client"
import ProductSearchBar from "@/components/ProductSearchBar";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ProductSearchPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedImages, setSelectedImages] = useState<{ [key: number]: number }>({});
  const searchParams = useSearchParams();

  // On mount, if q param exists, search
  useEffect(() => {
    const q = searchParams.get("q") || "";
    if (q.trim()) {
      setLoading(true);
      setError("");
      fetch(`/api/products/search?q=${encodeURIComponent(q)}`)
        .then(res => {
          if (!res.ok) throw new Error("Search failed");
          return res.json();
        })
        .then(data => setResults(data))
        .catch(err => setError(err.message || "Search error"))
        .finally(() => setLoading(false));
    }
  }, [searchParams]);

  const handleThumbnailClick = (productId: number, imageIndex: number) => {
    setSelectedImages(prev => ({ ...prev, [productId]: imageIndex }));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Sticky Header with Search and Title */}
      <div className="bg-white/80 backdrop-blur-md sticky top-[60px] z-30 border-y border-slate-200 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-display font-bold text-slate-900 hidden md:block">
            Marketplace
          </h1>
          <div className="w-full md:w-auto md:flex-1 md:max-w-2xl">
            <ProductSearchBar
              onResults={results => { setResults(results); setError(""); }}
              initialQuery={searchParams.get("q") || ""}
              compact={true} // Add a compact mode/prop if needed, or just standard
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-12">
        {loading && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent absolute top-0"></div>
            </div>
            <p className="text-slate-600 font-medium mt-4 animate-pulse">Searching for products...</p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((product) => {
            const currentImageIndex = selectedImages[product.id] || 0;

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-blue-200 hover:-translate-y-1"
              >
                {/* Image Section */}
                {product.images && product.images.length > 0 && (
                  <div className="relative bg-linear-to-br from-slate-50 to-slate-100 p-6">
                    <div className="aspect-square relative overflow-hidden rounded-xl bg-white">
                      <img
                        src={product.images[currentImageIndex].url}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Video Badge */}
                      {product.videos && product.videos.length > 0 && (
                        <div className="absolute top-3 right-3 bg-linear-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                          <span>🎬</span>
                          <span>Video</span>
                        </div>
                      )}

                      {/* Stock Badge */}
                      {product.stockQuantity !== undefined && (
                        <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${product.stockQuantity > 0
                          ? 'bg-linear-to-r from-green-500 to-emerald-500 text-white'
                          : 'bg-linear-to-r from-red-500 to-rose-500 text-white'
                          }`}>
                          {product.stockQuantity > 0 ? '✓ In Stock' : '✕ Out of Stock'}
                        </div>
                      )}
                    </div>

                    {/* Thumbnails */}
                    {product.images.length > 1 && (
                      <div className="flex gap-2 mt-3 justify-center">
                        {product.images.slice(0, 4).map((img: { url: string }, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => handleThumbnailClick(product.id, idx)}
                            className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${currentImageIndex === idx
                              ? 'border-blue-500 ring-2 ring-blue-200 scale-110'
                              : 'border-slate-200 hover:border-blue-300 opacity-70 hover:opacity-100'
                              }`}
                          >
                            <img
                              src={img.url}
                              alt={`${product.name} view ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Content Section */}
                <div className="p-5">
                  {/* Brand */}
                  {product.brand && (
                    <div className="mb-2">
                      <span className="inline-block px-3 py-1 bg-linear-to-r from-blue-500 to-indigo-500 text-white text-xs rounded-full font-bold uppercase tracking-wide shadow-sm">
                        {product.brand}
                      </span>
                    </div>
                  )}

                  {/* Product Name */}
                  <h2 className="font-bold text-lg mb-2 text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h2>

                  {/* Description */}
                  <p className="text-slate-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                    {product.shortDescription || product.description}
                  </p>

                  {/* Variants */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {product.variants.slice(0, 2).map((variant: { name: string; values: string[] }, idx: number) => (
                        <span
                          key={idx}
                          className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg border border-slate-200 font-medium"
                        >
                          {variant.name}: {variant.values.slice(0, 2).join(', ')}
                          {variant.values.length > 2 && ` +${variant.values.length - 2}`}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Specifications */}
                  {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div className="mb-3">
                      <div className="group/specs relative inline-block">
                        <button className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          View Specs
                        </button>
                        <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-slate-200 shadow-xl rounded-xl p-3 opacity-0 invisible group-hover/specs:opacity-100 group-hover/specs:visible transition-all duration-200 z-20">
                          <div className="space-y-2">
                            {Object.entries(product.specifications).slice(0, 5).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-xs border-b border-slate-100 pb-1.5 last:border-0">
                                <span className="font-semibold text-slate-700">{key}:</span>
                                <span className="text-slate-600">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  {product.price !== undefined && (
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ₹{product.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 line-through">
                        ₹{(product.price * 1.2).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* CTA Button */}
                  <a
                    href={`/products/${product.id}`}
                    className="block w-full px-4 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-center transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                  >
                    View Details
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {(!loading && results.length === 0 && !error) && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No products found</h3>
            <p className="text-slate-500">Try searching with different keywords</p>
          </div>
        )}
      </div>
    </div>
  );
}