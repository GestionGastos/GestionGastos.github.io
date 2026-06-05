import { createContext, useContext, useMemo, useState } from 'react';
import { defaultLocale, translations } from './translations.js';

const I18nContext = createContext(null);

function getNestedValue(source, path) {
  return path.split('.').reduce((current, key) => current?.[key], source);
}

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => localStorage.getItem('locale') ?? defaultLocale);

  const value = useMemo(() => {
    const t = (key) => getNestedValue(translations[locale], key) ?? getNestedValue(translations[defaultLocale], key) ?? key;
    const changeLocale = (nextLocale) => {
      localStorage.setItem('locale', nextLocale);
      setLocale(nextLocale);
      document.documentElement.lang = nextLocale;
    };

    document.documentElement.lang = locale;

    return { locale, setLocale: changeLocale, t };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }

  return context;
}
