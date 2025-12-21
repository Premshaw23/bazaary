"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCart, addToCart as add, updateQuantity, removeFromCart, emptyCart } from "@/lib/cart/cart";
import { useAuth } from "@/lib/auth/context";

interface CartContextType {
  cart: any[];
  loading: boolean;
  addToCart: (item: any) => void;
  updateQuantity: (listingId: string, quantity: number) => void;
  removeFromCart: (listingId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    console.log("[CartContext] user:", user);
    if (user?.id) {
      const cartData = getCart(user.id);
      console.log("[CartContext] cart (on user.id change):", cartData);
      setCart(cartData);
    } else {
      setCart([]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    setLoading(true);
    // Clear cart on logout or role change
    if (user?.id && user.role === "BUYER") {
      const cartData = getCart(user.id);
      console.log("[CartContext] cart (on user.role/user change):", cartData);
      setCart(cartData);
    } else {
      if (user?.id) emptyCart(user.id);
      setCart([]);
    }
    setLoading(false);
  }, [user?.role, user]);

  const addToCart = (item: any) => {
    if (user?.role !== "BUYER" || !user?.id) return;
    add(item, user.id);
    setCart(getCart(user.id));
  };

  const handleUpdateQuantity = (listingId: string, quantity: number) => {
    if (!user?.id) return;
    updateQuantity(listingId, quantity, user.id);
    setCart(getCart(user.id));
  };

  const handleRemoveFromCart = (listingId: string) => {
    if (!user?.id) return;
    removeFromCart(listingId, user.id);
    setCart(getCart(user.id));
  };

  const clearCart = () => {
    if (!user?.id) return;
    emptyCart(user.id);
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity: handleUpdateQuantity, removeFromCart: handleRemoveFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
