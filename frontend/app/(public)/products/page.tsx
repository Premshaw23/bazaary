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
          <div
            key={listing.id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <h2 className="text-lg font-semibold">
              {listing.product.name}
            </h2>

            {listing.product.description && (
              <p className="text-sm text-gray-600 mt-1">
                {listing.product.description}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xl font-bold text-green-700">
                ₹{listing.price}
              </span>

              <span
                className={`text-sm ${
                  listing.stockQuantity > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {listing.stockQuantity > 0
                  ? "In stock"
                  : "Out of stock"}
              </span>
              <a
                href={`/products/${listing.product.id}`}
                className="ml-4 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
              >
                View
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
