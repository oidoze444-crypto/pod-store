import React from 'react';
import { ShoppingCart, Search } from 'lucide-react';
import { useCart } from './CartContext';

export default function StoreHeader({ settings, onCartOpen, searchQuery, onSearchChange }) {
  const { totalItems } = useCart();

  return (
    <header
      className="sticky top-0 z-20 backdrop-blur-lg border-b"
      style={{
        backgroundColor: settings?.header_background_color || '#ffffffcc',
        borderColor: settings?.header_border_color || '#e5e7eb',
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.store_name}
              className="w-9 h-9 rounded-xl object-cover"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: settings?.primary_color || '#620594' }}
            >
              {(settings?.store_name || 'P')[0]}
            </div>
          )}

          <h1
            className="font-bold text-lg hidden sm:block"
            style={{ color: settings?.header_text_color || '#111827' }}
          >
            {settings?.store_name || 'POD Store'}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-1 ml-3 sm:ml-4 sm:max-w-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: settings?.search_background_color || '#f3f4f6',
                color: settings?.search_text_color || '#111827',
              }}
            />
          </div>
        </div>

        <button
          onClick={onCartOpen}
          className="relative p-2.5 rounded-xl transition-colors ml-2"
          style={{
            backgroundColor: settings?.cart_button_background_color || '#ffffff',
          }}
        >
          <ShoppingCart
            className="w-5 h-5"
            style={{ color: settings?.cart_button_icon_color || '#374151' }}
          />
          {totalItems > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: settings?.cart_badge_background_color || '#ef4444',
                color: settings?.cart_badge_text_color || '#ffffff',
              }}
            >
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}