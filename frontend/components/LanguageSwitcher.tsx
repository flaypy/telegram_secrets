'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { locales, type Locale } from '@/i18n';

const languageNames: Record<Locale, string> = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
};

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as Locale;

  const handleChange = (newLocale: Locale) => {
    // Replace the locale in the pathname
    const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <div className="relative">
      <select
        value={currentLocale}
        onChange={(e) => handleChange(e.target.value as Locale)}
        className="bg-noir-medium border border-noir-light text-gray-300 px-4 py-2 rounded-lg
        hover:border-accent-gold focus:border-accent-gold focus:outline-none
        focus:ring-2 focus:ring-accent-gold/20 transition-all cursor-pointer"
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {languageNames[locale]}
          </option>
        ))}
      </select>
    </div>
  );
}
