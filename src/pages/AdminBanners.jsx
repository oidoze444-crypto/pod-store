import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bannersApi } from '../components/mysqlApi';
import AdminLayout from '../components/admin/AdminLayout';
import { Plus, Pencil, Trash2, Image, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBanners() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => bannersApi.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        title: data.title || '',
        image_url: data.image_url || '',
        link: data.link || '',
        is_active: data.is_active ?? true,
      };

      if (data.id) {
        return bannersApi.update(data.id, payload);
      }

      return bannersApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      setEditing(null);
      toast.success('Banner salvo!');
    },
    onError: () => {
      toast.error('Erro ao salvar banner');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => bannersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Banner excluído!');
    },
    onError: () => {
      toast.error('Erro ao excluir banner');
    },
  });

  return (
    <AdminLayout title="Banners">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{banners.length} banners</p>

        <button
          onClick={() =>
            setEditing({
              title: '',
              image_url: '',
              link: '',
              is_active: true,
            })
          }
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium text-sm hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo Banner
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold">
                {editing.id ? 'Editar Banner' : 'Novo Banner'}
              </h2>

              <button
                onClick={() => setEditing(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Imagem do Banner
                </label>

                {editing.image_url ? (
                  <img
                    src={editing.image_url}
                    alt=""
                    className="w-full h-32 object-cover rounded-xl mb-3"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-xl mb-3">
                    <Image className="w-8 h-8 text-gray-300" />
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Cole a URL da imagem"
                  value={editing.image_url || ''}
                  onChange={e =>
                    setEditing((prev) => ({ ...prev, image_url: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Título *
                </label>

                <input
                  type="text"
                  value={editing.title || ''}
                  onChange={e =>
                    setEditing((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Link do banner
                </label>

                <input
                  type="text"
                  placeholder="https://..."
                  value={editing.link || ''}
                  onChange={e =>
                    setEditing((prev) => ({ ...prev, link: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!editing.is_active}
                  onChange={e =>
                    setEditing((prev) => ({ ...prev, is_active: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span className="text-sm font-medium">Banner ativo</span>
              </label>
            </div>

            <div className="flex gap-3 p-5 border-t">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2.5 bg-gray-100 rounded-xl font-medium text-sm hover:bg-gray-200"
              >
                Cancelar
              </button>

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
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4 p-4">
              {banner.image_url ? (
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-24 h-14 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Image className="w-6 h-6 text-gray-300" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm truncate">{banner.title}</h3>
                  {banner.is_active ? (
                    <Eye className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                {banner.link && (
                  <p className="text-xs text-gray-500 truncate">{banner.link}</p>
                )}
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => setEditing({ ...banner })}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <Pencil className="w-4 h-4 text-gray-500" />
                </button>

                <button
                  onClick={() => {
                    if (confirm('Excluir banner?')) deleteMutation.mutate(banner.id);
                  }}
                  className="p-2 hover:bg-red-50 rounded-xl"
                >
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