import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LayoutDashboard, Package, Droplets, Image, Settings, 
  ClipboardList, X, Store 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', page: 'AdminDashboard', icon: LayoutDashboard },
  { name: 'Produtos', page: 'AdminProducts', icon: Package },
  { name: 'Sabores', page: 'AdminFlavors', icon: Droplets },
  { name: 'Banners', page: 'AdminBanners', icon: Image },
  { name: 'Pedidos', page: 'AdminOrders', icon: ClipboardList },
  { name: 'Configurações', page: 'AdminSettings', icon: Settings },
];

export default function AdminSidebar({ open, onClose }) {
  const location = useLocation();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-50 transform transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 flex items-center justify-between border-b border-gray-800">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-400" />
            Admin
          </h2>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-800 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname.includes(item.page) || 
              (location.search && location.search.includes(item.page));
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <Link
            to={createPageUrl('Store')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <Store className="w-5 h-5" />
            Ver Loja
          </Link>
        </div>
      </aside>
    </>
  );
}