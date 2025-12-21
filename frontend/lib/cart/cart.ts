
import { loadCart, saveCart, clearCart } from "./storage";
// import { decodeToken } from "@/lib/auth/decode";

export type CartItem = {
  listingId: string;
  productName: string;
  sellerName: string;
  price: number;
  quantity: number;
};



export function getCart(userId: string): CartItem[] {
  return loadCart(userId);
}


export function addToCart(item: CartItem, userId: string) {
  const cart = loadCart(userId);
  const existing = cart.find(
    (i: CartItem) => i.listingId === item.listingId
  );
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart, userId);
}


export function updateQuantity(listingId: string, quantity: number, userId: string) {
  const cart = loadCart(userId);
  const updated = cart
    .map((item: CartItem) =>
      item.listingId === listingId
        ? { ...item, quantity }
        : item
    )
    .filter((item: CartItem) => item.quantity > 0);
  saveCart(updated, userId);
}


export function removeFromCart(listingId: string, userId: string) {
  const cart = loadCart(userId).filter(
    (item: CartItem) => item.listingId !== listingId
  );
  saveCart(cart, userId);
}


export function emptyCart(userId: string) {
  clearCart(userId);
}


// All cart functions now require userId to be passed explicitly from context.
