import React, { createContext, useContext, useState, useEffect } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, RTL_LANGUAGES } from '../i18n/translations';

const LANG_KEY = '@gigprofit_language';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(null); // null = not chosen yet

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((stored) => {
      if (stored && translations[stored]) {
        applyLanguage(stored, false);
      } else {
        setLanguageState(null);
      }
    });
  }, []);

  function applyLanguage(code, persist = true) {
    const isRTL = RTL_LANGUAGES.includes(code);
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
    }
    setLanguageState(code);
    if (persist) {
      AsyncStorage.setItem(LANG_KEY, code);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = code;
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      try {
        localStorage.setItem('gigprofit_lang', code);
        localStorage.setItem('gigprofit_dir', isRTL ? 'rtl' : 'ltr');
      } catch {}
    }
  }

  function t(key) {
    const dict = translations[language] || translations.en;
    return dict[key] ?? translations.en[key] ?? key;
  }

  const isRTL = RTL_LANGUAGES.includes(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: applyLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
