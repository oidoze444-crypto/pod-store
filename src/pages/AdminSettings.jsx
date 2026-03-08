import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../components/mysqlApi';
import AdminLayout from '../components/admin/AdminLayout';
import { Save, Upload, Loader2, Palette, Phone, Truck, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => settingsApi.get(),
  });

  useEffect(() => {
    if (settingsData && !form) {
      setForm({ ...settingsData });
    } else if (!settingsData && !isLoading && !form) {
      setForm({ id: undefined,
        store_name: 'POD Store',
        whatsapp_number: '',
        primary_color: '#059669',
        button_color: '#059669',
        background_color: '#f9fafb',
        header_text: 'Os melhores PODs com entrega rápida!',
        delivery_fee: 0,
        min_order_value: 0,
        opening_time: '08:00',
        closing_time: '22:00',
        is_open_override: true,
        closed_message: 'Estamos fechados no momento. Volte em breve!',
      });
    }
  }, [settingsData, isLoading]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { id, created_at, updated_at, ...data } = form;
      return settingsApi.save(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Configurações salvas!');
    },
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    const res = await base44.functions.invoke('uploadToHostinger', form);
    setForm(prev => ({ ...prev, logo_url: res.data.file_url }));
    setUploading(false);
  };

  if (!form) return <AdminLayout title="Configurações"><div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div></AdminLayout>;

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

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <AdminLayout title="Configurações">
      <div className="space-y-6 max-w-2xl">
        <Section title="Informações da Loja" icon={Phone}>
          <Field label="Nome da Loja">
            <input type="text" value={form.store_name || ''} onChange={e => setForm(p => ({ ...p, store_name: e.target.value }))} className={inputClass} />
          </Field>
          <Field label="Texto principal">
            <input type="text" value={form.header_text || ''} onChange={e => setForm(p => ({ ...p, header_text: e.target.value }))} className={inputClass} />
          </Field>
          <Field label="WhatsApp (com DDI, ex: 5511999999999)">
            <input type="text" value={form.whatsapp_number || ''} onChange={e => setForm(p => ({ ...p, whatsapp_number: e.target.value }))} placeholder="5511999999999" className={inputClass} />
          </Field>
          <Field label="Logo">
            <div className="flex items-center gap-4">
              {form.logo_url && <img src={form.logo_url} alt="" className="w-14 h-14 rounded-xl object-cover" />}
              <label className="cursor-pointer px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200 flex items-center gap-2">
                <Upload className="w-4 h-4" /> {uploading ? 'Enviando...' : 'Upload Logo'}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>
          </Field>
        </Section>

        <Section title="Aparência" icon={Palette}>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Cor Principal">
              <div className="flex items-center gap-2">
                <input type="color" value={form.primary_color || '#059669'} onChange={e => setForm(p => ({ ...p, primary_color: e.target.value }))} className="w-10 h-10 rounded-lg border cursor-pointer" />
                <input type="text" value={form.primary_color || ''} onChange={e => setForm(p => ({ ...p, primary_color: e.target.value }))} className={inputClass} />
              </div>
            </Field>
            <Field label="Cor Botões">
              <div className="flex items-center gap-2">
                <input type="color" value={form.button_color || '#059669'} onChange={e => setForm(p => ({ ...p, button_color: e.target.value }))} className="w-10 h-10 rounded-lg border cursor-pointer" />
                <input type="text" value={form.button_color || ''} onChange={e => setForm(p => ({ ...p, button_color: e.target.value }))} className={inputClass} />
              </div>
            </Field>
            <Field label="Cor Fundo">
              <div className="flex items-center gap-2">
                <input type="color" value={form.background_color || '#f9fafb'} onChange={e => setForm(p => ({ ...p, background_color: e.target.value }))} className="w-10 h-10 rounded-lg border cursor-pointer" />
                <input type="text" value={form.background_color || ''} onChange={e => setForm(p => ({ ...p, background_color: e.target.value }))} className={inputClass} />
              </div>
            </Field>
          </div>
        </Section>

        <Section title="Entrega" icon={Truck}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Taxa de entrega (R$)">
              <input type="number" step="0.01" value={form.delivery_fee || 0} onChange={e => setForm(p => ({ ...p, delivery_fee: parseFloat(e.target.value) || 0 }))} className={inputClass} />
            </Field>
            <Field label="Pedido mínimo (R$)">
              <input type="number" step="0.01" value={form.min_order_value || 0} onChange={e => setForm(p => ({ ...p, min_order_value: parseFloat(e.target.value) || 0 }))} className={inputClass} />
            </Field>
          </div>
        </Section>

        <Section title="Horário de Funcionamento" icon={Clock}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Horário de abertura">
              <input type="time" value={form.opening_time || '08:00'} onChange={e => setForm(p => ({ ...p, opening_time: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Horário de fechamento">
              <input type="time" value={form.closing_time || '22:00'} onChange={e => setForm(p => ({ ...p, closing_time: e.target.value }))} className={inputClass} />
            </Field>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_open_override === true} onChange={e => setForm(p => ({ ...p, is_open_override: e.target.checked }))} className="w-4 h-4 rounded text-emerald-600" />
            <span className="text-sm font-medium">Forçar loja aberta (ignora horário)</span>
          </label>
          <Field label="Mensagem de loja fechada">
            <input type="text" value={form.closed_message || ''} onChange={e => setForm(p => ({ ...p, closed_message: e.target.value }))} className={inputClass} />
          </Field>
        </Section>

        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Salvar Configurações
        </button>
      </div>
    </AdminLayout>
  );
}