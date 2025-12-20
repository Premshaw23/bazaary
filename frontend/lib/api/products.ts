import { apiFetch } from "./client";

export type Product = {
  id: string;
  name: string;
  description?: string;
};

export async function getProductById(productId: string) {
  return apiFetch<Product>(`/products/${productId}`, {
    cache: "no-store",
  });
}
