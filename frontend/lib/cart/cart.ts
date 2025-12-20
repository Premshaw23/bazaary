import { loadCart, saveCart, clearCart } from "./storage";

export type CartItem = {
  listingId: string;
  productName: string;
  sellerName: string;
  price: number;
  quantity: number;
};

export function getCart(): CartItem[] {
  return loadCart();
}

export function addToCart(item: CartItem) {
  const cart = loadCart();
  const existing = cart.find(
    (i: CartItem) => i.listingId === item.listingId
  );

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  saveCart(cart);
}

export function updateQuantity(
  listingId: string,
  quantity: number
) {
  const cart = loadCart();

  const updated = cart
    .map((item: CartItem) =>
      item.listingId === listingId
        ? { ...item, quantity }
        : item
    )
    .filter((item: CartItem) => item.quantity > 0);

  saveCart(updated);
}

export function removeFromCart(listingId: string) {
  const cart = loadCart().filter(
    (item: CartItem) => item.listingId !== listingId
  );
  saveCart(cart);
}

export function emptyCart() {
  clearCart();
}
