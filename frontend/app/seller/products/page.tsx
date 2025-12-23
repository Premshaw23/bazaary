"use client";

import { useEffect, useState } from "react";
import { getSellerProducts, createProduct } from "@/lib/api/seller-products";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Package, 
  Tag, 
  FileText, 
  Layers,
  Grid3x3,
  Search,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [images, setImages] = useState<{ url: string; alt: string }[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [variantName, setVariantName] = useState("");
  const [variantValue, setVariantValue] = useState("");
  const [variants, setVariants] = useState<{ name: string; values: string[] }[]>([]);
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [specifications, setSpecifications] = useState<Record<string, string>>({});
  const [searchKeywords, setSearchKeywords] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  async function load() {
    const data = await getSellerProducts();
    setProducts(data ?? []);
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

  function addImage() {
    if (imageUrl) {
      setImages(prev => [...prev, { url: imageUrl, alt: imageAlt }]);
      setImageUrl("");
      setImageAlt("");
    }
  }

  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx));
  }

  function addVariant() {
    if (variantName && variantValue) {
      setVariants(prev => {
        const existing = prev.find(v => v.name === variantName);
        if (existing) {
          return prev.map(v =>
            v.name === variantName
              ? { ...v, values: Array.from(new Set([...v.values, variantValue])) }
              : v
          );
        } else {
          return [...prev, { name: variantName, values: [variantValue] }];
        }
      });
      setVariantName("");
      setVariantValue("");
    }
  }

  function removeVariant(name: string, value?: string) {
    setVariants(prev =>
      prev
        .map(v =>
          v.name === name
            ? { ...v, values: value ? v.values.filter(val => val !== value) : [] }
            : v
        )
        .filter(v => v.values.length > 0)
    );
  }

  async function submit() {
    setLoading(true);
    try {
      await createProduct({
        name,
        sku,
        brand,
        description,
        shortDescription,
        images,
        specifications,
        searchKeywords: searchKeywords.split(",").map(k => k.trim()).filter(Boolean),
      });
      // Reset form
      setName("");
      setSku("");
      setBrand("");
      setDescription("");
      setShortDescription("");
      setImages([]);
      setImageUrl("");
      setImageAlt("");
      setSpecifications({});
      setSearchKeywords("");
      setVariants([]);
      setVariantName("");
      setVariantValue("");
      setIsFormOpen(false);
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              My Products
            </h1>
            <p className="text-slate-600 mt-2">Manage your product catalog</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
              {products.length} Products
            </span>
          </div>
        </div>

        {/* Add Product Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-8 overflow-hidden">
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-slate-900">Add New Product</h2>
                <p className="text-sm text-slate-600">Create a new product in your catalog</p>
              </div>
            </div>
            {isFormOpen ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {isFormOpen && (
            <div className="p-6 pt-0 border-t border-slate-100">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Information */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Product Name *
                        </label>
                        <input
                          placeholder="Enter product name"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          SKU *
                        </label>
                        <input
                          placeholder="Product SKU"
                          value={sku}
                          onChange={e => setSku(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Brand
                        </label>
                        <input
                          placeholder="Brand name"
                          value={brand}
                          onChange={e => setBrand(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Short Description
                        </label>
                        <input
                          placeholder="Brief description (shown in listings)"
                          value={shortDescription}
                          onChange={e => setShortDescription(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Full Description
                        </label>
                        <textarea
                          placeholder="Detailed product description"
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          rows={3}
                          className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                      Product Images
                    </h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          placeholder="Image URL"
                          value={imageUrl}
                          onChange={e => setImageUrl(e.target.value)}
                          className="flex-1 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <input
                          placeholder="Alt text"
                          value={imageAlt}
                          onChange={e => setImageAlt(e.target.value)}
                          className="flex-1 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={addImage}
                          className="px-4 py-3 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                      {images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {images.map((img, idx) => (
                            <div
                              key={idx}
                              className="relative group bg-slate-50 border border-slate-200 rounded-lg p-3 hover:border-blue-300 transition-all"
                            >
                              <img
                                src={img.url}
                                alt={img.alt}
                                className="w-full h-24 object-contain rounded mb-2"
                              />
                              <p className="text-xs text-slate-600 truncate">{img.alt || "No alt text"}</p>
                              <button
                                onClick={() => removeImage(idx)}
                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Variants */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-blue-600" />
                      Product Variants
                    </h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          placeholder="Variant name (e.g., Size)"
                          value={variantName}
                          onChange={e => setVariantName(e.target.value)}
                          className="flex-1 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <input
                          placeholder="Value (e.g., M)"
                          value={variantValue}
                          onChange={e => setVariantValue(e.target.value)}
                          className="flex-1 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={addVariant}
                          className="px-4 py-3 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                      {variants.length > 0 && (
                        <div className="space-y-2">
                          {variants.map((variant) => (
                            <div
                              key={variant.name}
                              className="bg-linear-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-slate-900">{variant.name}</span>
                                <button
                                  onClick={() => removeVariant(variant.name)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {variant.values.map((val) => (
                                  <span
                                    key={val}
                                    className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm border border-blue-200"
                                  >
                                    {val}
                                    <button
                                      onClick={() => removeVariant(variant.name, val)}
                                      className="text-red-500 hover:text-red-700 ml-1"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Search Keywords */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Search className="w-5 h-5 text-blue-600" />
                      Search Keywords
                    </h3>
                    <input
                      placeholder="Enter keywords separated by commas"
                      value={searchKeywords}
                      onChange={e => setSearchKeywords(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Specifications Sidebar */}
                <div className="space-y-6">
                  <div className="bg-linear-to-br from-slate-50 to-blue-50/50 rounded-xl p-6 border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Grid3x3 className="w-5 h-5 text-blue-600" />
                      Specifications
                    </h3>
                    <div className="space-y-3">
                      <input
                        placeholder="Key (e.g., Weight)"
                        value={specKey}
                        onChange={e => setSpecKey(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      />
                      <input
                        placeholder="Value (e.g., 500g)"
                        value={specValue}
                        onChange={e => setSpecValue(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      />
                      <button
                        onClick={addSpecification}
                        className="w-full px-4 py-3 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Specification
                      </button>
                    </div>
                    {Object.keys(specifications).length > 0 && (
                      <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                        {Object.entries(specifications).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 text-sm"
                          >
                            <div>
                              <span className="font-semibold text-slate-900">{key}:</span>
                              <span className="text-slate-600 ml-2">{value}</span>
                            </div>
                            <button
                              onClick={() => removeSpecification(key)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={submit}
                    disabled={loading || !name || !sku}
                    className="w-full py-4 rounded-xl font-bold text-white text-lg bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? "Adding Product..." : "Add Product"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product List */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Product Catalog</h2>
          {products.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No products yet</h3>
              <p className="text-slate-600">Start by adding your first product above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">
                    {p.catalog?.images?.[0] ? (
                      <img
                        src={p.catalog.images[0].url}
                        alt={p.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Package className="w-20 h-20 text-slate-400" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-mono">SKU: {p.sku}</span>
                        {p.brand && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            {p.brand}
                          </span>
                        )}
                      </div>
                    </div>

                    {p.catalog?.shortDescription && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                        {p.catalog.shortDescription}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {p.catalog?.images && (
                          <span className="flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {p.catalog.images.length}
                          </span>
                        )}
                        {p.catalog?.variants && (
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {p.catalog.variants.length}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}