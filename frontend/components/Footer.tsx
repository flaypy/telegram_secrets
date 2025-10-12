'use client';

import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-noir-dark border-t border-noir-light mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="text-gray-400 text-sm">
            © {currentYear} Telegram Secrets. {t('rights')}.
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">{t('selectLanguage')}:</span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
