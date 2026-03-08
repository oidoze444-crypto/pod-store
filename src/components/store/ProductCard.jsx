import React, { useMemo, useState } from 'react';
import { ShoppingCart, Check, Package, Star } from 'lucide-react';
import { useCart } from './CartContext';
import { toast } from 'sonner';

export default function ProductCard({ product, flavors }) {
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
      } catch (e) {
        return raw
          .split(',')
          .map(id => Number(String(id).trim()))
          .filter(Boolean);
      }
    }

    return [];
  }, [product.flavor_ids]);

  const productFlavors = useMemo(() => {
    return flavors.filter(
      f => parsedFlavorIds.includes(Number(f.id)) && Number(f.is_active) === 1
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

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col ${
        outOfStock ? 'opacity-70' : ''
      }`}
    >
      <div className="relative aspect-square bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {product.is_featured && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-current" />
            <span className="hidden sm:inline">Destaque</span>
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Esgotado
            </span>
          </div>
        )}

        {lowStock && !outOfStock && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            Últimas!
          </div>
        )}
      </div>

      <div className="p-2.5 sm:p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-xs sm:text-sm leading-tight line-clamp-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-gray-500 text-xs mt-0.5 line-clamp-1 hidden sm:block">
            {product.description}
          </p>
        )}

        <div className="mt-2 mb-2">
          <span className="text-base sm:text-xl font-extrabold text-emerald-600">
            R$ {parseFloat(product.price || 0).toFixed(2).replace('.', ',')}
          </span>
        </div>

        {requiresFlavor && (
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 font-medium block">
              Escolha o sabor:
            </label>

            <select
              value={selectedFlavor}
              onChange={(e) => setSelectedFlavor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
          className={`mt-auto w-full py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
            added
              ? 'bg-emerald-100 text-emerald-700'
              : outOfStock
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : requiresFlavor && !selectedFlavor
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
          }`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5" /> Adicionado!
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" /> Adicionar
            </>
          )}
        </button>
      </div>
    </div>
  );
}