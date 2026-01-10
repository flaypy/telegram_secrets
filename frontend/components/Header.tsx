'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

export default function Header() {
  const t = useTranslations('nav');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-noir-dark border-b border-noir-light sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <Image
              src="/logo.png"
              alt="Telegram Secrets Logo"
              width={36}
              height={36}
              className="object-contain md:w-10 md:h-10"
              priority
            />
            <h1 className="text-lg md:text-2xl font-serif font-bold text-accent-gold">
              Secret Vips
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-300 hover:text-accent-gold transition-colors text-base"
            >
              {t('home')}
            </Link>
            <Link
              href="/store"
              className="text-gray-300 hover:text-accent-gold transition-colors text-base"
            >
              {t('store')}
            </Link>
          </nav>

          {/* Mobile menu button - larger tap target */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-accent-gold p-2 -mr-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-2 border-t border-noir-light pt-4 animate-fadeIn">
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-accent-gold transition-colors text-base py-2 px-2 rounded hover:bg-noir-medium"
              >
                {t('home')}
              </Link>
              <Link
                href="/store"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-accent-gold transition-colors text-base py-2 px-2 rounded hover:bg-noir-medium"
              >
                {t('store')}
              </Link>
            </div>
          </nav>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}
