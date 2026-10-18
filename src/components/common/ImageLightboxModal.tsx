'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ImageLightboxModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({ imageUrl, onClose }) => {
  const { t } = useLanguage();
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-safe pb-safe pl-safe pr-safe bg-black/90 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-[calc(1rem+env(safe-area-inset-top,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div 
        className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={t.photoEnlarged || "Photo"}
          className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
        />
      </div>
    </div>
  );
};
