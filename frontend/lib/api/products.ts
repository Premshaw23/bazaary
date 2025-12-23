import { apiFetch } from "./client";


export type ProductCatalog = {
  description: string;
  shortDescription?: string;
  images?: {
    url: string;
    alt?: string;
    order?: number;
    isPrimary?: boolean;
  }[];
  videos?: string[];
  specifications?: Record<string, string>;
  variants?: {
    name: string;
    values: string[];
  }[];
  seo?: {
    title?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  searchKeywords?: string[];
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  brand?: string;
  categoryId?: string;
  mongoRef?: string;
  createdAt?: string;
  updatedAt?: string;
  catalog?: ProductCatalog | null;
};

export async function getProductById(productId: string) {
  return apiFetch<Product>(`/products/${productId}`, {
    cache: "no-store",
  });
}

export async function getAllProducts() {
  return apiFetch<Product[]>("/products", {
    cache: "no-store",
  });
}

export async function deleteProduct(productId: string) {
  return apiFetch(`/products/${productId}`, {
    method: "DELETE",
  });
}
