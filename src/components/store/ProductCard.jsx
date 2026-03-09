import React, { useMemo, useState } from 'react';
import { ShoppingCart, Check, Package, Star } from 'lucide-react';
import { useCart } from './CartContext';
import { toast } from 'sonner';

export default function ProductCard({ product, flavors, settings }) {
  const { addItem } = useCart();
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [added, setAdded] = useState(false);

  const parsedFlavorIds = useMemo(() => {
    const raw = product.flavor_ids;

    if (!raw) return [];

    if (Array.isArray(raw)) {
      return raw.map(Number).filter(Boolean);
    }

    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map(Number).filter(Boolean);
        }
      } catch {
        return raw.split(',').map((n) => Number(n.trim())).filter(Boolean);
      }
    }

    return [];
  }, [product.flavor_ids]);

  const productFlavors = useMemo(() => {
    return flavors.filter(
      (f) => parsedFlavorIds.includes(Number(f.id)) && Number(f.is_active) === 1
    );
  }, [flavors, parsedFlavorIds]);

  const requiresFlavor = productFlavors.length > 0;
  const outOfStock = Number(product.stock) <= 0;
  const lowStock =
    Number(product.stock) > 0 &&
    Number(product.stock) <= Number(product.low_stock_threshold || 5);

  const handleAdd = () => {
    if (requiresFlavor && !selectedFlavor) {
      toast.error('Selecione um sabor!');
      return;
    }

    if (outOfStock) {
      toast.error('Produto sem estoque!');
      return;
    }

    addItem(product, selectedFlavor || 'Padrão');
    setAdded(true);
    toast.success('Adicionado ao carrinho!');
    setTimeout(() => setAdded(false), 1500);
  };

  const cleanDescription =
    product.description &&
    product.description !== '0' &&
    product.description !== 0
      ? product.description
      : '';

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col ${
        outOfStock ? 'opacity-70' : ''
      }`}
      style={{ backgroundColor: settings?.product_card_background_color || '#ffffff' }}
    >
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {!product.image_url && <div className="absolute inset-0 animate-pulse bg-gray-200" />}

        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {Number(product.is_featured) === 1 && Number(product.stock) > 0 && (
          <div
            className="absolute top-2 left-2 text-[11px] sm:text-xs font-bold px-2 py-1 rounded-full shadow flex items-center gap-1"
            style={{
              backgroundColor: settings?.badge_featured_background_color || '#f59e0b',
              color: settings?.badge_featured_text_color || '#ffffff',
            }}
          >
            <Star className="w-3 h-3 fill-current" />
            Mais vendido
          </div>
        )}

        {lowStock && (
          <div
            className="absolute top-2 right-2 text-[11px] sm:text-xs font-bold px-2 py-1 rounded-full shadow"
            style={{
              backgroundColor: settings?.badge_low_stock_background_color || '#f97316',
              color: settings?.badge_low_stock_text_color || '#ffffff',
            }}
          >
            Últimas unidades
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span
              className="text-sm font-bold px-4 py-2 rounded-full shadow"
              style={{
                backgroundColor: settings?.badge_sold_out_background_color || '#dc2626',
                color: settings?.badge_sold_out_text_color || '#ffffff',
              }}
            >
              ESGOTADO
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-bold text-sm"
          style={{ color: settings?.product_name_color || '#111827' }}
        >
          {product.name}
        </h3>

        {Number(settings?.show_fake_reviews) === 1 && (
          <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: settings?.product_description_color || '#6b7280' }}>
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
            <span>
              {settings?.fake_rating || 4.9} ({settings?.fake_reviews_count || 127} avaliações)
            </span>
          </div>
        )}

        {cleanDescription && (
          <p
            className="text-xs mt-1"
            style={{ color: settings?.product_description_color || '#6b7280' }}
          >
            {cleanDescription}
          </p>
        )}

        <div className="mt-2 mb-2">
          <span
            className="text-xl font-extrabold"
            style={{ color: settings?.product_price_color || '#059669' }}
          >
            R$ {parseFloat(product.price || 0).toFixed(2).replace('.', ',')}
          </span>
        </div>

        {requiresFlavor && (
          <div className="mb-3">
            <label
              className="text-xs mb-1 block"
              style={{ color: settings?.product_description_color || '#6b7280' }}
            >
              Escolha o sabor:
            </label>

            <select
              value={selectedFlavor}
              onChange={(e) => setSelectedFlavor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none"
            >
              <option value="">Selecione um sabor</option>
              {productFlavors.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={outOfStock || added || (requiresFlavor && !selectedFlavor)}
          className="mt-auto w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
          style={{
            backgroundColor: added
              ? '#d1fae5'
              : outOfStock || (requiresFlavor && !selectedFlavor)
              ? '#e5e7eb'
              : settings?.product_button_background_color || '#059669',
            color: added
              ? '#047857'
              : outOfStock || (requiresFlavor && !selectedFlavor)
              ? '#9ca3af'
              : settings?.product_button_text_color || '#ffffff',
          }}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              Adicionado
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Adicionar
            </>
          )}
        </button>
      </div>
    </div>
  );
}