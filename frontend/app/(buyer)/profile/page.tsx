"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useEffect, useState } from "react";
import { getBuyerOrders, BuyerOrder } from "@/lib/api/orders";
import { User, Mail, MapPin, Phone, Package, ShieldCheck, Edit2, X, Save, ChevronRight, Calendar, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

// Fetch full user profile from /users/me
async function fetchUserProfile() {
  const res = await fetch("/api/users/me", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}

// Update user profile via PATCH /users/me
async function updateUserProfile(data: any) {
  const res = await fetch("/api/users/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

export default function ProfilePage() {
  const { user: authUser, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  useEffect(() => {
    if (!authUser) return;
    getBuyerOrders().then((data) => {
      setOrders(data || []);
      setLoading(false);
    });
    fetchUserProfile()
      .then((data) => {
        setProfile(data);
        setEditForm({
          phone: data.phone || "",
          address: {
            street: data.address?.street || "",
            city: data.address?.city || "",
            state: data.address?.state || "",
            pincode: data.address?.pincode || "",
            country: data.address?.country || "",
          },
        });
      })
      .catch((err) => setProfileError(err.message || "Failed to load profile"))
      .finally(() => setProfileLoading(false));
  }, [authUser]);

  useEffect(() => {
    if (editSuccess) {
      const timer = setTimeout(() => setEditSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [editSuccess]);

  if (!authUser) return null;

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  function handleEdit() {
    setEditMode(true);
    setEditError("");
    setEditSuccess("");
  }

  function handleEditCancel() {
    setEditMode(false);
    setEditError("");
    setEditSuccess("");
    setEditForm({
      phone: profile?.phone || "",
      address: {
        street: profile?.address?.street || "",
        city: profile?.address?.city || "",
        state: profile?.address?.state || "",
        pincode: profile?.address?.pincode || "",
        country: profile?.address?.country || "",
      },
    });
  }

  async function handleEditSave() {
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");
    try {
      const updated = await updateUserProfile(editForm);
      setProfile(updated);
      setEditSuccess("Profile updated successfully!");
      setEditMode(false);
    } catch (err: any) {
      setEditError(err.message || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  }

  const email = profile?.email || authUser.email;
  const phone = profile?.phone || "Not set";
  const status = profile?.status || "Unknown";
  const joined = profile?.joined ? new Date(profile.joined).toLocaleDateString() : "-";
  const emailVerified = profile?.emailVerified;
  const phoneVerified = profile?.phoneVerified;
  const addressObj = profile?.address || {};
  const address = addressObj.street
    ? `${addressObj.street}, ${addressObj.city || ""}, ${addressObj.state || ""} ${addressObj.pincode || ""}, ${addressObj.country || ""}`.replace(/, +/g, ', ').replace(/, $/, '')
    : "Not set";

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Success Message Toast */}
        {editSuccess && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
            <CheckCircle size={20} />
            <span className="font-medium">{editSuccess}</span>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-linear-to-r from-blue-500 to-purple-600 h-30 md:mb-3"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-6">
              <div className="w-32 h-32 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white">
                <User size={48} />
              </div>
              <div className="flex-1 text-center sm:text-left sm:mt-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{email}</h1>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start text-gray-600">
                  <span className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-sm">
                    <ShieldCheck size={16} className="text-blue-600" />
                    <span className="font-semibold">{profile?.role || authUser.role}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full text-sm">
                    <Calendar size={16} className="text-purple-600" />
                    Joined {joined}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 sm:mt-12">
                <button
                  onClick={handleEdit}
                  disabled={editMode || profileLoading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Edit2 size={18} />
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail size={20} className="text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-1">Email Address</div>
                      <div className="font-semibold text-gray-900 break-all">{email}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {emailVerified ? (
                          <><CheckCircle size={14} className="text-green-600" /><span className="text-xs text-green-600">Verified</span></>
                        ) : (
                          <><XCircle size={14} className="text-gray-400" /><span className="text-xs text-gray-500">Not verified</span></>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Phone size={20} className="text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-1">Phone Number</div>
                      <div className="font-semibold text-gray-900">{phone}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {phoneVerified ? (
                          <><CheckCircle size={14} className="text-green-600" /><span className="text-xs text-green-600">Verified</span></>
                        ) : (
                          <><XCircle size={14} className="text-gray-400" /><span className="text-xs text-gray-500">Not verified</span></>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Address</h3>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <MapPin size={20} className="text-blue-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-1">Delivery Address</div>
                    <div className="font-semibold text-gray-900">{address}</div>
                  </div>
                </div>
              </div>
            </div>

            {profileError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {profileError}
              </div>
            )}
          </div>
        </div>

        {/* Order History Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Package size={20} className="text-white" />
              </div>
              Order History
            </h2>
          </div>
          <div className="px-8 py-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="mt-4 text-gray-500">Loading orders...</div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <div className="text-gray-500 text-lg">No orders yet</div>
                <div className="text-gray-400 text-sm mt-2">Your order history will appear here</div>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 10).map((order) => (
                  <div key={order.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Order Number</div>
                        <div className="font-bold text-gray-900">{order.orderNumber}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Status</div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          order.state === "PAID"
                            ? "bg-green-100 text-green-700"
                            : order.state === "PAYMENT_PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-200 text-gray-600"
                        }`}>
                          {order.state.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                        <div className="font-bold text-gray-900">₹{order.totalAmount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Order Date</div>
                        <div className="text-sm text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <Link 
                      href={`/orders/${order.id}`} 
                      className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition-colors group-hover:bg-blue-600 group-hover:text-white"
                    >
                      View
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Modal */}
        {editMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
              <div className="sticky top-0 bg-linear-to-r from-blue-500 to-purple-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Edit2 size={20} />
                  Edit Profile
                </h3>
                <button
                  onClick={handleEditCancel}
                  className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                  title="Close"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={editForm?.phone || ""}
                      onChange={e => setEditForm((f: any) => ({ ...f, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin size={18} />
                    Address Details
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        value={editForm?.address?.street || ""}
                        onChange={e => setEditForm((f: any) => ({ ...f, address: { ...f.address, street: e.target.value } }))}
                        placeholder="Street address"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          value={editForm?.address?.city || ""}
                          onChange={e => setEditForm((f: any) => ({ ...f, address: { ...f.address, city: e.target.value } }))}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          value={editForm?.address?.state || ""}
                          onChange={e => setEditForm((f: any) => ({ ...f, address: { ...f.address, state: e.target.value } }))}
                          placeholder="State"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                        <input
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          value={editForm?.address?.pincode || ""}
                          onChange={e => setEditForm((f: any) => ({ ...f, address: { ...f.address, pincode: e.target.value } }))}
                          placeholder="Pincode"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <input
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          value={editForm?.address?.country || ""}
                          onChange={e => setEditForm((f: any) => ({ ...f, address: { ...f.address, country: e.target.value } }))}
                          placeholder="Country"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {editError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {editError}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    disabled={editLoading}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    disabled={editLoading}
                    className="flex-1 px-4 py-2.5 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {editLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}