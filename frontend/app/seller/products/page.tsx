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
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <input
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border p-2"
        />
        <input
          placeholder="SKU"
          value={sku}
          onChange={e => setSku(e.target.value)}
          className="border p-2"
        />
        <input
          placeholder="Brand"
          value={brand}
          onChange={e => setBrand(e.target.value)}
          className="border p-2"
        />
        <input
          placeholder="Short Description"
          value={shortDescription}
          onChange={e => setShortDescription(e.target.value)}
          className="border p-2"
        />
        <input
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border p-2 col-span-2"
        />
        <input
          placeholder="Image URL"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          className="border p-2"
        />
        <input
          placeholder="Image Alt"
          value={imageAlt}
          onChange={e => setImageAlt(e.target.value)}
          className="border p-2"
        />
        <input
          placeholder="Search Keywords (comma separated)"
          value={searchKeywords}
          onChange={e => setSearchKeywords(e.target.value)}
          className="border p-2 col-span-2"
        />
      </div>

      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <input
            placeholder="Spec Key"
            value={specKey}
            onChange={e => setSpecKey(e.target.value)}
            className="border p-2"
          />
          <input
            placeholder="Spec Value"
            value={specValue}
            onChange={e => setSpecValue(e.target.value)}
            className="border p-2"
          />
          <button
            onClick={addSpecification}
            className="bg-gray-300 px-3"
          >
            Add Spec
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(specifications).map(([key, value]) => (
            <span key={key} className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center">
              {key}: {value}
              <button onClick={() => removeSpecification(key)} className="ml-2 text-red-500">&times;</button>
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={submit}
        className="bg-blue-600 text-white px-4 mb-6"
      >
        Add Product
      </button>

      <ul className="space-y-2">
        {products.map(p => (
          <li key={p.id} className="border p-2">
            {p.name} ({p.sku})
          </li>
        ))}
      </ul>
    </div>
  );
}
