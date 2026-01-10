'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';

export default function BlackFridayPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const popupRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('common');

  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeenPopup = sessionStorage.getItem('blackFridayPopupSeen');
    if (!hasSeenPopup) {
      // Delay popup by 2 seconds for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('blackFridayPopupSeen', 'true');
  };

  // Handle swipe down to dismiss on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd < -100) {
      // Swipe down detected
      handleClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={handleClose}
    >
      <div
        ref={popupRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg md:max-w-2xl w-full bg-gradient-to-br from-noir-dark via-noir-medium to-noir-dark border-2 border-accent-gold rounded-2xl p-6 md:p-8 shadow-2xl animate-scaleIn max-h-[85vh] md:max-h-[90vh] overflow-y-auto"
      >
        {/* Swipe indicator for mobile */}
        <div className="md:hidden flex justify-center mb-2">
          <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
        </div>

        {/* Close button - larger tap target on mobile */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 p-2 -m-2"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Black Friday Badge */}
          <div className="inline-block mb-3 md:mb-4">
            <span className="bg-gradient-to-r from-accent-gold via-accent-rose to-accent-purple text-white font-bold text-xs md:text-sm px-4 py-1.5 rounded-full uppercase tracking-wider animate-pulse">
              Black Friday
            </span>
          </div>

          {/* Main heading - better mobile sizing */}
          <h2 className="text-2xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-gold via-accent-rose to-accent-purple mb-3 md:mb-4 leading-tight">
            🔥 Promoção Especial! 🔥
          </h2>

          {/* Description */}
          <p className="text-base md:text-2xl text-gray-200 mb-3 md:mb-6 font-semibold">
            10% de desconto em <span className="text-accent-gold">TODOS</span> os produtos!
          </p>

          <p className="text-sm md:text-lg text-gray-400 mb-6 md:mb-8 px-1">
            Aproveite esta oferta exclusiva por tempo limitado e garanta acesso aos melhores conteúdos com preços incríveis!
          </p>

          {/* CTA Button - full width on mobile with better tap target */}
          <button
            onClick={handleClose}
            className="btn-primary text-base md:text-lg px-6 md:px-8 py-4 bg-gradient-to-r from-accent-gold to-accent-rose hover:from-accent-rose hover:to-accent-purple transition-all duration-300 transform hover:scale-105 w-full shadow-lg"
          >
            Ver Produtos em Promoção
          </button>

          {/* Mobile hint */}
          <p className="md:hidden text-xs text-gray-600 mt-4">
            Deslize para baixo para fechar
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute -top-10 -left-10 w-32 h-32 md:w-40 md:h-40 bg-accent-gold/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 md:w-40 md:h-40 bg-accent-rose/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
