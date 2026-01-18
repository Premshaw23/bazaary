import { apiFetch } from './client';

export interface SearchResult {
  id: string;
  name: string;
  description?: string;
  price: number;
  slug: string;
  category?: string;
  categoryId?: string;
  images?: { url: string; isPrimary?: boolean }[];
  brand?: string;
  stockQuantity: number;
}

export interface SearchResponse {
  hits: SearchResult[];
  offset?: number;
  limit?: number;
  estimatedTotalHits?: number;
}

export const searchProducts = async (query: string, category?: string): Promise<SearchResponse> => {
  const searchParams = new URLSearchParams();
  if (query) searchParams.append('q', query);
  if (category) searchParams.append('category', category);
  
  const response = await apiFetch<SearchResponse>(`/search?${searchParams.toString()}`);
  return response || { hits: [] };
};
