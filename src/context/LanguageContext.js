import React, { createContext, useContext, useState } from 'react';
import { translations, RTL_LANGUAGES } from '../i18n/translations';

const LANG_KEY = 'gigprofit_lang';
const DIR_KEY = 'gigprofit_dir';

function readStored() {
  try {
    const code = typeof localStorage !== 'undefined' ? localStorage.getItem(LANG_KEY) : null;
    return code && translations[code] ? code : null;
  } catch {
    return null;
  }
}

function persist(code, isRTL) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LANG_KEY, code);
      localStorage.setItem(DIR_KEY, isRTL ? 'rtl' : 'ltr');
    }
  } catch {}
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readStored);

  function setLanguage(code) {
    const isRTL = RTL_LANGUAGES.includes(code);
    persist(code, isRTL);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = code;
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    }
    setLanguageState(code);
  }

  function t(key) {
    const dict = translations[language] || translations.en;
    return dict[key] ?? translations.en[key] ?? key;
  }

  const isRTL = RTL_LANGUAGES.includes(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
