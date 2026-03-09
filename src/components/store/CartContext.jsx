import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('pod_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pod_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, flavor, quantity = 1) => {
    setItems((prev) => {
      const key = `${product.id}-${flavor}`;
      const existing = prev.find((i) => i.key === key);
      const stock = parseInt(product.stock) || 0;
      const qtyToAdd = parseInt(quantity) || 1;

      if (stock <= 0) {
        return prev;
      }

      if (existing) {
        const newQty = existing.quantity + qtyToAdd;
        const limitedQty = Math.min(newQty, stock);

        return prev.map((i) =>
          i.key === key ? { ...i, quantity: limitedQty, stock } : i
        );
      }

      return [
        ...prev,
        {
          key,
          product_id: product.id,
          product_name: product.name,
          image_url: product.image_url || '',
          flavor,
          quantity: Math.min(qtyToAdd, stock),
          unit_price: Number(product.price || 0),
          stock,
        },
      ];
    });
  };

  const updateQuantity = (key, quantity) => {
    const newQuantity = parseInt(quantity) || 0;

    if (newQuantity <= 0) {
      removeItem(key);
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (i.key !== key) return i;

        const stock = parseInt(i.stock) || 0;
        const limitedQty = stock > 0 ? Math.min(newQuantity, stock) : newQuantity;

        return {
          ...i,
          quantity: limitedQty,
        };
      })
    );
  };

  const removeItem = (key) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.unit_price || 0) * Number(i.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}