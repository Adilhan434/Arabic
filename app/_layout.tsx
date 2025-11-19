import { LanguageProvider } from "@/components/LanguageContext";
import {
  getNotificationStatus,
  requestNotificationPermissions,
  scheduleDailyNotifications,
} from "@/utils/notificationUtils";
import { Stack } from "expo-router";
import React, { useEffect } from "react";

import "./global.css";

export default function RootLayout() {
  useEffect(() => {
    // Инициализация уведомлений при запуске приложения
    const initializeNotifications = async () => {
      try {
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
    <LanguageProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none", // отключает анимацию для всех экранов
        }}
      />
    </LanguageProvider>
  );
}
