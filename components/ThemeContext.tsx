import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
  theme: {
    dark: boolean;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      accentDark: string;
      font: string;
      fontSecondary: string;
      fontLight: string;
      card: string;
      cardBorder: string;
      background: string;
      darkBg: string;
    };
  };
}

const THEME_KEY = "app_theme";

const lightColors = {
  primary: "#1A1A1A",
  secondary: "#FFFFFF",
  accent: "#C7FF00",
  accentDark: "#A8D600",
  font: "#1A1A1A",
  fontSecondary: "#6B7280",
  fontLight: "#9CA3AF",
  card: "#FFFFFF",
  cardBorder: "#E5E7EB",
  background: "#F5F5F5",
  darkBg: "#2D2D2D",
};

const darkColors = {
  primary: "#FFFFFF",
  secondary: "#1A1A1A",
  accent: "#C7FF00",
  accentDark: "#A8D600",
  font: "#FFFFFF",
  fontSecondary: "#9CA3AF",
  fontLight: "#6B7280",
  card: "#2D2D2D",
  cardBorder: "#404040",
  background: "#1A1A1A",
  darkBg: "#0F0F0F",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async (): Promise<void> => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  const toggleTheme = async (): Promise<void> => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem(THEME_KEY, JSON.stringify(newTheme));
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme: { dark: isDarkMode, colors } }}>
      {children}
    </ThemeContext.Provider>
  );
};
