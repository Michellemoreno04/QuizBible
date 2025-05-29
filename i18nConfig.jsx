// i18n.js
/*
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Importar los archivos de traducción
import en from './locales/en/common.json';
import es from './locales/es/common.json';

const resources = {
  en: {
    translation: en
  },
  es: {
    translation: es
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.getLocales()[0].languageCode, // Usar el idioma del dispositivo

    fallbackLng: 'es', // Idioma por defecto
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

// Función para cambiar el idioma
export const changeLanguage = async (language) => {
  await AsyncStorage.setItem('userLanguage', language);
  await i18n.changeLanguage(language);
};

// Función para obtener el idioma guardado
export const getStoredLanguage = async () => {
  try {
    const language = await AsyncStorage.getItem('userLanguage');
    if (language) {
      await i18n.changeLanguage(language);
    }
  } catch (error) {
    console.error('Error al obtener el idioma guardado:', error);
  }
};

export default i18n;

*/