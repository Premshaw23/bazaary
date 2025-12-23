"use client";

import { useEffect, useState } from "react";
import { getAllProducts } from "@/lib/api/products";
import { createListing } from "@/lib/api/seller-listings";
import {
  Package,
  DollarSign,
  Box,
  Tag,
  Shield,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Store,
  Info
} from "lucide-react";

type ListingStatus = {
  loading: boolean;
  success: boolean;
  error: string;
};

export default function SellerListingsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [warrantyMonths, setWarrantyMonths] = useState("");
  const [returnWindowDays, setReturnWindowDays] = useState("");
  const [listingStatus, setListingStatus] = useState<Record<string, ListingStatus>>({});
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  async function loadProducts() {
    const data = await getAllProducts();
    setProducts(data ?? []);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function isValidNumber(val: string) {
    return val.trim() !== "" && !isNaN(Number(val)) && Number(val) > 0;
  }

  const validConditions = ["NEW", "REFURBISHED", "USED"];
  function isValidCondition(val: string) {
    return validConditions.includes(val.trim().toUpperCase());
  }

  function validateFields() {
    return isValidNumber(price) && isValidNumber(stock) && isValidCondition(condition);
  }

  async function addListing(productId: string) {
    if (!isValidNumber(price) || !isValidNumber(stock)) {
      setListingStatus((prev) => ({
        ...prev,
        [productId]: { loading: false, success: false, error: "Please enter valid numbers for price and stock (required)." },
      }));
      return;
    }
    if (!isValidCondition(condition)) {
      setListingStatus((prev) => ({
        ...prev,
        [productId]: { loading: false, success: false, error: "Condition must be one of: NEW, REFURBISHED, USED." },
      }));
      return;
    }
    setListingStatus((prev) => ({
      ...prev,
      [productId]: { loading: true, success: false, error: "" },
    }));
    try {
      const priceValue = Number(price);
      const stockValue = Number(stock);
      const compareAtPriceValue = compareAtPrice ? Number(compareAtPrice) : undefined;
      const warrantyMonthsValue = warrantyMonths ? Number(warrantyMonths) : undefined;
      const returnWindowDaysValue = returnWindowDays ? Number(returnWindowDays) : undefined;
      await createListing({
        productId,
        price: priceValue,
        stockQuantity: stockValue,
        compareAtPrice: compareAtPriceValue,
        condition: condition.trim().toUpperCase(),
        warrantyMonths: warrantyMonthsValue,
        returnWindowDays: returnWindowDaysValue,
      });
      setListingStatus((prev) => ({
        ...prev,
        [productId]: { loading: false, success: true, error: "" },
      }));
      setPrice("");
      setStock("");
      setCompareAtPrice("");
      setCondition("");
      setWarrantyMonths("");
      setReturnWindowDays("");
      setSelectedProduct(null);
      loadProducts();
    } catch (err: any) {
      setListingStatus((prev) => ({
        ...prev,
        [productId]: { loading: false, success: false, error: err?.message || "Unknown error" },
      }));
    }
  }

  const listedCount = products.filter(p => p.listingId || p.hasListing).length;
  const availableCount = products.length - listedCount;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-3">
              <Store className="w-8 h-8 text-blue-600" />
              Product Listings
            </h1>
            <p className="text-slate-600 mt-2">Create listings for products in the marketplace</p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="text-xs text-slate-500">Listed</div>
              <div className="text-2xl font-bold text-blue-600">{listedCount}</div>
            </div>
            <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="text-xs text-slate-500">Available</div>
              <div className="text-2xl font-bold text-green-600">{availableCount}</div>
            </div>
          </div>
        </div>

        {/* Listing Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-8 overflow-hidden">
          <div className="bg-linear-to-r from-blue-500 to-purple-600 p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Tag className="w-5 h-5" />
              New Listing Details
            </h2>
            <p className="text-blue-100 text-sm mt-1">Fill in the details below and select a product to create a listing</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Price */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  Price *
                </label>
                <input
                  type="number"
                  placeholder="Enter price"
                  className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>

              {/* Compare At Price */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Tag className="w-4 h-4 text-slate-600" />
                  Compare At Price
                </label>
                <input
                  type="number"
                  placeholder="Original price"
                  className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={compareAtPrice}
                  onChange={e => setCompareAtPrice(e.target.value)}
                />
              </div>

              {/* Stock */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Box className="w-4 h-4 text-blue-600" />
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  placeholder="Available quantity"
                  className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                />
              </div>

              {/* Condition */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  Condition *
                </label>
                <select
                  className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={condition}
                  onChange={e => setCondition(e.target.value)}
                >
                  <option value="">Select condition</option>
                  <option value="NEW">NEW</option>
                  <option value="REFURBISHED">REFURBISHED</option>
                  <option value="USED">USED</option>
                </select>
              </div>

              {/* Warranty */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Shield className="w-4 h-4 text-slate-600" />
                  Warranty (months)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 12"
                  className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={warrantyMonths}
                  onChange={e => setWarrantyMonths(e.target.value)}
                />
              </div>

              {/* Return Window */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <RotateCcw className="w-4 h-4 text-slate-600" />
                  Return Window (days)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 30"
                  className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={returnWindowDays}
                  onChange={e => setReturnWindowDays(e.target.value)}
                />
              </div>
            </div>

            {/* Info Alert */}
            <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Required fields are marked with *</p>
                <p>Select a product from the list below to create your listing with these details.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Available Products</h2>
          {products.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No products available</h3>
              <p className="text-slate-600">Create products first to list them</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => {
                const status = listingStatus[p.id] || { loading: false, success: false, error: "" };
                const alreadyListed = !!p.listingId || !!p.hasListing;
                const isSelected = selectedProduct === p.id;

                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-xl shadow-md border-2 transition-all duration-300 overflow-hidden ${
                      isSelected
                        ? "border-blue-500 shadow-xl ring-2 ring-blue-200"
                        : alreadyListed
                        ? "border-slate-200 opacity-60"
                        : "border-slate-200 hover:shadow-xl hover:border-blue-300"
                    }`}
                  >
                    {/* Product Image */}
                    <div className="aspect-video bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">
                      {p.catalog?.images?.[0] ? (
                        <img
                          src={p.catalog.images[0].url}
                          alt={p.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Package className="w-16 h-16 text-slate-400" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1">
                            {p.name}
                          </h3>
                          <p className="text-xs text-slate-500 font-mono">SKU: {p.sku}</p>
                          {p.brand && (
                            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                              {p.brand}
                            </span>
                          )}
                        </div>
                        {alreadyListed && (
                          <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Listed
                          </span>
                        )}
                      </div>

                      {/* Existing Listing Details */}
                      {p.listingDetails && (
                        <div className="mb-3 p-3 bg-slate-50 rounded-lg space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <Package className="w-3 h-3 text-slate-500" />
                            <span className="text-slate-700 font-medium">
                              Condition: {p.listingDetails.condition}
                            </span>
                          </div>
                          {p.listingDetails.warrantyMonths && (
                            <div className="flex items-center gap-2 text-xs">
                              <Shield className="w-3 h-3 text-slate-500" />
                              <span className="text-slate-700">
                                {p.listingDetails.warrantyMonths} months warranty
                              </span>
                            </div>
                          )}
                          {p.listingDetails.returnWindowDays && (
                            <div className="flex items-center gap-2 text-xs">
                              <RotateCcw className="w-3 h-3 text-slate-500" />
                              <span className="text-slate-700">
                                {p.listingDetails.returnWindowDays} days return
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          setSelectedProduct(p.id);
                          addListing(p.id);
                        }}
                        className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                          alreadyListed
                            ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                            : status.loading
                            ? "bg-blue-500 text-white"
                            : validateFields()
                            ? "bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                            : "bg-slate-200 text-slate-500 cursor-not-allowed"
                        }`}
                        disabled={status.loading || alreadyListed || !validateFields()}
                      >
                        {alreadyListed ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Already Listed
                          </>
                        ) : status.loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating Listing...
                          </>
                        ) : status.success ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Listing Created!
                          </>
                        ) : (
                          "Create Listing"
                        )}
                      </button>

                      {/* Error Message */}
                      {status.error && (
                        <div className="mt-2 flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{status.error}</span>
                        </div>
                      )}

                      {/* Success Message */}
                      {status.success && !status.loading && !alreadyListed && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Listing created successfully!</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}