"use client";

import { useEffect, useState } from "react";
import { getSellerProducts } from "@/lib/api/seller-products";
import { createListing } from "@/lib/api/seller-listings";

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

  async function loadProducts() {
    const data = await getSellerProducts();
    setProducts(data);
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
      loadProducts();
    } catch (err: any) {
      setListingStatus((prev) => ({
        ...prev,
        [productId]: { loading: false, success: false, error: err?.message || "Unknown error" },
      }));
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 tracking-tight">Product Listings</h1>

      {/* Listing Form */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-3 col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <input
              placeholder="Price"
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
            <input
              placeholder="Compare At Price"
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              value={compareAtPrice}
              onChange={e => setCompareAtPrice(e.target.value)}
            />
            <input
              placeholder="Stock"
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              value={stock}
              onChange={e => setStock(e.target.value)}
            />
            <select
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              value={condition}
              onChange={e => setCondition(e.target.value)}
            >
              <option value="">Select Condition</option>
              <option value="NEW">NEW</option>
              <option value="REFURBISHED">REFURBISHED</option>
              <option value="USED">USED</option>
            </select>
            <input
              placeholder="Warranty Months"
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              value={warrantyMonths}
              onChange={e => setWarrantyMonths(e.target.value)}
            />
            <input
              placeholder="Return Window Days"
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              value={returnWindowDays}
              onChange={e => setReturnWindowDays(e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Fill the details above and select a product below to create a new listing.</p>
        </div>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map(p => {
          const status = listingStatus[p.id] || { loading: false, success: false, error: "" };
          const alreadyListed = !!p.listingId || !!p.hasListing;
          return (
            <div key={p.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-bold text-lg text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-500">SKU: {p.sku}</div>
                </div>
                {alreadyListed && (
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">Listed</span>
                )}
              </div>
              <button
                onClick={() => addListing(p.id)}
                className={`w-full py-2 rounded-lg font-semibold text-white text-sm transition-all duration-200
                  ${alreadyListed ? 'bg-gray-300 cursor-not-allowed' : status.loading ? 'bg-blue-400' : 'bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'}
                `}
                disabled={status.loading || alreadyListed || !validateFields()}
              >
                {alreadyListed
                  ? "Already Listed"
                  : status.loading
                    ? "Creating..."
                    : status.success
                      ? "Created"
                      : "Create Listing"}
              </button>
              {status.error && (
                <span className="text-red-600 text-xs mt-1">{status.error}</span>
              )}
              {status.success && !status.loading && !alreadyListed && (
                <span className="text-green-600 text-xs mt-1">Listing created!</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
