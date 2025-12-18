import { getCurrentLanguage, setLanguage } from "@/locales";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";

// Импортируем функции уведомлений только для нативных платформ
let notificationUtils: any = {};
if (Platform.OS !== 'web') {
  notificationUtils = require("@/utils/notificationUtils");
}

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (languageCode: string) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

// Коды и названия языков (перенесено сюда)
export const languages = [
  { code: "ru", name: "Русский", nativeName: "Русский" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "kg", name: "Кыргызча", nativeName: "Кыргызча" },
];

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>("kg");

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
    // Обновляем уведомления при изменении языка (только для нативных платформ)
    if (Platform.OS !== 'web') {
      const { updateNotificationsForLanguageChange } = notificationUtils;
      await updateNotificationsForLanguageChange();
    }
  };

  

  const t = (key: string): string => {
    const { getTranslation } = require("@/locales");
    return getTranslation(currentLanguage, key);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
