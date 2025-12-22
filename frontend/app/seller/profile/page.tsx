"use client"
import { useEffect, useState } from "react";
import { getSellerProfile } from "@/lib/api/seller-profile";

export function SellerProfileView({ profile, onEdit }: { profile: any, onEdit: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-0 md:p-8 mb-8 overflow-hidden">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 p-8 bg-linear-to-r from-blue-50 to-blue-100">
        <div className="shrink-0">
          <div className="w-24 h-24 rounded-full bg-blue-200 flex items-center justify-center text-4xl font-bold text-blue-700 border-4 border-blue-300 shadow">
            {profile.businessName?.[0]?.toUpperCase() || "S"}
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-extrabold text-blue-900 mb-1">{profile.businessName}</h2>
          <div className="text-blue-700 font-semibold mb-2">{profile.businessType}</div>
          <div className="text-gray-600 mb-2">{profile.description}</div>
          <div className="flex flex-wrap gap-4 text-sm text-blue-900 mb-2">
            <div><span className="font-semibold">Phone:</span> {profile.contactPhone}</div>
            <div><span className="font-semibold">Email:</span> {profile.contactEmail}</div>
          </div>
        </div>
        <div className="hidden md:block">
          <button className="btn-premium bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg" onClick={onEdit}>Edit Profile</button>
        </div>
      </div>
      <div className="border-t border-blue-100" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
        <div>
          <h3 className="text-lg font-bold text-blue-800 mb-2">Address</h3>
          <div className="text-gray-700 mb-1">{profile.address?.street}</div>
          <div className="text-gray-700 mb-1">{profile.address?.city}, {profile.address?.state} {profile.address?.pincode}</div>
          <div className="text-gray-700 mb-1">{profile.address?.country}</div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-blue-800 mb-2">Bank Details</h3>
          <div className="text-gray-700 mb-1"><span className="font-semibold">Account:</span> {profile.bankAccountNumber || "-"}</div>
          <div className="text-gray-700 mb-1"><span className="font-semibold">IFSC:</span> {profile.bankIfsc || "-"}</div>
          <div className="text-gray-700 mb-1"><span className="font-semibold">Bank:</span> {profile.bankName || "-"}</div>
        </div>
      </div>
      <div className="md:hidden flex justify-center border-t border-blue-100 p-4">
        <button className="btn-premium bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg w-full" onClick={onEdit}>Edit Profile</button>
      </div>
    </div>
  );
}


export function SellerProfileEdit({ profile, onSave, onCancel }: { profile: any, onSave: (data: any) => void, onCancel: () => void }) {
  const [form, setForm] = useState({ ...profile });
  return (
    <form className="bg-white rounded-2xl shadow-lg p-0 md:p-8 mb-8" onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 p-8 bg-linear-to-r from-blue-50 to-blue-100 border-b border-blue-100">
        <div className="shrink-0">
          <div className="w-24 h-24 rounded-full bg-blue-200 flex items-center justify-center text-4xl font-bold text-blue-700 border-4 border-blue-300 shadow">
            {form.businessName?.[0]?.toUpperCase() || "S"}
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-extrabold text-blue-900 mb-1">Edit Profile</h2>
          <div className="text-blue-700 font-semibold mb-2">{form.businessType}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
        <div>
          <label className="block mb-2 font-semibold text-blue-900">Business Name
            <input className="input-premium w-full mt-1" value={form.businessName ?? ""} onChange={e => setForm((f: typeof form) => ({ ...f, businessName: e.target.value }))} required />
          </label>
          <label className="block mb-2 font-semibold text-blue-900">Business Type
            <input className="input-premium w-full mt-1" value={form.businessType ?? ""} onChange={e => setForm((f: typeof form) => ({ ...f, businessType: e.target.value }))} required />
          </label>
          <label className="block mb-2 font-semibold text-blue-900">Description
            <input className="input-premium w-full mt-1" value={form.description ?? ""} onChange={e => setForm((f: typeof form) => ({ ...f, description: e.target.value }))} />
          </label>
          <label className="block mb-2 font-semibold text-blue-900">Contact Phone
            <input className="input-premium w-full mt-1" value={form.contactPhone ?? ""} onChange={e => setForm((f: typeof form) => ({ ...f, contactPhone: e.target.value }))} required />
          </label>
          <label className="block mb-2 font-semibold text-blue-900">Contact Email
            <input className="input-premium w-full mt-1" value={form.contactEmail ?? ""} onChange={e => setForm((f: typeof form) => ({ ...f, contactEmail: e.target.value }))} />
          </label>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-blue-900">Street
            <input className="input-premium w-full mt-1" value={form.address?.street ?? ""} onChange={e => setForm((f: typeof form) => ({ ...f, address: { ...f.address, street: e.target.value } }))} />
          </label>
          <label className="block mb-2 font-semibold text-blue-900">City
            <input className="input-premium w-full mt-1" value={form.address?.city ?? ""} onChange={e => setForm((f: typeof form) => ({ ...f, address: { ...f.address, city: e.target.value } }))} />
          </label>
          <label className="block mb-2 font-semibold text-blue-900">State
            <input className="input-premium w-full mt-1" value={form.address?.state ?? ""} onChange={e => setForm((f: typeof form) => ({ ...f, address: { ...f.address, state: e.target.value } }))} />
          </label>
          <label className="block mb-2 font-semibold text-blue-900">Pincode
            <input className="input-premium w-full mt-1" value={form.address?.pincode ?? ""} onChange={e => setForm((f: typeof form) => ({ ...f, address: { ...f.address, pincode: e.target.value } }))} />
          </label>
          <label className="block mb-2 font-semibold text-blue-900">Country
            <input className="input-premium w-full mt-1" value={form.address?.country ?? ""} onChange={e => setForm((f: typeof form) => ({ ...f, address: { ...f.address, country: e.target.value } }))} />
          </label>
          <label className="block mb-2 font-semibold text-blue-900">Bank Account
            <input className="input-premium w-full mt-1" value={form.bankAccountNumber ?? ""} onChange={e => setForm((f: typeof form) => ({ ...f, bankAccountNumber: e.target.value }))} />
          </label>
          <label className="block mb-2 font-semibold text-blue-900">Bank IFSC
            <input className="input-premium w-full mt-1" value={form.bankIfsc ?? ""} onChange={e => setForm((f: typeof form) => ({ ...f, bankIfsc: e.target.value }))} />
          </label>
          <label className="block mb-2 font-semibold text-blue-900">Bank Name
            <input className="input-premium w-full mt-1" value={form.bankName ?? ""} onChange={e => setForm((f: typeof form) => ({ ...f, bankName: e.target.value }))} />
          </label>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-end border-t border-blue-100 p-6 bg-blue-50">
        <button type="submit" className="btn-premium bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-bold">Save</button>
        <button type="button" className="btn-premium bg-gray-200 text-gray-700 px-8 py-2 rounded-lg font-bold" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function SellerProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSellerProfile();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleProfileSave(data: any) {
    // TODO: Call update seller profile API here
    setProfile(data);
    setEditing(false);
  }

  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!profile) return <div className="p-8 text-center">No profile found.</div>;

  return editing ? (
    <SellerProfileEdit profile={profile} onSave={handleProfileSave} onCancel={() => setEditing(false)} />
  ) : (
    <SellerProfileView profile={profile} onEdit={() => setEditing(true)} />
  );
}
