"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { applyAsSeller } from "@/lib/api/seller-profile";

export default function SellerApplyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: "",
    businessType: "INDIVIDUAL",
    description: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
    contactPhone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: any) {
    const { name, value } = e.target;
    if (name in form.address) {
      setForm({ ...form, address: { ...form.address, [name]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await applyAsSeller(form);
      router.replace("/seller");
    } catch (err: any) {
      setError(err.message || "Failed to apply as seller");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Seller Onboarding</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="businessName"
          placeholder="Business Name"
          value={form.businessName}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <select
          name="businessType"
          value={form.businessType}
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="INDIVIDUAL">Individual</option>
          <option value="COMPANY">Company</option>
        </select>
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          name="contactPhone"
          placeholder="Contact Phone"
          value={form.contactPhone}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          name="street"
          placeholder="Street"
          value={form.address.street}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          name="city"
          placeholder="City"
          value={form.address.city}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          name="state"
          placeholder="State"
          value={form.address.state}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          name="pincode"
          placeholder="Pincode"
          value={form.address.pincode}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          name="country"
          placeholder="Country"
          value={form.address.country}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
