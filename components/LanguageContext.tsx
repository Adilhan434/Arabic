import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentLanguage, setLanguage } from '@/locales';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (languageCode: string) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// Коды и названия языков (перенесено сюда)
export const languages = [
  { code: 'ru', name: 'Русский', nativeName: 'Русский' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'kg', name: 'Кыргызча', nativeName: 'Кыргызча' }
];

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('ru');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async (): Promise<void> => {
    const language = await getCurrentLanguage();
    setCurrentLanguage(language);
  };

  const changeLanguage = async (languageCode: string): Promise<void> => {
    await setLanguage(languageCode);
    setCurrentLanguage(languageCode);
  };

  const t = (key: string): string => {
    const { getTranslation } = require('@/locales');
    return getTranslation(currentLanguage, key);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};