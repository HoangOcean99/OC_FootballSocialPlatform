import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// We'll add actual translation files later
const resources = {
  en: {
    translation: {
      "welcome": "Welcome to Football Social"
    }
  },
  vi: {
    translation: {
      "welcome": "Chào mừng đến với Football Social"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "vi", // Default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
