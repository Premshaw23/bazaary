"use client";

import { useEffect, useState } from "react";
import { getAllProducts, deleteProduct, Product } from "@/lib/api/products";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const data = await getAllProducts();
    setProducts(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
      load();
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 tracking-tight">All Products (Admin)</h1>
      {loading ? (
        <div className="text-blue-600">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-bold text-lg text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-500">SKU: {p.sku}</div>
                  {p.brand && <div className="text-xs text-gray-400">Brand: {p.brand}</div>}
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-semibold transition"
                >
                  Delete
                </button>
              </div>
              {p.catalog?.shortDescription && (
                <div className="text-sm text-gray-700 mb-1">{p.catalog.shortDescription}</div>
              )}
              {p.catalog?.images && p.catalog.images.length > 0 && (
                <img src={p.catalog.images[0].url} alt={p.name} className="w-24 h-24 object-contain rounded border bg-white" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
