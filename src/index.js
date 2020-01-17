import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import app from './app';
import en from '../locales/en/translation.json';
import ru from '../locales/ru/translation.json';

i18next
  .use(LanguageDetector)
  .init({
    debug: process.env.NODE_ENV === 'development',
    resources: {
      en: { translation: en },
      ru: { translation: ru },
    },
    fallbackLng: 'en',
  })
  .then((t) => app(t, 5000));
