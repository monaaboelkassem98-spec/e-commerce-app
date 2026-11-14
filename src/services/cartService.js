const CART_STORAGE_KEY = 'shopstream-cart';

export const getCartItems = () => {
  const storedItems = localStorage.getItem(CART_STORAGE_KEY);
  return storedItems ? JSON.parse(storedItems) : [];
};

export const saveCartItems = (items) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('shopstream:cart-updated'));
};

export const addCartItem = (product, quantity = 1) => {
  const cartItems = getCartItems();
  const existingItem = cartItems.find((item) => item.id === product.id);

  if (existingItem) {
    saveCartItems(
      cartItems.map((item) => (
        item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
      )),
    );
    return;
  }

  saveCartItems([...cartItems, { ...product, quantity }]);
};
