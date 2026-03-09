import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi, flavorsApi, bannersApi, settingsApi } from '../components/mysqlApi';
import { CartProvider } from '../components/store/CartContext';
import StoreHeader from '../components/store/StoreHeader';
import BannerCarousel from '../components/store/BannerCarousel';
import ProductCard from '../components/store/ProductCard';
import CartDrawer from '../components/store/CartDrawer';
import FloatingCartButton from '../components/store/FloatingCartButton';
import WhatsAppButton from '../components/store/WhatsAppButton';
import ClosedOverlay from '../components/store/ClosedOverlay';
import { Loader2 } from 'lucide-react';

function StoreContent() {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list(),
  });

  const { data: flavors = [] } = useQuery({
    queryKey: ['flavors'],
    queryFn: () => flavorsApi.list(),
  });

  const { data: banners = [] } = useQuery({
    queryKey: ['banners'],
    queryFn: () => bannersApi.list(),
  });

  const { data: settings = {} } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then((d) => d || {}),
  });

  const isStoreClosed = useMemo(() => {
    if (settings.is_open_override === false) return true;
    if (settings.is_open_override === true) return false;
    if (!settings.opening_time || !settings.closing_time) return false;

    const now = new Date();
    const [oh, om] = settings.opening_time.split(':').map(Number);
    const [ch, cm] = settings.closing_time.split(':').map(Number);
    const mins = now.getHours() * 60 + now.getMinutes();

    return mins < oh * 60 + om || mins > ch * 60 + cm;
  }, [settings]);

  const activeProducts = products.filter((p) => Number(p.is_active) !== 0);

  const categories = useMemo(() => {
    const cats = [...new Set(activeProducts.map((p) => p.category).filter(Boolean))];
    return cats;
  }, [activeProducts]);

  const filteredProducts = useMemo(() => {
    let result = activeProducts;

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeProducts, selectedCategory, searchQuery]);

  const featuredProducts = filteredProducts.filter((p) => Number(p.is_featured) === 1);
  const regularProducts = filteredProducts.filter((p) => Number(p.is_featured) !== 1);

  if (loadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: settings.background_color || '#f9fafb' }}
    >
      {isStoreClosed && <ClosedOverlay settings={settings} />}

      <StoreHeader
        settings={settings}
        onCartOpen={() => setCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="max-w-3xl mx-auto px-4 pb-24">
        <div className="py-4">
          <BannerCarousel banners={banners} settings={settings} />
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide -mx-4 px-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todos
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {featuredProducts.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-bold text-gray-900 mb-3">⭐ Destaques</h2>
            <div className="grid grid-cols-2 gap-3">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  flavors={flavors}
                  settings={settings}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          {featuredProducts.length > 0 && regularProducts.length > 0 && (
            <h2 className="text-lg font-bold text-gray-900 mb-3">Todos os Produtos</h2>
          )}

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg font-medium">Nenhum produto encontrado</p>
              <p className="text-sm">Tente buscar por outro termo</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {(featuredProducts.length > 0 ? regularProducts : filteredProducts).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  flavors={flavors}
                  settings={settings}
                />
              ))}
            </div>
          )}
        </div>

        <footer className="mt-10 mb-6">
          <div className="text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Todos os direitos reservados — IC DIGITAL
          </div>
        </footer>
      </main>

      <FloatingCartButton onClick={() => setCartOpen(true)} />
      <WhatsAppButton whatsappNumber={settings.whatsapp_number} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} settings={settings} />
    </div>
  );
}

export default function Store() {
  return (
    <CartProvider>
      <StoreContent />
    </CartProvider>
  );
}