import React, { useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, productsApi } from '../components/mysqlApi';
import AdminLayout from '../components/admin/AdminLayout';
import { ClipboardList, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-800', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  delivered: { label: 'Entregue', color: 'bg-emerald-100 text-emerald-800', icon: Truck },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
};

function parseJsonField(value, fallback) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function playNewOrderSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.error('Erro ao tocar som:', e);
  }
}

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const knownOrderIdsRef = useRef(new Set());
  const initializedRef = useRef(false);

  const { data: rawOrders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => ordersApi.list(),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const orders = useMemo(() => {
    return rawOrders.map((order) => ({
      ...order,
      address: parseJsonField(order.address, order.address || ''),
      items: parseJsonField(order.items, []),
    }));
  }, [rawOrders]);

  useEffect(() => {
    const currentIds = new Set(orders.map((o) => o.id));

    if (!initializedRef.current) {
      knownOrderIdsRef.current = currentIds;
      initializedRef.current = true;
      return;
    }

    const newOrders = orders.filter((o) => !knownOrderIdsRef.current.has(o.id));

    if (newOrders.length > 0) {
      playNewOrderSound();
      toast.success(`Novo pedido recebido! (${newOrders.length})`);
    }

    knownOrderIdsRef.current = currentIds;
  }, [orders]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, order }) => {
      await ordersApi.update(id, { status });

      if (status === 'delivered' && Array.isArray(order?.items) && order.items.length) {
        const allProducts = await productsApi.list();

        for (const item of order.items) {
          const product = allProducts.find(
            (p) => String(p.name).trim() === String(item.product_name).trim()
          );

          if (product) {
            const newStock = Math.max(
              0,
              (parseInt(product.stock) || 0) - (parseInt(item.quantity) || 1)
            );

            await productsApi.update(product.id, {
              ...product,
              stock: newStock,
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Status do pedido atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar pedido');
    },
  });

  const sortedOrders = useMemo(() => {
    const priority = {
      pending: 0,
      confirmed: 1,
      delivered: 2,
      cancelled: 3,
    };

    return [...orders].sort((a, b) => {
      const statusDiff = (priority[a.status] ?? 99) - (priority[b.status] ?? 99);
      if (statusDiff !== 0) return statusDiff;

      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
  }, [orders]);

  return (
    <AdminLayout title="Pedidos">
      <div className="space-y-4">
        {sortedOrders.map((order) => {
          const cfg = statusConfig[order.status || 'pending'] || statusConfig.pending;
          const StatusIcon = cfg.icon;

          const addressText =
            typeof order.address === 'string'
              ? order.address
              : order.address
              ? `${order.address.street || ''}, ${order.address.number || ''}${
                  order.address.complement ? `, ${order.address.complement}` : ''
                } — ${order.address.neighborhood || ''}, ${order.address.city || ''}/${order.address.state || ''}`
              : '';

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
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

              {addressText && (
                <p className="text-sm text-gray-600 mb-3">
                  📍 {addressText}
                </p>
              )}

              <div className="space-y-1 mb-3">
                {Array.isArray(order.items) &&
                  order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm gap-3">
                      <span>
                        {item.quantity || 1}x {item.product_name || 'Produto'}
                        {item.flavor ? ` (${item.flavor})` : ''}
                      </span>
                      <span className="font-medium">
                        R$ {parseFloat(item.subtotal || 0).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <span className="font-bold text-lg text-emerald-600">
                  Total: R$ {parseFloat(order.total || 0).toFixed(2).replace('.', ',')}
                </span>

                <div className="flex gap-1.5 flex-wrap justify-end">
                  {['pending', 'confirmed', 'delivered', 'cancelled'].map((s) => {
                    const sc = statusConfig[s];
                    return (
                      <button
                        key={s}
                        onClick={() => updateMutation.mutate({ id: order.id, status: s, order })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          order.status === s
                            ? sc.color
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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

        {sortedOrders.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum pedido registrado</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}