import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, productsApi } from '../components/mysqlApi';
import AdminLayout from '../components/admin/AdminLayout';
import { ClipboardList, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-800', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  delivered: { label: 'Entregue', color: 'bg-emerald-100 text-emerald-800', icon: Truck },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function AdminOrders() {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => ordersApi.list(),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, order }) => {
      await ordersApi.update(id, { status });
      // Ao marcar como entregue, baixa o estoque
      if (status === 'delivered' && order?.items?.length) {
        const allProducts = await productsApi.list();
        for (const item of order.items) {
          const product = allProducts.find(p => p.name === item.product_name);
          if (product) {
            const newStock = Math.max(0, (parseInt(product.stock) || 0) - (item.quantity || 1));
            await productsApi.update(product.id, { stock: newStock });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  return (
    <AdminLayout title="Pedidos">
      <div className="space-y-4">
        {orders.map(order => {
          const cfg = statusConfig[order.status || 'pending'];
          const StatusIcon = cfg.icon;
          return (
            <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-base">{order.customer_name || 'Sem nome'}</h3>
                  <p className="text-xs text-gray-500">
                    {order.created_at ? format(new Date(order.created_at), 'dd/MM/yyyy HH:mm') : ''}
                  </p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {cfg.label}
                </div>
              </div>

              {order.address && (
                <p className="text-sm text-gray-600 mb-3">
                  📍 {order.address.street}, {order.address.number}
                  {order.address.complement ? `, ${order.address.complement}` : ''} — {order.address.neighborhood}, {order.address.city}/{order.address.state}
                </p>
              )}

              <div className="space-y-1 mb-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.product_name} ({item.flavor})</span>
                    <span className="font-medium">R$ {parseFloat(item.subtotal || 0).toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <span className="font-bold text-lg text-emerald-600">
                  Total: R$ {parseFloat(order.total || 0).toFixed(2).replace('.', ',')}
                </span>
                <div className="flex gap-1.5">
                  {['pending', 'confirmed', 'delivered', 'cancelled'].map(s => {
                    const sc = statusConfig[s];
                    return (
                      <button
                        key={s}
                        onClick={() => updateMutation.mutate({ id: order.id, status: s, order })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          order.status === s ? sc.color : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {sc.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
        {orders.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum pedido registrado</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}