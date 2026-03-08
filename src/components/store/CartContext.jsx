import React, { createContext, useContext, useState, useEffect } from 'react';

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
    setItems(prev => {
      const key = `${product.id}-${flavor}`;
      const existing = prev.find(i => i.key === key);
      const stock = parseInt(product.stock) || 0;
      if (existing) {
        const newQty = existing.quantity + quantity;
        const limited = stock > 0 ? Math.min(newQty, stock) : newQty;
        return prev.map(i => i.key === key ? { ...i, quantity: limited } : i);
      }
      return [...prev, {
        key,
        product_id: product.id,
        product_name: product.name,
        image_url: product.image_url,
        flavor,
        quantity,
        unit_price: product.price,
        stock,
      }];
    });
  };

  const updateQuantity = (key, quantity) => {
    if (quantity <= 0) {
      removeItem(key);
      return;
    }
    setItems(prev => prev.map(i => {
      if (i.key !== key) return i;
      const maxQty = i.stock > 0 ? Math.min(quantity, i.stock) : quantity;
      return { ...i, quantity: maxQty };
    }));
  };

  const removeItem = (key) => {
    setItems(prev => prev.filter(i => i.key !== key));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}