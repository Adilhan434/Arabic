import { icons } from "@/consonants.js";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, SafeAreaView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import "@/app/global.css";

const Footer = () => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("home");
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1">

      <View
        className="absolute left-6 right-6 h-[71px] bg-white/80 backdrop-blur-md rounded-[35px] flex-row items-center justify-between px-[34px] shadow-lg"
        style={{ bottom: insets.bottom }}
      >
        <TouchableOpacity
          className=" items-center justify-center h-full"
          onPress={() => {
            if (selectedTab !== "home") {
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
          onPress={() => {
            setSelectedTab("settings");
            router.push("/settings");
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
    </SafeAreaView>
  );
}

export default Footer;