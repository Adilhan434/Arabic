import Footer from "@/components/Footer";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Settings = () => {
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-[24px] font-bold">Settings</Text>
        <Text className="text-white text-[16px] mt-4">Coming soon...</Text>
      </View>
      <Footer />
    </SafeAreaView>
  );
};

export default Settings;
