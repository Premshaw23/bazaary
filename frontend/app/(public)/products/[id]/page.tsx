import { notFound } from "next/navigation";
import { getProductById, Product } from "@/lib/api/products";
import { getListingsByProduct } from "@/lib/api/listings";
import AddToCartButton from "@/components/AddToCartButton";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import {
  Package,
  ShoppingBag,
  Star,
  Shield,
  Truck,
  CheckCircle,
  XCircle,
  ChevronRight,
  Award,
  RefreshCw,
} from "lucide-react";

type Props = {
  params: {
    id: string;
  };
};

export default async function ProductDetailPage({ params }: Props) {
  const productId = (await params).id;

  let product: Product | null = null;
  let listings: any[] = [];
  let userRole: string | null = null;

  try {
    product = await getProductById(productId);
    listings = (await getListingsByProduct(productId)) || [];

    const cookieStore = cookies();
    const accessToken = (await cookieStore).get("access_token")?.value;
    if (accessToken) {
      try {
        const decoded: any = jwtDecode(accessToken);
        userRole = decoded.role || null;
      } catch {}
    }
  } catch {
    notFound();
  }

  if (!product) {
    notFound();
  }

  const lowestPrice =
    listings.length > 0 ? Math.min(...listings.map((l: any) => l.price)) : null;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-600 mb-8">
          <a href="/products" className="hover:text-blue-600 transition-colors font-medium">
            Products
          </a>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-semibold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left Column - Images */}
          <div className="space-y-6">
            {product.catalog?.images && product.catalog.images.length > 0 ? (
              <>
                {/* Main Image */}
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border-2 border-slate-200 shadow-2xl group">
                  <img
                    src={
                      product.catalog.images.find((img) => img.isPrimary)
                        ?.url || product.catalog.images[0].url
                    }
                    alt={product.name}
                    className="w-full h-full object-contain p-12 group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.brand && (
                    <div className="absolute top-6 left-6 bg-white/98 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border-2 border-slate-200">
                      <span className="text-sm font-bold text-slate-800">
                        {product.brand}
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {product.catalog.images.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {product.catalog.images.map((img, idx) => (
                      <div
                        key={img.url + idx}
                        className={`shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-3 cursor-pointer transition-all duration-300 ${
                          img.isPrimary
                            ? "border-blue-500 ring-4 ring-blue-200 shadow-lg scale-105"
                            : "border-slate-200 hover:border-blue-400 hover:shadow-md"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.alt || product.name}
                          className="w-full h-full object-contain bg-white p-2"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square rounded-3xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center border-2 border-slate-200 shadow-2xl">
                <Package className="w-32 h-32 text-slate-400" />
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {product.catalog?.shortDescription && (
                <p className="text-xl text-slate-600 leading-relaxed">
                  {product.catalog.shortDescription}
                </p>
              )}
            </div>

            {/* Price Section */}
            {lowestPrice && (
              <div className="relative overflow-hidden bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                <div className="relative">
                  <p className="text-sm text-blue-100 mb-2 font-medium">Starting from</p>
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-5xl font-black text-white">
                      ₹{lowestPrice.toLocaleString()}
                    </span>
                    <span className="text-lg text-blue-100">onwards</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-100">
                    <ShoppingBag className="w-4 h-4" />
                    <p className="text-sm font-medium">
                      {listings.length} seller{listings.length !== 1 ? "s" : ""} available
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-lg hover:shadow-xl hover:border-green-300 transition-all duration-300 group">
                <div className="w-14 h-14 bg-linear-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-bold text-slate-700 text-center">
                  Secure Payment
                </span>
              </div>
              <div className="flex flex-col items-center p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-lg hover:shadow-xl hover:border-blue-300 transition-all duration-300 group">
                <div className="w-14 h-14 bg-linear-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Truck className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-bold text-slate-700 text-center">
                  Fast Delivery
                </span>
              </div>
              <div className="flex flex-col items-center p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-lg hover:shadow-xl hover:border-amber-300 transition-all duration-300 group">
                <div className="w-14 h-14 bg-linear-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Star className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-bold text-slate-700 text-center">
                  Top Rated
                </span>
              </div>
            </div>

            {/* Description */}
            {product.catalog?.description && (
              <div className="bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-xl">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  About this product
                </h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {product.catalog.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Specifications */}
        {product.catalog?.specifications &&
          Object.keys(product.catalog.specifications).length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                Specifications
              </h2>
              <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {Object.entries(product.catalog.specifications).map(
                    ([key, value], idx) => (
                      <div
                        key={key}
                        className={`flex border-b last:border-b-0 hover:bg-slate-50 transition-colors ${
                          idx % 2 === 0 ? "md:border-r" : "md:border-r-0"
                        }`}
                      >
                        <div className="w-1/2 py-5 px-8 bg-linear-to-r from-slate-50 to-slate-100 font-bold text-slate-800">
                          {key}
                        </div>
                        <div className="w-1/2 py-5 px-8 text-slate-700 font-medium">
                          {value}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

        {/* Variants */}
        {product.catalog?.variants && product.catalog.variants.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              Available Variants
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.catalog.variants.map((variant) => (
                <div
                  key={variant.name}
                  className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-lg hover:shadow-2xl hover:border-blue-300 transition-all duration-300"
                >
                  <h4 className="font-bold text-lg text-slate-900 mb-4">
                    {variant.name}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {variant.values.map((value) => (
                      <span
                        key={value}
                        className="px-4 py-2 bg-linear-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl text-sm text-slate-800 font-semibold hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listings */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            Available Sellers
          </h2>

          {listings.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 border-2 border-slate-200 text-center shadow-xl">
              <Package className="w-20 h-20 text-slate-300 mx-auto mb-6" />
              <p className="text-slate-500 text-xl font-medium">
                No sellers currently offering this product.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {listings.map((listing: any) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      {/* Seller Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:scale-110 transition-transform">
                            {listing.seller.businessName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-slate-900">
                              {listing.seller.businessName}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                              <span className="font-mono bg-slate-100 px-2 py-1 rounded">
                                ID: {listing.seller.id.slice(0, 8)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {/* Stock Status */}
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${
                            listing.stockQuantity > 0
                              ? "bg-green-50 border-2 border-green-200"
                              : "bg-red-50 border-2 border-red-200"
                          }`}>
                            {listing.stockQuantity > 0 ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-green-700">
                                  In Stock ({listing.stockQuantity})
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 text-red-600" />
                                <span className="text-sm text-red-700">
                                  Out of Stock
                                </span>
                              </>
                            )}
                          </div>

                          {/* Additional Info */}
                          {listing.condition && (
                            <span className="flex items-center gap-1 text-xs bg-slate-100 px-3 py-2 rounded-xl text-slate-700 font-semibold border border-slate-200">
                              <Package className="w-3 h-3" />
                              {listing.condition}
                            </span>
                          )}
                          {listing.warrantyMonths && (
                            <span className="flex items-center gap-1 text-xs bg-blue-50 px-3 py-2 rounded-xl text-blue-700 font-semibold border border-blue-200">
                              <Shield className="w-3 h-3" />
                              {listing.warrantyMonths}mo warranty
                            </span>
                          )}
                          {listing.returnWindowDays && (
                            <span className="flex items-center gap-1 text-xs bg-purple-50 px-3 py-2 rounded-xl text-purple-700 font-semibold border border-purple-200">
                              <RefreshCw className="w-3 h-3" />
                              {listing.returnWindowDays}d returns
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="flex items-center gap-6 lg:flex-col lg:items-end">
                        <div className="text-right">
                          <p className="text-sm text-slate-500 mb-1 font-medium">Price</p>
                          <p className="text-4xl font-black bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            ₹{listing.price.toLocaleString()}
                          </p>
                        </div>

                        {userRole === "SELLER" ? (
                          <div className="px-8 py-4 bg-slate-100 text-slate-500 rounded-xl border-2 border-slate-200 text-sm font-bold text-center">
                            Sellers cannot purchase
                          </div>
                        ) : (
                          <AddToCartButton
                            listingId={listing.id}
                            productName={product.name}
                            sellerName={listing.seller.businessName}
                            price={listing.price}
                            productImage={
                              product.catalog?.images && product.catalog.images.length > 0
                                ? (product.catalog.images.find((img) => img.isPrimary)?.url || product.catalog.images[0].url)
                                : undefined
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}