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
      <div className="p-8 text-gray-600">
        No products available right now.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Marketplace</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <article
            key={listing.id}
            className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-lg transition-shadow flex flex-col min-h-55"
            tabIndex={0}
            aria-label={listing.product.name}
          >
            {/* Placeholder for product image */}
            <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center mb-3">
              <span className="text-gray-300 text-4xl">🛒</span>
            </div>
            <h2 className="text-lg font-semibold mb-1 truncate" title={listing.product.name}>
              {listing.product.name}
            </h2>
            {listing.product.description && (
              <p className="text-sm text-gray-600 mb-1 line-clamp-2" title={listing.product.description}>
                {listing.product.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
              {listing.seller && (
                <span>Seller: <b>{listing.seller.businessName}</b></span>
              )}
              <span className="ml-auto">ID: <span className="font-mono">{listing.id}</span></span>
            </div>
            <div className="mt-auto flex items-center justify-between gap-2">
              <span className="text-xl font-bold text-green-700">
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
                className="ml-2 bg-blue-600 text-white px-4 py-1.5 rounded font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                tabIndex={0}
              >
                View
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
