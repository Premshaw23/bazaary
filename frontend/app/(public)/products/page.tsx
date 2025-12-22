import { getMarketplaceListings } from "@/lib/api/listings";

export const metadata = {
  title: "Marketplace | Bazaary",
  description: "Browse products from multiple sellers on Bazaary",
};

export default async function ProductsPage() {
  let listings = [];

  try {
    listings = await getMarketplaceListings();
  } catch (error) {
    return (
      <div className="p-8 text-red-600">
        Failed to load marketplace. Please try again later.
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="card-premium text-gray-500">No products available right now.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-extrabold mb-8">Marketplace</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {listings.map((listing) => (
            <article
              key={listing.id}
              className="card-premium flex flex-col min-h-56 p-6 hover:shadow-lg transition-shadow"
              tabIndex={0}
              aria-label={listing.product.name}
            >
              {/* Placeholder for product image */}
              <div className="w-full h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                <span className="text-gray-200 text-5xl">🛒</span>
              </div>
              <h2 className="text-lg font-bold mb-1 truncate text-gray-900" title={listing.product.name}>
                {listing.product.name}
              </h2>
              {listing.product.description && (
                <p className="text-sm text-gray-500 mb-2 line-clamp-2" title={listing.product.description}>
                  {listing.product.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-2">
                {listing.seller && (
                  <span>Seller: <b className="text-gray-700">{listing.seller.businessName}</b></span>
                )}
                <span className="ml-auto">ID: <span className="font-mono">{listing.id}</span></span>
              </div>
              <div className="mt-auto flex items-center justify-between gap-2">
                <span className="text-xl font-extrabold text-green-700">
                  ₹{listing.price}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    listing.stockQuantity > 0
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}
                  aria-label={listing.stockQuantity > 0 ? "In stock" : "Out of stock"}
                >
                  {listing.stockQuantity > 0 ? "In stock" : "Out of stock"}
                </span>
                <a
                  href={`/products/${listing.product.id}`}
                  className="btn-premium px-6 py-2 text-sm"
                  tabIndex={0}
                >
                  View
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
