"use client";

import { useEffect, useState } from "react";
import { getSellerProducts, createProduct } from "@/lib/api/seller-products";

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [specifications, setSpecifications] = useState<Record<string, string>>({});
  const [searchKeywords, setSearchKeywords] = useState("");

  async function load() {
    const data = await getSellerProducts();
    setProducts(data);
  }

  useEffect(() => {
    load();
  }, []);

  function addSpecification() {
    if (specKey && specValue) {
      setSpecifications(prev => ({ ...prev, [specKey]: specValue }));
      setSpecKey("");
      setSpecValue("");
    }
  }

  function removeSpecification(key: string) {
    setSpecifications(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }

  async function submit() {
    await createProduct({
      name,
      sku,
      brand,
      description,
      shortDescription,
      images: imageUrl ? [{ url: imageUrl, alt: imageAlt }] : [],
      specifications,
      searchKeywords: searchKeywords.split(",").map(k => k.trim()).filter(Boolean),
    });
    setName("");
    setSku("");
    setBrand("");
    setDescription("");
    setShortDescription("");
    setImageUrl("");
    setImageAlt("");
    setSpecifications({});
    setSearchKeywords("");
    load();
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 tracking-tight">Products</h1>

      {/* Product Form */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="SKU"
              value={sku}
              onChange={e => setSku(e.target.value)}
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Brand"
              value={brand}
              onChange={e => setBrand(e.target.value)}
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Short Description"
              value={shortDescription}
              onChange={e => setShortDescription(e.target.value)}
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 col-span-2"
            />
            <input
              placeholder="Image URL"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Image Alt"
              value={imageAlt}
              onChange={e => setImageAlt(e.target.value)}
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Search Keywords (comma separated)"
              value={searchKeywords}
              onChange={e => setSearchKeywords(e.target.value)}
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 col-span-2"
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 mb-2">
            <input
              placeholder="Spec Key"
              value={specKey}
              onChange={e => setSpecKey(e.target.value)}
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Spec Value"
              value={specValue}
              onChange={e => setSpecValue(e.target.value)}
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addSpecification}
              className="bg-blue-100 text-blue-700 font-semibold px-4 rounded-lg hover:bg-blue-200 transition"
            >
              Add Spec
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(specifications).map(([key, value]) => (
              <span key={key} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                {key}: {value}
                <button onClick={() => removeSpecification(key)} className="ml-2 text-red-500 hover:text-red-700">&times;</button>
              </span>
            ))}
          </div>
          <button
            onClick={submit}
            className="mt-4 w-full py-3 rounded-lg font-bold text-white text-lg bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-bold text-lg text-gray-900">{p.name}</div>
                <div className="text-xs text-gray-500">SKU: {p.sku}</div>
              </div>
            </div>
            {/* Optionally show more product info here */}
          </div>
        ))}
      </div>
    </div>
  );
}
