import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi, settingsApi } from '../components/mysqlApi';
import { CartProvider, useCart } from '../components/store/CartContext';
import {
  ArrowLeft,
  MapPin,
  User,
  Loader2,
  Send,
  Minus,
  Plus,
  Trash2,
  ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

function CheckoutContent() {
  const { items, subtotal, clearCart, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const { data: settings = {} } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then(d => d || {}),
  });

  const deliveryFee = Number(settings.delivery_fee || 0);
  const total = subtotal + deliveryFee;

  const [form, setForm] = useState({
    name: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    reference: '',
  });

  const [loadingCep, setLoadingCep] = useState(false);
  const [sending, setSending] = useState(false);

  const handleCepChange = async (cep) => {
    const cleanCep = cep.replace(/\D/g, '');
    let formatted = cleanCep;

    if (cleanCep.length > 5) {
      formatted = cleanCep.slice(0, 5) + '-' + cleanCep.slice(5, 8);
    }

    setForm(prev => ({ ...prev, cep: formatted }));

    if (cleanCep.length === 8) {
      setLoadingCep(true);

      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();

        if (!data.erro) {
          setForm(prev => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
          }));
        } else {
          toast.error('CEP não encontrado');
        }
      } catch (e) {
        toast.error('Erro ao buscar CEP');
      }

      setLoadingCep(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Preencha seu nome!');
      return;
    }

    if (!form.cep || form.cep.replace(/\D/g, '').length !== 8) {
      toast.error('Preencha o CEP!');
      return;
    }

    if (!form.number.trim()) {
      toast.error('Preencha o número!');
      return;
    }

    if (items.length === 0) {
      toast.error('Carrinho vazio!');
      return;
    }

    if (settings.min_order_value && subtotal < Number(settings.min_order_value)) {
      toast.error(
        `Pedido mínimo de R$ ${Number(settings.min_order_value).toFixed(2).replace('.', ',')}`
      );
      return;
    }

    const whatsappNumber = (settings.whatsapp_number || '').replace(/\D/g, '');

    if (!whatsappNumber) {
      toast.error('WhatsApp da loja não configurado!');
      return;
    }

    setSending(true);

    const addressText =
      `${form.street}, ${form.number}` +
      `${form.complement ? ', ' + form.complement : ''}` +
      ` - ${form.neighborhood}, ${form.city}/${form.state}` +
      ` - CEP: ${form.cep}` +
      `${form.reference ? ' | Referência: ' + form.reference : ''}`;

    const orderItems = items.map(i => ({
      product_name: i.product_name,
      flavor: i.flavor,
      quantity: i.quantity,
      unit_price: i.unit_price,
      subtotal: i.unit_price * i.quantity,
    }));

    const orderData = {
  customer_name: form.name,
  customer_phone: '',
  address: addressText,
  items: orderItems,
  subtotal,
  delivery_fee: deliveryFee,
  total,
  status: 'pending',
};

    try {
      await ordersApi.create(orderData);
    } catch (e) {
      console.error('Erro ao salvar pedido:', e);
    }

    const itemsList = items.map(i =>
      `• ${i.product_name} | ${i.flavor} | Qtd: ${i.quantity} | R$ ${(i.unit_price * i.quantity).toFixed(2).replace('.', ',')}`
    ).join('\n');

    const message =
      `🛒 *Novo Pedido*\n\n` +
      `👤 *Cliente:* ${form.name}\n\n` +
      `📍 *Endereço:*\n${addressText}\n\n` +
      `📦 *Itens:*\n${itemsList}` +
      `${deliveryFee > 0 ? `\n\n🚚 Taxa de entrega: R$ ${deliveryFee.toFixed(2).replace('.', ',')}` : ''}` +
      `\n\n💰 *Total: R$ ${total.toFixed(2).replace('.', ',')}*`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    clearCart();
    window.open(whatsappUrl, '_blank');
    setSending(false);
    toast.success('Pedido enviado!');
    navigate(createPageUrl('Store'));
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Carrinho vazio</h2>
          <p className="text-gray-500 mb-6">Adicione produtos para continuar</p>
          <button
            onClick={() => navigate(createPageUrl('Store'))}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            Ver Produtos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(createPageUrl('Store'))}
            className="p-2 hover:bg-gray-100 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Finalizar Pedido</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-40 space-y-4">
        <section className="bg-white rounded-2xl p-4 sm:p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" /> Seus Itens
          </h2>

          <div className="space-y-3">
            {items.map(item => (
              <div key={item.key} className="flex items-center gap-3 pb-3 border-b last:border-0">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-gray-300" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.product_name}</p>
                  <p className="text-xs text-gray-500">{item.flavor}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.key, item.quantity - 1)}
                    className="w-6 h-6 rounded-full border flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>

                  <button
                    onClick={() => updateQuantity(item.key, item.quantity + 1)}
                    className="w-6 h-6 rounded-full border flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-sm font-bold text-emerald-600 w-20 text-right">
                  R$ {(item.unit_price * item.quantity).toFixed(2).replace('.', ',')}
                </p>

                <button
                  onClick={() => removeItem(item.key)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-4 sm:p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" /> Seus Dados
          </h2>

          <input
            type="text"
            placeholder="Nome completo *"
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-3"
          />
        </section>

        <section className="bg-white rounded-2xl p-4 sm:p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" /> Endereço de Entrega
          </h2>

          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="CEP *"
                value={form.cep}
                onChange={e => handleCepChange(e.target.value)}
                maxLength={9}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {loadingCep && (
                <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-emerald-600" />
              )}
            </div>

            <input
              type="text"
              placeholder="Rua"
              value={form.street}
              readOnly
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm text-gray-600"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Número *"
                value={form.number}
                onChange={e => setForm(prev => ({ ...prev, number: e.target.value }))}
                className="px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Complemento"
                value={form.complement}
                onChange={e => setForm(prev => ({ ...prev, complement: e.target.value }))}
                className="px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <input
              type="text"
              placeholder="Bairro"
              value={form.neighborhood}
              readOnly
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm text-gray-600"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Cidade"
                value={form.city}
                readOnly
                className="px-4 py-3 bg-gray-100 rounded-xl text-sm text-gray-600"
              />
              <input
                type="text"
                placeholder="Estado"
                value={form.state}
                readOnly
                className="px-4 py-3 bg-gray-100 rounded-xl text-sm text-gray-600"
              />
            </div>

            <input
              type="text"
              placeholder="Referência (opcional)"
              value={form.reference}
              onChange={e => setForm(prev => ({ ...prev, reference: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 sm:p-4 z-10 safe-area-bottom">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
          </div>

          {deliveryFee > 0 && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Entrega</span>
              <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
            </div>
          )}

          <div className="flex justify-between font-bold text-lg mb-3">
            <span>Total</span>
            <span className="text-emerald-600">R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={sending}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            Enviar Pedido via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <CartProvider>
      <CheckoutContent />
    </CartProvider>
  );
}