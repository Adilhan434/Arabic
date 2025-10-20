import { Stack } from "expo-router";
import React from "react";
import { LanguageProvider } from "@/components/LanguageContext";

import "./global.css";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <Stack screenOptions={{ 
          headerShown: false,
          animation: 'none', // отключает анимацию для всех экранов
        }} />
    </LanguageProvider>
  );
}