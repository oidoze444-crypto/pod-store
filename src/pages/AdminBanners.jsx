import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { bannersApi } from '../components/mysqlApi';
import AdminLayout from '../components/admin/AdminLayout';
import { Plus, Pencil, Trash2, Image, X, Upload, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBanners() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => bannersApi.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        const { id, created_at, updated_at, ...rest } = data;
        return bannersApi.update(id, rest);
      }
      return bannersApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      setEditing(null);
      toast.success('Banner salvo!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => bannersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Banner excluído!');
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    const res = await base44.functions.invoke('uploadToHostinger', form);
    setEditing(prev => ({ ...prev, image_url: res.data.file_url }));
    setUploading(false);
  };

  return (
    <AdminLayout title="Banners">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{banners.length} banners</p>
        <button
          onClick={() => setEditing({ title: '', subtitle: '', image_url: '', is_active: true, order: 0 })}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium text-sm hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo Banner
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold">{editing.id ? 'Editar Banner' : 'Novo Banner'}</h2>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Imagem</label>
                {editing.image_url && <img src={editing.image_url} alt="" className="w-full h-32 object-cover rounded-xl mb-2" />}
                <label className="cursor-pointer px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 w-fit">
                  <Upload className="w-4 h-4" /> {uploading ? 'Enviando...' : 'Upload Imagem'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Título *</label>
                <input type="text" value={editing.title} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Subtítulo</label>
                <input type="text" value={editing.subtitle} onChange={e => setEditing(p => ({ ...p, subtitle: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Ordem</label>
                <input type="number" value={editing.order} onChange={e => setEditing(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.is_active} onChange={e => setEditing(p => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 rounded text-emerald-600" />
                <span className="text-sm font-medium">Ativo</span>
              </label>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 bg-gray-100 rounded-xl font-medium text-sm hover:bg-gray-200">Cancelar</button>
              <button
                onClick={() => saveMutation.mutate(editing)}
                disabled={!editing.title || saveMutation.isPending}
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-medium text-sm hover:bg-emerald-700 disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {banners.map(banner => (
          <div key={banner.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 p-4">
              {banner.image_url ? (
                <img src={banner.image_url} alt={banner.title} className="w-24 h-14 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-24 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Image className="w-6 h-6 text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm truncate">{banner.title}</h3>
                  {banner.is_active ? <Eye className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <EyeOff className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </div>
                {banner.subtitle && <p className="text-xs text-gray-500 truncate">{banner.subtitle}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing({ ...banner })} className="p-2 hover:bg-gray-100 rounded-xl">
                  <Pencil className="w-4 h-4 text-gray-500" />
                </button>
                <button onClick={() => { if (confirm('Excluir?')) deleteMutation.mutate(banner.id); }} className="p-2 hover:bg-red-50 rounded-xl">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-400">
            <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum banner cadastrado</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}