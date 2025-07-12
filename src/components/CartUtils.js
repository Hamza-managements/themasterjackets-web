""// utils/cartUtils.js

export function getCartItems() {
  return JSON.parse(localStorage.getItem('cartsItems')) || [];
}

export function updateCartCount(setCount) {
  const items = getCartItems();
  setCount(items.length);
}

