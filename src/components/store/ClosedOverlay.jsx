import React from 'react';
import { Clock } from 'lucide-react';

export default function ClosedOverlay({ settings }) {
  return (
    <div className="fixed inset-0 z-50 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Loja Fechada</h2>
        <p className="text-gray-500 mb-4">
          {settings?.closed_message || 'Estamos fechados no momento. Volte em breve!'}
        </p>
        {settings?.opening_time && settings?.closing_time && (
          <p className="text-sm text-gray-400">
            Horário de funcionamento: {settings.opening_time} - {settings.closing_time}
          </p>
        )}
      </div>
    </div>
  );
}