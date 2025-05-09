import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationFR from './locales/fr/translation.json';

// the translations
const resources = {
  en: {
    translation: translationEN
  },
  fr: {
    translation: translationFR
  }
};

const getBrowserLanguage = () => {
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'fr' ? 'fr' : 'en'; // Default to English if not French
};

// Load saved language preference from localStorage or use browser language
const getSavedLanguage = () => {
  const savedLanguage = localStorage.getItem('mirrorTime_language');
  return savedLanguage || getBrowserLanguage();
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: getSavedLanguage(),
    fallbackLng: 'en', // use English as fallback
    
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;