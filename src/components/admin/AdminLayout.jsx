import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { Menu } from 'lucide-react';

export default function AdminLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <header className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </header>
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}