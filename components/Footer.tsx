import { icons } from "@/consonants.js";
import { playInterfaceSound } from "@/utils/soundUtils";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Footer = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedTab, setSelectedTab] = useState("home");
  const insets = useSafeAreaInsets();

  // Определяем текущую страницу на основе pathname
  useEffect(() => {
    if (pathname === "/" || pathname === "/index") {
      setSelectedTab("home");
    } else if (pathname === "/settings") {
      setSelectedTab("settings");
    } else {
      // Для других страниц оставляем текущее состояние
    }
  }, [pathname]);

  return (
    <View
      className="absolute left-6 right-6 h-[71px] bg-white/80 backdrop-blur-md rounded-[35px] flex-row items-center justify-between px-[34px] shadow-lg"
      style={{ bottom: insets.bottom }}
    >
      <TouchableOpacity
        className="items-center justify-center h-full"
        onPress={async () => {
          if (selectedTab !== "home") {
            await playInterfaceSound();
            setSelectedTab("home");
            router.push("/");
          }
        }}
        accessibilityLabel="Дом"
      >
        <Image
          source={selectedTab === "home" ? icons.home_selected : icons.home}
        />
      </TouchableOpacity>

      <TouchableOpacity
        className="items-center justify-center h-full"
        onPress={async () => {
          if (selectedTab !== "settings") {
            await playInterfaceSound();
            setSelectedTab("settings");
            router.push("/settings");
          }
        }}
        accessibilityLabel="Настройки"
      >
        <Image
          source={
            selectedTab === "settings"
              ? icons.settings_selected
              : icons.settings
          }
        />
      </TouchableOpacity>
    </View>
  );
};

export default Footer;
