import { apiFetch } from "./client";

export function createListing(data: {
  productId: string;
  price: number;
  stockQuantity: number;
  compareAtPrice?: number;
  condition?: string;
  warrantyMonths?: number;
  returnWindowDays?: number;
}) {
  return apiFetch("/listings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
