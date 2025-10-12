'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Header() {
  const t = useTranslations('nav');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <header className="bg-noir-dark border-b border-noir-light">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <h1 className="text-2xl font-serif font-bold text-accent-gold">
              Telegram Secrets
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href={`/${locale}`}
              className="text-gray-300 hover:text-accent-gold transition-colors"
            >
              {t('home')}
            </Link>
            <Link
              href={`/${locale}/store`}
              className="text-gray-300 hover:text-accent-gold transition-colors"
            >
              {t('store')}
            </Link>
            <Link
              href={`/${locale}/admin/products`}
              className="text-gray-300 hover:text-accent-gold transition-colors"
            >
              {t('admin')}
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden text-gray-300 hover:text-accent-gold">
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
