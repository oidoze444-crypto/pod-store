import React from 'react';
import { ShoppingCart, Search } from 'lucide-react';
import { useCart } from './CartContext';

export default function StoreHeader({ settings, onCartOpen, searchQuery, onSearchChange }) {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt={settings.store_name} className="w-9 h-9 rounded-xl object-cover" />
          ) : (
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: settings?.primary_color || '#059669' }}
            >
              {(settings?.store_name || 'P')[0]}
            </div>
          )}
          <h1 className="font-bold text-gray-900 text-lg hidden sm:block">{settings?.store_name || 'POD Store'}</h1>
        </div>
        
        <div className="flex items-center gap-2 flex-1 ml-3 sm:ml-4 sm:max-w-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        <button
          onClick={onCartOpen}
          className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors ml-2"
        >
          <ShoppingCart className="w-5 h-5 text-gray-700" />
          {totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}