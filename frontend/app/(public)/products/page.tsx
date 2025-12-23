
import { getMarketplaceListings } from "@/lib/api/listings";
import ProductCard from "@/components/ProductCard";


export const metadata = {
  title: "Marketplace | Bazaary",
  description: "Browse products from multiple sellers on Bazaary",
};

export default async function ProductsPage() {

  let listings = [];
  try {
    const result = await getMarketplaceListings();
    listings = result ?? [];
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

  // Search bar with redirect to /products/search
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-extrabold mb-8">Marketplace</h1>
        <form
          action="/products/search"
          method="get"
          className="flex gap-2 items-center w-full max-w-xl mx-auto mb-8"
        >
          <input
            type="text"
            name="q"
            placeholder="Search products..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Search
          </button>
        </form>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {listings.map((listing) => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </div>
  );
}
