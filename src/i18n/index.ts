import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import id from './locales/id.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ru from './locales/ru.json';
import ar from './locales/ar.json';
import tr from './locales/tr.json';

const resources = {
  en: { translation: en },
  id: { translation: id },
  ja: { translation: ja },
  ko: { translation: ko },
  ru: { translation: ru },
  ar: { translation: ar },
  tr: { translation: tr },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'id', // Bahasa Indonesia as default
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    react: {
      useSuspense: true,
    },
  });

export default i18n;