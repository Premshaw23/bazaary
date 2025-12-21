import { notFound } from "next/navigation";
import { getProductById } from "@/lib/api/products";
import { getListingsByProduct } from "@/lib/api/listings";
import AddToCartButton from "@/components/AddToCartButton";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

type Props = {
  params: {
    id: string;
  };
};

export default async function ProductDetailPage({ params }: Props) {
  const productId = (await params).id;

  let product;
  let listings;
  let userRole: string | null = null;

  try {
    product = await getProductById(productId);
    listings = await getListingsByProduct(productId);

    // Try to get user role from cookie (server component)
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

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Product Info */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{product.name}</h1>

        {product.description && (
          <p className="mt-2 text-gray-600">
            {product.description}
          </p>
        )}
      </div>

      {/* Listings */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Available Sellers
        </h2>

        {listings.length === 0 && (
          <p className="text-gray-500">
            No sellers currently offering this product.
          </p>
        )}

        <div className="space-y-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="border rounded-lg p-4 flex flex-col gap-2 bg-white shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <p className="font-medium text-lg">
                    Seller: {listing.seller.businessName}
                  </p>
                  <p className="text-sm text-gray-500">
                    Listing ID: <span className="font-mono">{listing.id}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Seller ID: <span className="font-mono">{listing.seller.id}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {listing.stockQuantity > 0 ? (
                      <span className="text-green-600">In stock</span>
                    ) : (
                      <span className="text-red-600">Out of stock</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    Available Stock: <span className="font-semibold">{listing.stockQuantity}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                  <span className="text-lg font-bold text-green-700">
                    ₹{listing.price}
                  </span>
                  {userRole === "SELLER" ? (
                    <span className="text-gray-400 italic">Sellers cannot add to cart</span>
                  ) : (
                    <AddToCartButton
                      listingId={listing.id}
                      productName={product.name}
                      sellerName={listing.seller.businessName}
                      price={listing.price}
                    />
                  )}
                </div>
              </div>

              // ...existing code...
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
