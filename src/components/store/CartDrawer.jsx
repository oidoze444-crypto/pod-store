import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CartDrawer({ open, onClose, settings }) {
  const { items, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const navigate = useNavigate();
  const deliveryFee = parseFloat(settings?.delivery_fee || 0);
  const total = parseFloat(subtotal || 0) + deliveryFee;

  const handleCheckout = () => {
    onClose();
    navigate(createPageUrl('Checkout'));
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">Carrinho ({totalItems})</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">Carrinho vazio</p>
              <p className="text-sm">Adicione produtos para continuar</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.key} className="bg-gray-50 rounded-xl p-3 flex gap-3">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.product_name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 truncate">{item.product_name}</h4>
                  <p className="text-xs text-gray-500">Sabor: {item.flavor}</p>
                  <p className="text-sm font-bold text-emerald-600 mt-1">
                    R$ {(item.unit_price * item.quantity).toFixed(2).replace('.', ',')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.key)}
                      className="ml-auto p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-5 space-y-3 bg-white">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>R$ {parseFloat(subtotal || 0).toFixed(2).replace('.', ',')}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Taxa de entrega</span>
                <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all text-base"
            >
              Finalizar Pedido
            </button>
          </div>
        )}
      </div>
    </>
  );
}