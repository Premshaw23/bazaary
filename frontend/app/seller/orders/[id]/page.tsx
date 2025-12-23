"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import {
  getSellerOrderById,
  updateOrderState,
} from "@/lib/api/seller-orders";
import CustomLoader from "@/components/CustomLoader";

const NEXT_ACTION: Record<string, "CONFIRMED" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | null> = {
  PAID: "CONFIRMED",
  CONFIRMED: "PACKED",
  PACKED: "SHIPPED",
  SHIPPED: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
  DELIVERED: null,
};

const STATUS_ICONS = {
  PAID: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  CONFIRMED: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  PACKED: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  SHIPPED: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  ),
  OUT_FOR_DELIVERY: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  DELIVERED: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
};

export default function SellerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [animatingStep, setAnimatingStep] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const data = await getSellerOrderById(id);
      setOrder(data);
      console.log("[DEBUG] Current user:", user);
      // console.log("[DEBUG] Order.sellerId:", data.sellerId);
    } catch (err: any) {
      setError(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function advance() {
    const next = NEXT_ACTION[order.state];
    if (!next) return;

    setUpdating(true);
    const statusSteps = ["PAID", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
    const currentStep = statusSteps.indexOf(order.state);
    const nextStep = currentStep + 1;
    
    // Start animation
    setAnimatingStep(nextStep);

    try {
      await updateOrderState(order.id, next);
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update order state
      setOrder({ ...order, state: next });
      
    } catch (err) {
      let errorMsg = "Failed to update order state";
      if (err && typeof err === "object" && "message" in err) {
        errorMsg = (err as any).message || errorMsg;
      }
      setError(errorMsg);
    } finally {
      setUpdating(false);
      setTimeout(() => setAnimatingStep(null), 300);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <CustomLoader />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
        <div className="text-red-600 text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    </div>
  );

  if (!order) return null;

  const next = NEXT_ACTION[order.state];
  const statusSteps = ["PAID", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
  const currentStep = statusSteps.indexOf(order.state);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              order.state === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
              order.state === 'CANCELLED' ? 'bg-red-100 text-red-700' : 
              'bg-blue-100 text-blue-700'
            }`}>
              {order.state.replace(/_/g, ' ')}
            </span>
          </div>
          <div>
            <span className="text-gray-500 text-sm mr-2">Total:</span>
            <span className="text-xl font-bold text-gray-900">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Timeline Card (restored original rich UI) */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Progress</h2>
          <div ref={timelineRef} className="relative">
            {/* Progress Line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 -z-10">
              <div 
                className="h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-700 ease-out"
                style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Steps */}
            <div className="flex justify-between">
              {statusSteps.map((step, idx) => {
                const isCompleted = idx < currentStep;
                const isCurrent = idx === currentStep;
                const isAnimating = idx === animatingStep;
                const icon = STATUS_ICONS[step as keyof typeof STATUS_ICONS];

                return (
                  <div key={step} className="flex flex-col items-center relative" style={{ width: '16.666%' }}>
                    {/* Circle */}
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 relative
                      ${isCompleted ? 'bg-linear-to-br from-blue-500 to-blue-600 shadow-lg scale-100' : 
                        isCurrent ? 'bg-white border-4 border-blue-500 shadow-lg scale-110' : 
                        'bg-white border-2 border-gray-300'}
                      ${isAnimating ? 'animate-pulse scale-125' : ''}
                    `}>
                      {isAnimating && (
                        <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping" />
                      )}
                      <div className={`
                        ${isCompleted ? 'text-white' : isCurrent ? 'text-blue-600' : 'text-gray-400'}
                        transition-colors duration-500
                      `}>
                        {icon}
                      </div>
                    </div>

                    {/* Label */}
                    <div className="mt-3 text-center">
                      <p className={`
                        text-xs font-semibold transition-colors duration-500
                        ${isCompleted || isCurrent ? 'text-blue-700' : 'text-gray-400'}
                      `}>
                        {step.replace(/_/g, ' ')}
                      </p>
                    </div>

                    {/* Checkmark for completed */}
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 shadow-md">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Customer Details */}
        {order.shippingAddress && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Customer</h2>
            <div>
              <span className="block font-semibold text-gray-900">{order.shippingAddress.name || "N/A"}</span>
              {order.shippingAddress.phone && (
                <span className="block text-gray-700 text-sm">{order.shippingAddress.phone}</span>
              )}
              <span className="block text-gray-700 text-sm">
                {[order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.pincode, order.shippingAddress.country]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          </div>
        )}

        {/* No duplicate shipping address section, already included above */}

        {/* Action Button */}
        {next && (
          <div className="mt-6 bg-white rounded-xl shadow-md p-6">
            <button
              onClick={advance}
              disabled={updating}
              className={`
                w-full py-4 px-6 rounded-xl font-bold text-white text-lg
                transition-all duration-300 transform
                ${updating 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                }
              `}
            >
              {updating ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent" />
                  Updating Order Status...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Mark as {next.replace(/_/g, ' ')}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </div>
        )}

        {!next && order.state === 'DELIVERED' && (
          <div className="mt-6 bg-linear-to-r from-green-50 to-green-100 border border-green-200 rounded-xl shadow-md p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-green-800">Order Completed</h3>
            </div>
            <p className="text-green-700">This order has been successfully delivered to the customer.</p>
          </div>
        )}
      </div>
    </div>
  );
}