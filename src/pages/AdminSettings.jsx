import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../components/mysqlApi';
import AdminLayout from '../components/admin/AdminLayout';
import { Save, Upload, Loader2, Palette, Phone, Truck, Clock, Star } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = 'https://pod-store-md9c.onrender.com';

const buildInitialForm = (settingsData = {}) => ({
  id: settingsData.id,
  store_name: settingsData.store_name || 'POD Store',
  whatsapp_number: settingsData.whatsapp_number || '',
  header_text: settingsData.header_text || 'Os melhores PODs com entrega rápida!',
  logo_url: settingsData.logo_url || '',

  opening_time: settingsData.opening_time || '08:00',
  closing_time: settingsData.closing_time || '22:00',
  is_open_override: Number(settingsData.is_open_override ?? 1),
  closed_message: settingsData.closed_message || 'Estamos fechados no momento. Volte em breve!',

  free_shipping_enabled: Number(settingsData.free_shipping_enabled ?? 0),
  free_shipping_threshold: Number(settingsData.free_shipping_threshold ?? 400),
  free_shipping_text:
    settingsData.free_shipping_text || '🚚 Frete grátis para pedidos acima de R$ {valor}',
  free_shipping_remaining_text:
    settingsData.free_shipping_remaining_text || 'Faltam R$ {valor} para frete grátis',
  free_shipping_success_text:
    settingsData.free_shipping_success_text || 'Parabéns! Você ganhou frete grátis',

  show_fake_reviews: Number(settingsData.show_fake_reviews ?? 1),
  fake_rating: Number(settingsData.fake_rating ?? 4.9),
  fake_reviews_count: Number(settingsData.fake_reviews_count ?? 127),

  primary_color: settingsData.primary_color || '#620594',
  button_color: settingsData.button_color || '#059669',
  background_color: settingsData.background_color || '#f9fafb',

  header_background_color: settingsData.header_background_color || '#ffffff',
  header_text_color: settingsData.header_text_color || '#111827',
  header_border_color: settingsData.header_border_color || '#e5e7eb',

  search_background_color: settingsData.search_background_color || '#f3f4f6',
  search_text_color: settingsData.search_text_color || '#111827',

  cart_button_background_color: settingsData.cart_button_background_color || '#ffffff',
  cart_button_icon_color: settingsData.cart_button_icon_color || '#374151',
  cart_badge_background_color: settingsData.cart_badge_background_color || '#ef4444',
  cart_badge_text_color: settingsData.cart_badge_text_color || '#ffffff',

  cart_drawer_background_color: settingsData.cart_drawer_background_color || '#ffffff',
  cart_item_background_color: settingsData.cart_item_background_color || '#f9fafb',
  cart_total_background_color: settingsData.cart_total_background_color || '#ffffff',

  product_card_background_color: settingsData.product_card_background_color || '#ffffff',
  product_name_color: settingsData.product_name_color || '#111827',
  product_description_color: settingsData.product_description_color || '#6b7280',
  product_price_color: settingsData.product_price_color || '#059669',
  product_button_background_color: settingsData.product_button_background_color || '#059669',
  product_button_text_color: settingsData.product_button_text_color || '#ffffff',

  badge_featured_background_color: settingsData.badge_featured_background_color || '#f59e0b',
  badge_featured_text_color: settingsData.badge_featured_text_color || '#ffffff',
  badge_low_stock_background_color: settingsData.badge_low_stock_background_color || '#f97316',
  badge_low_stock_text_color: settingsData.badge_low_stock_text_color || '#ffffff',
  badge_sold_out_background_color: settingsData.badge_sold_out_background_color || '#dc2626',
  badge_sold_out_text_color: settingsData.badge_sold_out_text_color || '#ffffff',

  free_shipping_bar_background_color:
    settingsData.free_shipping_bar_background_color || '#e5e7eb',
  free_shipping_bar_fill_color:
    settingsData.free_shipping_bar_fill_color || '#10b981',
  free_shipping_box_background_color:
    settingsData.free_shipping_box_background_color || '#ecfdf5',
  free_shipping_text_color: settingsData.free_shipping_text_color || '#065f46',
});

