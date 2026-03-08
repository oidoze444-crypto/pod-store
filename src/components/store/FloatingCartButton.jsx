import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from './CartContext';

export default function FloatingCartButton({ onClick }) {
  const { totalItems } = useCart();

  if (totalItems === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-30 bg-emerald-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-emerald-700 active:scale-95 transition-all"
    >
      <ShoppingCart className="w-6 h-6" />
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
        {totalItems}
      </span>
    </button>
  );
}