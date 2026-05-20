import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { fr } from '../locales/fr';
import { ar } from '../locales/ar';
import { en } from '../locales/en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
    resources: {
      fr: { translation: fr },
      ar: { translation: ar },
      en: { translation: en }
    }
  });

// Mettre à jour la direction du document selon la langue
const updateDirection = (lng: string) => {
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
};

updateDirection(i18n.language);
i18n.on('languageChanged', updateDirection);

export default i18n;
