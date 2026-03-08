import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { productsApi, flavorsApi } from '../components/mysqlApi';
import AdminLayout from '../components/admin/AdminLayout';
import { Plus, Pencil, Trash2, Package, X, Star, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const emptyProduct = {
  name: '',
  description: '',
  price: 0,
  image_url: '',
  category: '',
  stock: 0,
  is_active: true,
  is_featured: false,
  flavor_ids: [],
  low_stock_threshold: 5
};

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productsApi.list(),
  });

  const { data: flavors = [] } = useQuery({
    queryKey: ['admin-flavors'],
    queryFn: () => flavorsApi.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        const { id, created_at, updated_at, ...rest } = data;
        return productsApi.update(id, rest);
      }
      return productsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setEditing(null);
      toast.success('Produto salvo!');
    },
    onError: () => {
      toast.error('Erro ao salvar produto');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Produto excluído!');
    },
    onError: () => {
      toast.error('Erro ao excluir produto');
    },
  });

  const toggleFlavor = (flavorId) => {
    setEditing(prev => {
      const ids = prev.flavor_ids || [];
      return {
        ...prev,
        flavor_ids: ids.includes(flavorId)
          ? ids.filter(f => f !== flavorId)
          : [...ids, flavorId]
      };
    });
  };

  return (
    <AdminLayout title="Produtos">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{products.length} produtos cadastrados</p>
        <button
          onClick={() => setEditing({ ...emptyProduct })}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium text-sm hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg">
                {editing.id ? 'Editar Produto' : 'Novo Produto'}
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">Imagem</label>

                {editing.image_url ? (
                  <img
                    src={editing.image_url}
                    alt=""
                    className="w-20 h-20 rounded-xl object-cover mb-3"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                    <Package className="w-8 h-8 text-gray-300" />
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Cole a URL da imagem"
                  value={editing.image_url || ''}
                  onChange={e => setEditing(p => ({ ...p, image_url: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Nome *</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={e => setEditing(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Descrição</label>
                <textarea
                  value={editing.description}
                  onChange={e => setEditing(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editing.price}
                    onChange={e => setEditing(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Estoque</label>
                  <input
                    type="number"
                    value={editing.stock}
                    onChange={e => setEditing(p => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Categoria</label>
                <input
                  type="text"
                  value={editing.category}
                  onChange={e => setEditing(p => ({ ...p, category: e.target.value }))}
                  placeholder="Ex: POD Descartável"
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Alerta estoque baixo</label>
                <input
                  type="number"
                  value={editing.low_stock_threshold}
                  onChange={e => setEditing(p => ({ ...p, low_stock_threshold: parseInt(e.target.value) || 5 }))}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {flavors.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Sabores vinculados</label>
                  <div className="flex flex-wrap gap-2">
                    {flavors.map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => toggleFlavor(f.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          editing.flavor_ids?.includes(f.id)
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.is_active}
                    onChange={e => setEditing(p => ({ ...p, is_active: e.target.checked }))}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span className="text-sm font-medium">Ativo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.is_featured}
                    onChange={e => setEditing(p => ({ ...p, is_featured: e.target.checked }))}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span className="text-sm font-medium">Destaque</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2.5 bg-gray-100 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={() => saveMutation.mutate(editing)}
                disabled={saveMutation.isPending || !editing.name}
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-medium text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {products.map(product => (
          <div
            key={product.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4"
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-gray-300" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm truncate">{product.name}</h3>
               {Number(product.is_featured) === 1 && (
  <Star className="w-4 h-4 text-amber-500 fill-current flex-shrink-0" />
)}
                {Number(product.is_active) === 0 && (
  <EyeOff className="w-4 h-4 text-gray-400 flex-shrink-0" />
)}
              </div>

              <p className="text-xs text-gray-500">{product.category || 'Sem categoria'}</p>

              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm font-bold text-emerald-600">
                  R$ {parseFloat(product.price || 0).toFixed(2).replace('.', ',')}
                </span>

                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    product.stock <= 0
                      ? 'bg-red-100 text-red-700'
                      : product.stock <= (product.low_stock_threshold || 5)
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {product.stock || 0} un.
                </span>
              </div>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => setEditing({ ...product })}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Pencil className="w-4 h-4 text-gray-500" />
              </button>

              <button
                onClick={() => {
                  if (confirm('Excluir este produto?')) deleteMutation.mutate(product.id);
                }}
                className="p-2 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        ))}

        {products.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum produto cadastrado</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}