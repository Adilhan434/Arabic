import { LanguageProvider } from "@/components/LanguageContext";
import { ThemeProvider } from "@/components/ThemeContext";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";

import "./global.css";

// Импортируем функции уведомлений только для нативных платформ
let notificationUtils: any = {};
if (Platform.OS !== 'web') {
  notificationUtils = require("@/utils/notificationUtils");
}

export default function RootLayout() {
  useEffect(() => {
    // Инициализация уведомлений при запуске приложения
    const initializeNotifications = async () => {
      try {
        if (Platform.OS === 'web') {
          console.log('Notifications are not supported on web platform');
          return;
        }

        const { getNotificationStatus, requestNotificationPermissions, scheduleDailyNotifications } = notificationUtils;
        const notificationsEnabled = await getNotificationStatus();
        if (notificationsEnabled) {
          const hasPermission = await requestNotificationPermissions();
          if (hasPermission) {
            await scheduleDailyNotifications();
          }
        }
      } catch (error) {
        console.error("Error initializing notifications:", error);
      }
    };

    initializeNotifications();
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "none", // отключает анимацию для всех экранов
          }}
        />
      </LanguageProvider>
    </ThemeProvider>
  );
}
