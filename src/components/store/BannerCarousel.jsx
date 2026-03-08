import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function BannerCarousel({ banners, settings }) {
  const [current, setCurrent] = useState(0);
  const activeBanners = banners.filter(b => b.is_active);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) {
    return (
      <div 
        className="relative w-full h-48 md:h-72 rounded-2xl overflow-hidden flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${settings?.primary_color || '#059669'}, ${settings?.primary_color || '#059669'}dd)` }}
      >
        <div className="text-center text-white px-6">
          <h2 className="text-2xl md:text-4xl font-bold mb-2">{settings?.store_name || 'POD Store'}</h2>
          <p className="text-sm md:text-lg opacity-90">{settings?.header_text || 'Os melhores PODs com entrega rápida!'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 md:h-72 rounded-2xl overflow-hidden group">
      {activeBanners.map((banner, idx) => (
        <div
          key={banner.id}
          className="absolute inset-0 transition-all duration-700 ease-in-out"
          style={{ 
            opacity: idx === current ? 1 : 0,
            transform: idx === current ? 'scale(1)' : 'scale(1.05)',
          }}
        >
          {banner.image_url ? (
            <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
          ) : (
            <div 
              className="w-full h-full"
              style={{ background: `linear-gradient(135deg, ${settings?.primary_color || '#059669'}, ${settings?.primary_color || '#059669'}cc)` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h2 className="text-xl md:text-3xl font-bold mb-1">{banner.title}</h2>
            {banner.subtitle && <p className="text-sm md:text-base opacity-90">{banner.subtitle}</p>}
          </div>
        </div>
      ))}
      
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={() => setCurrent(prev => (prev - 1 + activeBanners.length) % activeBanners.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrent(prev => (prev + 1) % activeBanners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === current ? 'bg-white w-6' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}