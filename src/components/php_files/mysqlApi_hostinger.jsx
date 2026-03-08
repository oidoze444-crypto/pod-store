// =======================================================
// VERSÃO DO mysqlApi.js PARA USAR COM PHP NA HOSTINGER
// =======================================================
// Quando hospedar na Hostinger, substitua o conteúdo de
// components/mysqlApi.js por este arquivo.
//
// Troque a URL abaixo pelo endereço real dos seus arquivos PHP:
// Exemplo: https://seudominio.com.br/api/api.php
// =======================================================

const API_URL = 'https://seudominio.com.br/api/api.php';
const UPLOAD_URL = 'https://seudominio.com.br/api/upload.php';

async function call(entity, action, params = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entity, action, ...params }),
  });
  const data = await res.json();
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function uploadFile(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(UPLOAD_URL, { method: 'POST', body: form });
  const data = await res.json();
  if (data?.error) throw new Error(data.error);
  return data.file_url;
}

export const productsApi = {
  list: (filters, sort, limit) => call('products', 'list', { filters, sort, limit }),
  get: (id) => call('products', 'get', { id }),
  create: (data) => call('products', 'create', { data }),
  update: (id, data) => call('products', 'update', { id, data }),
  delete: (id) => call('products', 'delete', { id }),
  filter: (filters) => call('products', 'list', { filters }),
};

export const flavorsApi = {
  list: (filters) => call('flavors', 'list', { filters }),
  create: (data) => call('flavors', 'create', { data }),
  update: (id, data) => call('flavors', 'update', { id, data }),
  delete: (id) => call('flavors', 'delete', { id }),
};

export const bannersApi = {
  list: (filters) => call('banners', 'list', { filters }),
  create: (data) => call('banners', 'create', { data }),
  update: (id, data) => call('banners', 'update', { id, data }),
  delete: (id) => call('banners', 'delete', { id }),
};

export const ordersApi = {
  list: (filters, limit) => call('orders', 'list', { filters, limit }),
  get: (id) => call('orders', 'get', { id }),
  create: (data) => call('orders', 'create', { data }),
  update: (id, data) => call('orders', 'update', { id, data }),
  delete: (id) => call('orders', 'delete', { id }),
};

export const settingsApi = {
  get: () => call('site_settings', 'get'),
  save: (data) => call('site_settings', 'upsert', { data }),
};