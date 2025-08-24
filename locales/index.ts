import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ruTranslations from './ru.json';
import enTranslations from './en.json';
import kgTranslations from './kg.json';

export const translations = {
  ru: ruTranslations,
  en: enTranslations,
  kg: kgTranslations
};

export const languages = [
  { code: 'ru', name: 'Русский', nativeName: 'Русский' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'kg', name: 'Кыргызча', nativeName: 'Кыргызча' }
];

const LANGUAGE_KEY = 'selected-language';

export const getCurrentLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage) {
      return savedLanguage;
    }
    
    const systemLanguage = Localization.locale.split('-')[0];
    return languages.find(lang => lang.code === systemLanguage) ? systemLanguage : 'ru';
  } catch (error) {
    console.error('Error getting language:', error);
    return 'ru';
  }
};

export const setLanguage = async (languageCode: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
  } catch (error) {
    console.error('Error setting language:', error);
  }
};

export const getTranslation = (language: string, key: string): string => {
  const langTranslations = translations[language as keyof typeof translations];
  return langTranslations?.[key as keyof typeof langTranslations] || key;
};