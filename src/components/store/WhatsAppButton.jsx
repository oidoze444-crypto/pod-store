import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton({ whatsappNumber }) {
  if (!whatsappNumber) return null;
  const number = whatsappNumber.replace(/\D/g, '');
  
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-30 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 active:scale-95 transition-all"
    >
      <MessageCircle className="w-7 h-7 fill-current" />
    </a>
  );
}