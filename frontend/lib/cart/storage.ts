function getCartKey(userId?: string) {
  return userId ? `bazaary_cart_v1_${userId}` : "bazaary_cart_v1";
}

export function loadCart(userId?: string) {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getCartKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: any[], userId?: string) {
  localStorage.setItem(getCartKey(userId), JSON.stringify(cart));
}

export function clearCart(userId?: string) {
  localStorage.removeItem(getCartKey(userId));
}
