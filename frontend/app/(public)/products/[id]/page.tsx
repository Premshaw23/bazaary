import { notFound } from "next/navigation";
import { getProductById } from "@/lib/api/products";
import { getListingsByProduct } from "@/lib/api/listings";
import AddToCartButton from "@/components/AddToCartButton";

type Props = {
  params: {
    id: string;
  };
};

export default async function ProductDetailPage({ params }: Props) {
  const productId = (await params).id;

  let product;
  let listings;

  try {
    product = await getProductById(productId);
    listings = await getListingsByProduct(productId);
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
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">
                  {listing.seller.businessName}
                </p>

                <p className="text-sm text-gray-500">
                  {listing.stockQuantity > 0
                    ? "In stock"
                    : "Out of stock"}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-green-700">
                  ₹{listing.price}
                </span>

                <AddToCartButton
                  listingId={listing.id}
                  productName={product.name}
                  sellerName={listing.seller.businessName}
                  price={listing.price}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