const colorFields = [
  ['primary_color', 'Cor principal'],
  ['button_color', 'Cor botões padrão'],
  ['background_color', 'Cor fundo do site'],
  ['header_background_color', 'Topo fundo'],
  ['header_text_color', 'Topo texto'],
  ['header_border_color', 'Topo borda'],
  ['search_background_color', 'Busca fundo'],
  ['search_text_color', 'Busca texto'],
  ['cart_button_background_color', 'Botão carrinho fundo'],
  ['cart_button_icon_color', 'Botão carrinho ícone'],
  ['cart_badge_background_color', 'Badge carrinho fundo'],
  ['cart_badge_text_color', 'Badge carrinho texto'],
  ['cart_drawer_background_color', 'Carrinho lateral fundo'],
  ['cart_item_background_color', 'Item do carrinho fundo'],
  ['cart_total_background_color', 'Rodapé do carrinho fundo'],
  ['product_card_background_color', 'Card do produto fundo'],
  ['product_name_color', 'Nome do produto'],
  ['product_description_color', 'Descrição do produto'],
  ['product_price_color', 'Preço do produto'],
  ['product_button_background_color', 'Botão produto fundo'],
  ['product_button_text_color', 'Botão produto texto'],
  ['badge_featured_background_color', 'Badge destaque fundo'],
  ['badge_featured_text_color', 'Badge destaque texto'],
  ['badge_low_stock_background_color', 'Badge últimas unidades fundo'],
  ['badge_low_stock_text_color', 'Badge últimas unidades texto'],
  ['badge_sold_out_background_color', 'Badge esgotado fundo'],
  ['badge_sold_out_text_color', 'Badge esgotado texto'],
  ['free_shipping_box_background_color', 'Box frete grátis fundo'],
  ['free_shipping_text_color', 'Texto frete grátis'],
  ['free_shipping_bar_background_color', 'Barra frete fundo'],
  ['free_shipping_bar_fill_color', 'Barra frete progresso'],
];

