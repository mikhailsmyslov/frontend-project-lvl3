import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import app from './app';
import en from '../locales/en/translation.json';

i18next
  .use(LanguageDetector)
  .init({
    debug: process.env.NODE_ENV === 'development',
    resources: {
      en: { translation: en },
    },
    fallbackLng: 'en',
    lng: 'en',
  })
  .then(t => app(t));
