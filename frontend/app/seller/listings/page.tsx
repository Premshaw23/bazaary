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
      <h1 className="text-2xl font-bold mb-4">
        Listings
      </h1>

      <input
        placeholder="Price"
        className="border p-2 mr-2"
        value={price}
        onChange={e => setPrice(e.target.value)}
      />
      <input
        placeholder="Compare At Price"
        className="border p-2"
        value={compareAtPrice}
        onChange={e => setCompareAtPrice(e.target.value)}
      />
      <input
        placeholder="Stock"
        className="border p-2"
        value={stock}
        onChange={e => setStock(e.target.value)}
      />

      <select
        className="border p-2"
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
        className="border p-2"
        value={warrantyMonths}
        onChange={e => setWarrantyMonths(e.target.value)}
      />
      <input
        placeholder="Return Window Days"
        className="border p-2"
        value={returnWindowDays}
        onChange={e => setReturnWindowDays(e.target.value)}
      />
      <ul className="mt-6 space-y-4">
        {products.map(p => {
          const status = listingStatus[p.id] || { loading: false, success: false, error: "" };
          // If product already has a listing, disable the button and show a message
          const alreadyListed = !!p.listingId || !!p.hasListing;
          return (
            <li key={p.id} className="border p-4">
              <div className="flex justify-between items-center">
                <span>{p.name}</span>
                <div className="flex flex-col items-end">
                  <button
                    onClick={() => addListing(p.id)}
                    className={`bg-green-600 text-white px-4 disabled:opacity-60 disabled:cursor-not-allowed`}
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
                  {alreadyListed && (
                    <span className="text-blue-600 text-xs mt-1">You already have a listing for this product</span>
                  )}
                  {status.error && (
                    <span className="text-red-600 text-xs mt-1">{status.error}</span>
                  )}
                  {status.success && !status.loading && !alreadyListed && (
                    <span className="text-green-600 text-xs mt-1">Listing created!</span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
