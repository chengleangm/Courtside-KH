'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type AppLanguage = 'en' | 'km';

export type LanguageContextValue = {
  language: AppLanguage;
  isKhmer: boolean;
  locale: string;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = 'courtside-kh-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    // Restore the persisted preference after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === 'en' || saved === 'km') setLanguageState(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language === 'km' ? 'km' : 'en';
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isKhmer: language === 'km',
      locale: language === 'km' ? 'km-KH' : 'en-GB',
      setLanguage: (next) => setLanguageState(next),
      toggleLanguage: () => setLanguageState((current) => (current === 'en' ? 'km' : 'en')),
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
