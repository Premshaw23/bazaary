import { apiFetch } from "./client";

export type SellerProduct = {
  id: string;
  name: string;
  sku: string;
};

export function getSellerProducts() {
  return apiFetch<SellerProduct[]>("/products/my");
}

export function createProduct(data: {
  sku: string;
  name: string;
  description: string;
  brand: string;
  shortDescription: string;
  images: { url: string; alt: string }[];
  specifications: Record<string, string>;
  searchKeywords: string[];
}) {
  return apiFetch("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
