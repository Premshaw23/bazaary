
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-extrabold mb-8">Marketplace</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {listings.map((listing) => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </div>
  );
}
