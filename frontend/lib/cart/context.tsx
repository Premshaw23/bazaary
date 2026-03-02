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
    if (user?.id) {
      if (user.role === "BUYER") {
        const cartData = getCart(user.id);
        console.log(`🛒 [CartContext] Loading cart for ${user.id}:`, cartData.length, "items");
        setCart(cartData);
      } else {
        // If they became a Seller, they shouldn't have a buyer cart
        setCart([]);
      }
    } else {
      setCart([]);
    }
    setLoading(false);
  }, [user?.id, user?.role]);


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
    console.log(`🛒 [CartContext] Clearing cart for ${user.id}`);
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