function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={`w-14 h-8 flex items-center rounded-full transition-all ${
          checked ? 'bg-emerald-500' : 'bg-gray-300'
        }`}
      >
        <div
          className={`bg-white w-6 h-6 rounded-full shadow transform transition-all ${
            checked ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => settingsApi.get(),
  });

  useEffect(() => {
    if (isLoading) return;
    setForm(buildInitialForm(settingsData || {}));
  }, [settingsData, isLoading]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        store_name: form.store_name || '',
        whatsapp_number: form.whatsapp_number || '',
        header_text: form.header_text || '',
        logo_url: form.logo_url || '',

        opening_time: form.opening_time || '08:00',
        closing_time: form.closing_time || '22:00',
        is_open_override: Number(form.is_open_override) === 1 ? 1 : 0,
        closed_message: form.closed_message || '',

        free_shipping_enabled: Number(form.free_shipping_enabled) === 1 ? 1 : 0,
        free_shipping_threshold: Number(form.free_shipping_threshold || 0),
        free_shipping_text: form.free_shipping_text || '',
        free_shipping_remaining_text: form.free_shipping_remaining_text || '',
        free_shipping_success_text: form.free_shipping_success_text || '',

        show_fake_reviews: Number(form.show_fake_reviews) === 1 ? 1 : 0,
        fake_rating: Number(form.fake_rating || 0),
        fake_reviews_count: Number(form.fake_reviews_count || 0),

        primary_color: form.primary_color || '#620594',
        button_color: form.button_color || '#059669',
        background_color: form.background_color || '#f9fafb',

        header_background_color: form.header_background_color || '#ffffff',
        header_text_color: form.header_text_color || '#111827',
        header_border_color: form.header_border_color || '#e5e7eb',

        search_background_color: form.search_background_color || '#f3f4f6',
        search_text_color: form.search_text_color || '#111827',

        cart_button_background_color: form.cart_button_background_color || '#ffffff',
        cart_button_icon_color: form.cart_button_icon_color || '#374151',
        cart_badge_background_color: form.cart_badge_background_color || '#ef4444',
        cart_badge_text_color: form.cart_badge_text_color || '#ffffff',

        cart_drawer_background_color: form.cart_drawer_background_color || '#ffffff',
        cart_item_background_color: form.cart_item_background_color || '#f9fafb',
        cart_total_background_color: form.cart_total_background_color || '#ffffff',

        product_card_background_color: form.product_card_background_color || '#ffffff',
        product_name_color: form.product_name_color || '#111827',
        product_description_color: form.product_description_color || '#6b7280',
        product_price_color: form.product_price_color || '#059669',
        product_button_background_color: form.product_button_background_color || '#059669',
        product_button_text_color: form.product_button_text_color || '#ffffff',

        badge_featured_background_color: form.badge_featured_background_color || '#f59e0b',
        badge_featured_text_color: form.badge_featured_text_color || '#ffffff',
        badge_low_stock_background_color: form.badge_low_stock_background_color || '#f97316',
        badge_low_stock_text_color: form.badge_low_stock_text_color || '#ffffff',
        badge_sold_out_background_color: form.badge_sold_out_background_color || '#dc2626',
        badge_sold_out_text_color: form.badge_sold_out_text_color || '#ffffff',

        free_shipping_bar_background_color:
          form.free_shipping_bar_background_color || '#e5e7eb',
        free_shipping_bar_fill_color:
          form.free_shipping_bar_fill_color || '#10b981',
        free_shipping_box_background_color:
          form.free_shipping_box_background_color || '#ecfdf5',
        free_shipping_text_color: form.free_shipping_text_color || '#065f46',
      };

      return settingsApi.save(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      await queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Configurações salvas!');
    },
    onError: async (error) => {
      console.error(error);
      toast.error('Erro ao salvar configurações');
    },
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || 'Erro no upload');
      }

      setForm((prev) => ({ ...prev, logo_url: data.url }));
      toast.success('Logo enviada com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar logo');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (!form) {
    return (
      <AdminLayout title="Configurações">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </AdminLayout>
    );
  }

  const Section = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-emerald-600" /> {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const Field = ({ label, children }) => (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
      {children}
    </div>
  );

  const inputClass =
    'w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';

  return (
    <AdminLayout title="Configurações">
      <div className="space-y-6 max-w-4xl">
        <Section title="Informações da Loja" icon={Phone}>
          <Field label="Nome da Loja">
            <input
              type="text"
              value={form.store_name}
              onChange={(e) => setForm((p) => ({ ...p, store_name: e.target.value }))}
              className={inputClass}
            />
          </Field>

          <Field label="Texto principal">
            <input
              type="text"
              value={form.header_text}
              onChange={(e) => setForm((p) => ({ ...p, header_text: e.target.value }))}
              className={inputClass}
            />
          </Field>

          <Field label="WhatsApp">
            <input
              type="text"
              value={form.whatsapp_number}
              onChange={(e) => setForm((p) => ({ ...p, whatsapp_number: e.target.value }))}
              className={inputClass}
            />
          </Field>

          <Field label="Logo">
            <div className="flex items-center gap-4">
              {form.logo_url && (
                <img src={form.logo_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
              )}

              <label className="cursor-pointer px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200 flex items-center gap-2">
                <Upload className="w-4 h-4" /> {uploading ? 'Enviando...' : 'Upload Logo'}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>
          </Field>
        </Section>

        <Section title="Cores do Site" icon={Palette}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {colorFields.map(([key, label]) => (
              <Field key={key} label={label}>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form[key] || '#000000'}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    className="w-12 h-10 rounded-lg border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form[key] || ''}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </Field>
            ))}
          </div>
        </Section>

        <Section title="Frete Grátis" icon={Truck}>
          <Toggle
            label="Frete grátis"
            checked={Number(form.free_shipping_enabled) === 1}
            onChange={() =>
              setForm((p) => ({
                ...p,
                free_shipping_enabled: Number(p.free_shipping_enabled) === 1 ? 0 : 1,
              }))
            }
          />

          <Field label="Valor para frete grátis (R$)">
            <input
              type="number"
              step="0.01"
              value={form.free_shipping_threshold}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  free_shipping_threshold: parseFloat(e.target.value) || 0,
                }))
              }
              className={inputClass}
            />
          </Field>

          <Field label="Texto principal">
            <input
              type="text"
              value={form.free_shipping_text}
              onChange={(e) => setForm((p) => ({ ...p, free_shipping_text: e.target.value }))}
              className={inputClass}
            />
          </Field>

          <Field label="Texto quando ainda falta valor">
            <input
              type="text"
              value={form.free_shipping_remaining_text}
              onChange={(e) =>
                setForm((p) => ({ ...p, free_shipping_remaining_text: e.target.value }))
              }
              className={inputClass}
            />
          </Field>

          <Field label="Texto quando atingir frete grátis">
            <input
              type="text"
              value={form.free_shipping_success_text}
              onChange={(e) =>
                setForm((p) => ({ ...p, free_shipping_success_text: e.target.value }))
              }
              className={inputClass}
            />
          </Field>
        </Section>

        <Section title="Avaliações Fake" icon={Star}>
          <Toggle
            label="Mostrar avaliações nos produtos"
            checked={Number(form.show_fake_reviews) === 1}
            onChange={() =>
              setForm((p) => ({
                ...p,
                show_fake_reviews: Number(p.show_fake_reviews) === 1 ? 0 : 1,
              }))
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Nota">
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.fake_rating}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fake_rating: parseFloat(e.target.value) || 4.9 }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Quantidade de avaliações">
              <input
                type="number"
                value={form.fake_reviews_count}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fake_reviews_count: parseInt(e.target.value) || 0 }))
                }
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        <Section title="Horário de Funcionamento" icon={Clock}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Horário de abertura">
              <input
                type="time"
                value={form.opening_time}
                onChange={(e) => setForm((p) => ({ ...p, opening_time: e.target.value }))}
                className={inputClass}
              />
            </Field>

            <Field label="Horário de fechamento">
              <input
                type="time"
                value={form.closing_time}
                onChange={(e) => setForm((p) => ({ ...p, closing_time: e.target.value }))}
                className={inputClass}
              />
            </Field>
          </div>

          <Toggle
            label="Forçar loja aberta"
            checked={Number(form.is_open_override) === 1}
            onChange={() =>
              setForm((p) => ({
                ...p,
                is_open_override: Number(p.is_open_override) === 1 ? 0 : 1,
              }))
            }
          />

          <Field label="Mensagem de loja fechada">
            <input
              type="text"
              value={form.closed_message}
              onChange={(e) => setForm((p) => ({ ...p, closed_message: e.target.value }))}
              className={inputClass}
            />
          </Field>
        </Section>

        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Salvar Configurações
        </button>
      </div>
    </AdminLayout>
  );
}