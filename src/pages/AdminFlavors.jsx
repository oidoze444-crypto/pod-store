import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flavorsApi } from '../components/mysqlApi';
import AdminLayout from '../components/admin/AdminLayout';
import { Plus, Pencil, Trash2, Droplets, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminFlavors() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);

  const { data: flavors = [], isLoading } = useQuery({
    queryKey: ['admin-flavors'],
    queryFn: () => flavorsApi.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        const { id, created_at, updated_at, ...rest } = data;
        return flavorsApi.update(id, rest);
      }
      return flavorsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flavors'] });
      setEditing(null);
      toast.success('Sabor salvo!');
    },
    onError: () => {
      toast.error('Erro ao salvar sabor');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => flavorsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flavors'] });
      toast.success('Sabor excluído!');
    },
    onError: () => {
      toast.error('Erro ao excluir sabor');
    },
  });

  return (
    <AdminLayout title="Sabores">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{flavors.length} sabores cadastrados</p>
        <button
          onClick={() => setEditing({ name: '', is_active: true })}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium text-sm hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo Sabor
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold">{editing.id ? 'Editar Sabor' : 'Novo Sabor'}</h2>
              <button
                onClick={() => setEditing(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Nome *</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={e => setEditing(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Morango"
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.is_active}
                  onChange={e => setEditing(p => ({ ...p, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span className="text-sm font-medium">Ativo</span>
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
                disabled={!editing.name || saveMutation.isPending}
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-medium text-sm hover:bg-emerald-700 disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {flavors.map(flavor => (
          <div
            key={flavor.id}
            className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Droplets className="w-5 h-5 text-emerald-500" />
              <span className="font-medium text-sm">{flavor.name}</span>
              {!flavor.is_active && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  Inativo
                </span>
              )}
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => setEditing({ ...flavor })}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <Pencil className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => {
                  if (confirm('Excluir?')) deleteMutation.mutate(flavor.id);
                }}
                className="p-2 hover:bg-red-50 rounded-xl"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        ))}

        {flavors.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-400">
            <Droplets className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum sabor cadastrado</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}