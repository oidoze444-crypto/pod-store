// ============================================================
// src/App.jsx — Roteamento completo sem Base44
// ============================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { authApi } from './api/api';

// Pages
import Store from './pages/Store';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminFlavors from './pages/AdminFlavors';
import AdminBanners from './pages/AdminBanners';
import AdminOrders from './pages/AdminOrders';
import AdminSettings from './pages/AdminSettings';

const queryClient = new QueryClient();

// Guard para rotas admin
function AdminRoute({ children }) {
  if (!authApi.isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Loja pública */}
          <Route path="/" element={<Store />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Admin (protegido) */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/flavors" element={<AdminRoute><AdminFlavors /></AdminRoute>} />
          <Route path="/admin/banners" element={<AdminRoute><AdminBanners /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

// ============================================================
// Mudanças necessárias nas páginas Admin ao migrar:
//
// 1. Trocar createPageUrl('AdminXxx') por '/admin/xxx'
// 2. Trocar import { productsApi } from '../components/mysqlApi'
//    por import { productsApi } from '../api/api'
// 3. Trocar base44.functions.invoke('uploadToHostinger', form)
//    por uploadFile(file) do api.js
// ============================================================