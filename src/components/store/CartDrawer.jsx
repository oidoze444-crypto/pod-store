import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CartDrawer({ open, onClose, settings }) {
  const { items, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  const rawDeliveryFee = parseFloat(settings?.delivery_fee || 0);
  const freeShippingEnabled = Number(settings?.free_shipping_enabled) === 1;
  const freeShippingThreshold = parseFloat(settings?.free_shipping_threshold || 0);

  const qualifiesFreeShipping =
    freeShippingEnabled && freeShippingThreshold > 0 && Number(subtotal) >= freeShippingThreshold;

  const deliveryFee = qualifiesFreeShipping ? 0 : rawDeliveryFee;
  const total = parseFloat(subtotal || 0) + deliveryFee;

  const remaining = Math.max(freeShippingThreshold - Number(subtotal || 0), 0);
  const progress =
    freeShippingEnabled && freeShippingThreshold > 0
      ? Math.min((Number(subtotal || 0) / freeShippingThreshold) * 100, 100)
      : 0;

  const handleCheckout = () => {
    onClose();
    navigate(createPageUrl('Checkout'));
  };

  const freeShippingMessage = qualifiesFreeShipping
    ? (settings?.free_shipping_success_text || 'Parabéns! Você ganhou frete grátis')
    : (settings?.free_shipping_remaining_text || 'Faltam R$ {valor} para frete grátis').replace(
        '{valor}',
        remaining.toFixed(2).replace('.', ',')
      );

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ backgroundColor: settings?.cart_drawer_background_color || '#ffffff' }}
      >
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" style={{ color: settings?.primary_color || '#059669' }} />
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
            <>
              {freeShippingEnabled && (
                <div
                  className="rounded-2xl p-4"
                  style={{
                    backgroundColor: settings?.free_shipping_box_background_color || '#ecfdf5',
                    color: settings?.free_shipping_text_color || '#065f46',
                  }}
                >
                  <p className="text-sm font-semibold mb-2">
                    {qualifiesFreeShipping
                      ? settings?.free_shipping_success_text || 'Parabéns! Você ganhou frete grátis'
                      : settings?.free_shipping_text || '🚚 Frete grátis para pedidos acima de R$ {valor}'.replace(
                          '{valor}',
                          freeShippingThreshold.toFixed(2).replace('.', ',')
                        )}
                  </p>

                  <p className="text-xs mb-2">{freeShippingMessage}</p>

                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{
                      backgroundColor:
                        settings?.free_shipping_bar_background_color || '#e5e7eb',
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        backgroundColor:
                          settings?.free_shipping_bar_fill_color || '#10b981',
                      }}
                    />
                  </div>
                </div>
              )}

              {items.map((item) => (
                <div
                  key={item.key}
                  className="rounded-xl p-3 flex gap-3"
                  style={{
                    backgroundColor: settings?.cart_item_background_color || '#f9fafb',
                  }}
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">{item.product_name}</h4>
                    <p className="text-xs text-gray-500">Sabor: {item.flavor}</p>
                    <p
                      className="text-sm font-bold mt-1"
                      style={{ color: settings?.product_price_color || '#059669' }}
                    >
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
              ))}
            </>
          )}
        </div>

        {items.length > 0 && (
          <div
            className="border-t p-5 space-y-3"
            style={{ backgroundColor: settings?.cart_total_background_color || '#ffffff' }}
          >
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>R$ {parseFloat(subtotal || 0).toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Taxa de entrega</span>
              <span>
                {deliveryFee === 0 && rawDeliveryFee > 0 ? 'Grátis' : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`}
              </span>
            </div>

            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-4 rounded-xl font-bold active:scale-[0.98] transition-all text-base"
              style={{
                backgroundColor: settings?.button_color || settings?.product_button_background_color || '#059669',
                color: settings?.product_button_text_color || '#ffffff',
              }}
            >
              Finalizar Pedido
            </button>
          </div>
        )}
      </div>
    </>
  );
}