import { apiFetch } from "./client";

export type Listing = {
  id: string;
  price: number;
  stockQuantity: number;
  product: {
    id: string;
    name: string;
    description?: string;
  };
};

export async function getMarketplaceListings() {
  return apiFetch<Listing[]>("/listings", {
    cache: "no-store",
  });
}


export type ListingForProduct = {
  id: string;
  price: number;
  stockQuantity: number;
  seller: {
    id: string;
    businessName: string;
  };
};

export async function getListingsByProduct(productId: string) {
  return apiFetch<ListingForProduct[]>(
    `/listings?productId=${productId}`,
    { cache: "no-store" }
  );
}
