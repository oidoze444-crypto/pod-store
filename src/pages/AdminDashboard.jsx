import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../components/admin/AdminLayout';
import { productsApi, flavorsApi, ordersApi } from '../components/mysqlApi';
import { Package, Droplets, AlertTriangle, ShoppingCart, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-extrabold mt-1" style={{ color }}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-xl" style={{ backgroundColor: color + '15' }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productsApi.list(),
  });

  const { data: flavors = [] } = useQuery({
    queryKey: ['admin-flavors'],
    queryFn: () => flavorsApi.list(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => ordersApi.list(),
  });

  const activeProducts = products.filter(p => p.is_active !== false);
  const outOfStock = products.filter(p => p.stock <= 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= (p.low_stock_threshold || 5));
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  const categoryData = products.reduce((acc, p) => {
    const cat = p.category || 'Sem categoria';
    const existing = acc.find(a => a.name === cat);
    if (existing) existing.value++;
    else acc.push({ name: cat, value: 1 });
    return acc;
  }, []);

  const COLORS = ['#059669', '#0891b2', '#7c3aed', '#db2777', '#ea580c', '#84cc16'];

  const stockData = products.slice(0, 8).map(p => ({
    name: p.name?.length > 12 ? p.name.slice(0, 12) + '...' : p.name,
    estoque: p.stock || 0,
  }));

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Produtos" value={products.length} icon={Package} color="#059669" />
        <StatCard title="Produtos Ativos" value={activeProducts.length} icon={CheckCircle} color="#0891b2" />
        <StatCard title="Sem Estoque" value={outOfStock.length} icon={XCircle} color="#ef4444" />
        <StatCard title="Estoque Baixo" value={lowStock.length} icon={AlertTriangle} color="#f59e0b" />
        <StatCard title="Total Sabores" value={flavors.length} icon={Droplets} color="#7c3aed" />
        <StatCard title="Total Pedidos" value={orders.length} icon={ShoppingCart} color="#059669" />
        <StatCard title="Pedidos Pendentes" value={pendingOrders.length} icon={TrendingUp} color="#f59e0b" />
        <StatCard title="Entregues" value={deliveredOrders.length} icon={CheckCircle} color="#059669" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {stockData.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Estoque por Produto</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stockData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="estoque" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {categoryData.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Produtos por Categoria</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name} (${value})`}>
                  {categoryData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {lowStock.length > 0 && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Produtos com Estoque Baixo
          </h3>
          <div className="space-y-2">
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3">
                <span className="font-medium text-sm">{p.name}</span>
                <span className="text-sm font-bold text-amber-600">{p.stock} un.</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}