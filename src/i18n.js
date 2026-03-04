import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ru from './locales/ru.json';
import kz from './locales/kz.json';
import de from './locales/de.json';
import es from './locales/es.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ru: { translation: ru },
            kz: { translation: kz },
            de: { translation: de },
            es: { translation: es }
        },
        fallbackLng: 'ru',
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: false
        }
    });

export default i18n;
