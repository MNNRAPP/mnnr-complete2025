'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export function LanguageSelector() {
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = React.useState('en');

  React.useEffect(() => {
    // Get current locale from cookie or detect from browser
    const savedLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1];
    
    if (savedLocale) {
      setCurrentLocale(savedLocale);
    } else {
      const browserLang = navigator.language.substring(0, 2);
      const matchedLang = languages.find(l => l.code === browserLang);
      if (matchedLang) {
        setCurrentLocale(matchedLang.code);
      }
    }
  }, []);

  const handleLanguageChange = (locale: string) => {
    // Set cookie for server-side detection
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    setCurrentLocale(locale);
    // Refresh to apply new locale
    router.refresh();
  };

  const currentLang = languages.find(l => l.code === currentLocale) || languages[0];

  return (
    <div className="relative inline-block">
      <select
        value={currentLocale}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="appearance-none bg-transparent border border-zinc-700 rounded-lg px-3 py-1.5 pr-8 text-sm text-zinc-300 hover:border-zinc-500 focus:border-emerald-500 focus:outline-none cursor-pointer"
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-zinc-900 text-zinc-300">
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
