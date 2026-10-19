'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface ImageLightboxModalProps {
  imageUrl?: string | null;
  images?: string[];
  initialIndex?: number;
  isOpen?: boolean;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({ 
  imageUrl, 
  images, 
  initialIndex = 0,
  isOpen,
  onClose 
}) => {
  const { t } = useLanguage();

  const imageList = React.useMemo(() => {
    if (images && images.length > 0) {
      return images.filter(Boolean);
    }
    if (imageUrl) {
      return [imageUrl];
    }
    return [];
  }, [images, imageUrl]);

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Sync index when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen !== false) {
      if (initialIndex >= 0 && initialIndex < imageList.length) {
        setCurrentIndex(initialIndex);
      } else {
        setCurrentIndex(0);
      }
    }
  }, [isOpen, initialIndex, imageList.length]);

  const shouldRender = isOpen !== undefined ? isOpen && imageList.length > 0 : imageList.length > 0;

  const handlePrev = useCallback(() => {
    if (imageList.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
  }, [imageList.length]);

  const handleNext = useCallback(() => {
    if (imageList.length <= 1) return;
    setCurrentIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
  }, [imageList.length]);

  // Keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!shouldRender) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shouldRender, handlePrev, handleNext, onClose]);

  // Prevent background scrolling while open
  useEffect(() => {
    if (shouldRender) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [shouldRender]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  if (!shouldRender) return null;

  const currentImage = imageList[currentIndex] || imageList[0];

  return (
    <div 
      className="fixed inset-0 z-[150] flex flex-col items-center justify-between p-3 sm:p-5 pt-safe pb-safe pl-safe pr-safe bg-black/95 backdrop-blur-md animate-fadeIn select-none"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label={t.galleryTitle || "Fényképek galériája"}
    >
      {/* Top Bar: Képszámláló és bezárás gomb */}
      <div 
        className="w-full max-w-5xl flex items-center justify-between z-10 py-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          {imageList.length > 1 ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs sm:text-sm font-semibold border border-white/15 backdrop-blur-md">
              <Images className="w-4 h-4 text-blue-400" />
              <span>
                {currentIndex + 1} / {imageList.length} {t.photoCountUnit || 'kép'}
              </span>
            </div>
          ) : (
            <span className="text-white/80 text-xs sm:text-sm font-light">
              {t.galleryTitle || "Fénykép megtekintése"}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer"
          title={t.close || "Bezárás"}
          aria-label={t.close || "Bezárás"}
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Main Image Stage with Next/Prev Buttons */}
      <div 
        className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-auto min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Balra nyíl (ha több kép van) */}
        {imageList.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-1 sm:left-4 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/20 hover:scale-105 active:scale-95 transition-all backdrop-blur-md cursor-pointer shadow-lg"
            title={t.galleryPrev || "Előző kép"}
            aria-label={t.galleryPrev || "Előző kép"}
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}

        {/* Nagyított fotó */}
        <div className="relative max-w-full max-h-[72vh] flex items-center justify-center">
          <img
            key={currentImage}
            src={currentImage}
            alt={`${t.photoEnlarged || 'Fotó'} (${currentIndex + 1}/${imageList.length})`}
            className="max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl animate-fadeIn transition-transform duration-200"
          />
        </div>

        {/* Jobbra nyíl (ha több kép van) */}
        {imageList.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-1 sm:right-4 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/20 hover:scale-105 active:scale-95 transition-all backdrop-blur-md cursor-pointer shadow-lg"
            title={t.galleryNext || "Következő kép"}
            aria-label={t.galleryNext || "Következő kép"}
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip (ha több kép van) */}
      {imageList.length > 1 && (
        <div 
          className="w-full max-w-3xl flex items-center justify-center gap-2 sm:gap-3 py-2 px-3 overflow-x-auto z-10 scrollbar-none"
          onClick={(e) => e.stopPropagation()}
        >
          {imageList.map((url, idx) => (
            <button
              key={`${url}-${idx}`}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
                idx === currentIndex
                  ? 'ring-2 ring-blue-500 scale-105 opacity-100 shadow-md shadow-blue-500/30'
                  : 'opacity-50 hover:opacity-85 border border-white/20'
              }`}
              title={`${idx + 1}. kép`}
            >
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
