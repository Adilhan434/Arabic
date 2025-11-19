import arrowRight from "@/assets/icons/arrow_right.png";
import ResetImg from "@/assets/icons/Reset.png";
import FeedbackImg from "@/assets/icons/send.png";
import RecommendImg from "@/assets/icons/share.png";
import DropdownLanguageSwitch from "@/components/DropdownLanguageSwitch";
import Footer from "@/components/Footer";
import { useLanguage } from "@/components/LanguageContext";
import {
  getNotificationStatus,
  sendTestNotification,
  setNotificationStatus,
} from "@/utils/notificationUtils";
import { playInterfaceSound } from "@/utils/soundUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Share,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const [currentLesson, setCurrentLesson] = useState({
    lessonKey: "alifBa",
    letter: "ا ب",
    index: 1,
  });
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  const { t } = useLanguage();

  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        try {
          const savedLesson = await AsyncStorage.getItem("currentLesson");
          if (savedLesson) {
            const parsed = JSON.parse(savedLesson);
            setCurrentLesson(parsed);
          }

          const soundSetting = await AsyncStorage.getItem("soundEnabled");
          if (soundSetting !== null) {
            setIsSoundEnabled(JSON.parse(soundSetting));
          }

          const notificationStatus = await getNotificationStatus();
          setIsNotificationsEnabled(notificationStatus);
        } catch (error) {
          console.error("Error loading settings:", error);
        }
      };

      loadSettings();
    }, [])
  );

  const toggleSound = async () => {
    const newValue = !isSoundEnabled;
    setIsSoundEnabled(newValue);
    try {
      await AsyncStorage.setItem("soundEnabled", JSON.stringify(newValue));

      if (newValue) {
        await playInterfaceSound();
      }
    } catch (error) {
      console.error("Error saving sound setting:", error);
    }
  };

  const toggleNotifications = async () => {
    const newValue = !isNotificationsEnabled;
    setIsNotificationsEnabled(newValue);
    try {
      await setNotificationStatus(newValue);
      await playInterfaceSound();

      if (newValue) {
        Alert.alert(
          t("notifications") || "Notifications",
          t("notificationsEnabled") ||
            "Daily reminders are now enabled. You will receive motivational messages to continue learning.",
          [
            {
              text: t("ok") || "OK",
              onPress: async () => await playInterfaceSound(),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error saving notification setting:", error);
    }
  };

  const handleTestNotification = async () => {
    await playInterfaceSound();
    try {
      await sendTestNotification();
      Alert.alert(
        t("notifications") || "Notifications",
        "Test notification will appear in a moment! 🔔",
        [
          {
            text: t("ok") || "OK",
            onPress: async () => await playInterfaceSound(),
          },
        ]
      );
    } catch (error) {
      console.error("Error sending test notification:", error);
      Alert.alert(t("error") || "Error", "Failed to send test notification.", [
        {
          text: t("ok") || "OK",
          onPress: async () => await playInterfaceSound(),
        },
      ]);
    }
  };

  const handleResetResults = async () => {
    await playInterfaceSound();
    Alert.alert(
      t("resetConfirmationTitle") || "Reset Progress",
      t("resetConfirmationMessage") ||
        "Are you sure you want to reset all your progress? This action cannot be undone.",
      [
        {
          text: t("cancel") || "Cancel",
          style: "cancel",
          onPress: async () => await playInterfaceSound(),
        },
        {
          text: t("reset") || "Reset",
          onPress: async () => {
            await playInterfaceSound();
            try {
              const keys = await AsyncStorage.getAllKeys();

              const keysToKeep = ["soundEnabled", "language"];

              const keysToRemove = keys.filter(
                (key) => !keysToKeep.includes(key)
              );

              await AsyncStorage.multiRemove(keysToRemove);

              const initialLesson = {
                lessonKey: "alifBa",
                letter: "ا ب",
                index: 1,
              };
              setCurrentLesson(initialLesson);
              await AsyncStorage.setItem(
                "currentLesson",
                JSON.stringify(initialLesson)
              );

              Alert.alert(
                t("resetSuccessTitle") || "Success",
                t("resetSuccessMessage") ||
                  "Your progress has been reset successfully."
              );
            } catch (error) {
              console.error("Error resetting data:", error);
              Alert.alert(
                t("error") || "Error",
                t("resetErrorMessage") ||
                  "An error occurred while resetting your progress."
              );
            }
          },
        },
      ]
    );
  };

  const handleSendFeedback = async () => {
    await playInterfaceSound();
    try {
      const email = "support@yourapp.com";
      const subject = encodeURIComponent(
        t("feedbackEmailSubject") || "Feedback for Arabic Learning App"
      );
      const body = encodeURIComponent(
        t("feedbackEmailBody") ||
          "I would like to share the following feedback:"
      );

      const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

      const canOpen = await Linking.canOpenURL(mailtoUrl);

      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          t("emailNotAvailableTitle") || "Email Not Available",
          t("emailNotAvailableMessage") ||
            `Please send your feedback to: ${email}`,
          [
            {
              text: t("ok") || "OK",
              style: "cancel",
              onPress: async () => await playInterfaceSound(),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
      Alert.alert(
        t("error") || "Error",
        t("feedbackErrorMessage") ||
          "An error occurred while trying to send feedback."
      );
    }
  };

  const handleRecommend = async () => {
    await playInterfaceSound();
    try {
      const message =
        t("recommendMessage") ||
        "Check out this great app for learning Arabic!";
      const url = "#"; // наш url приложения

      const result = await Share.share({
        message: `${message} ${url}`,
        title: t("recommendApp") || "Recommend App",
      });

      if (result.action === Share.dismissedAction) {
        console.log("Sharing was dismissed");
      }
    } catch (error) {
      console.error("Error sharing app:", error);
      Alert.alert(
        t("error") || "Error",
        t("shareErrorMessage") ||
          "An error occurred while trying to share the app."
      );
    }
  };

  return (
    <View className="flex-1 items-center justify-center pb-[50px] bg-primary">
      {/* Settings Card */}
      <View className="bg-white w-[90%] max-w-[400px] mt-6 rounded-3xl px-6 py-8 shadow-lg">
        {/* Header */}
        <View className="mb-2">
          <Text className="main-font text-[24px] font-bold text-gray-900 text-center">
            {t("settings") || "Settings"}
          </Text>
          <View className="h-1 w-16 bg-orange-500 rounded-full self-center mt-2" />
        </View>

        {/* Language Setting */}
        <View className="mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <Text className="main-font text-[16px] font-semibold mb-3 text-gray-900">
            {t("language") || "Language"}
          </Text>
          <DropdownLanguageSwitch />
        </View>

        {/* Sound Setting */}
        <View className="flex-row items-center justify-between mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <View className="flex-1">
            <Text className="main-font text-[16px] font-semibold text-gray-900 mb-1">
              {t("sound") || "Sound"}
            </Text>
            <Text className="main-font text-[14px] text-gray-600">
              {t("soundDescription") || "Enable or disable sound effects"}
            </Text>
          </View>
          <Switch
            value={isSoundEnabled}
            onValueChange={toggleSound}
            trackColor={{ false: "#E5E7EB", true: "#FF6B35" }}
            thumbColor={"#FFFFFF"}
          />
        </View>

        {/* Notifications Setting */}
        <View className="mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-1">
              <Text className="main-font text-[16px] font-semibold text-gray-900 mb-1">
                {t("notifications") || "Notifications"}
              </Text>
              <Text className="main-font text-[14px] text-gray-600">
                {t("notificationsDescription") || "Daily reminders to learn"}
              </Text>
            </View>
            <Switch
              value={isNotificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: "#E5E7EB", true: "#FF6B35" }}
              thumbColor={"#FFFFFF"}
            />
          </View>

          {/* Test Notification Button */}
          {isNotificationsEnabled && (
            <TouchableOpacity
              className="bg-orange-500 rounded-xl py-3 px-4 mt-2"
              onPress={handleTestNotification}
            >
              <Text className="main-font text-[14px] font-semibold text-white text-center">
                🔔 Test Notification
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons Container */}
        <View className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
          {/* Reset Progress */}
          <TouchableOpacity
            className="flex-row items-center justify-between py-5 px-4 active:bg-gray-100"
            onPress={handleResetResults}
          >
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center mr-3">
                <Image source={ResetImg} className="w-5 h-5 opacity-80" />
              </View>
              <View className="flex-1">
                <Text className="main-font text-[16px] font-semibold text-gray-900">
                  {t("resetResults") || "Reset Progress"}
                </Text>
                <Text className="main-font text-[13px] text-gray-600 mt-1">
                  {t("resetDescription") || "Clear all your learning progress"}
                </Text>
              </View>
            </View>
            <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center">
              <Image
                source={arrowRight}
                className="w-3 h-3"
                style={{ tintColor: "#6B7280" }}
              />
            </View>
          </TouchableOpacity>

          {/* Divider */}
          <View className="h-[1px] bg-gray-200 mx-4" />

          {/* Send Feedback */}
          <TouchableOpacity
            className="flex-row items-center justify-between py-5 px-4 active:bg-gray-100"
            onPress={handleSendFeedback}
          >
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3">
                <Image source={FeedbackImg} className="w-5 h-5 opacity-80" />
              </View>
              <View className="flex-1">
                <Text className="main-font text-[16px] font-semibold text-gray-900">
                  {t("sendFeedback") || "Send Feedback"}
                </Text>
                <Text className="main-font text-[13px] text-gray-600 mt-1">
                  {t("feedbackDescription") || "Share your thoughts with us"}
                </Text>
              </View>
            </View>
            <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center">
              <Image
                source={arrowRight}
                className="w-3 h-3"
                style={{ tintColor: "#6B7280" }}
              />
            </View>
          </TouchableOpacity>

          {/* Divider */}
          <View className="h-[1px] bg-gray-200 mx-4" />

          {/* Recommend App */}
          <TouchableOpacity
            className="flex-row items-center justify-between py-5 px-4 active:bg-gray-100"
            onPress={handleRecommend}
          >
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-green-50 rounded-xl items-center justify-center mr-3">
                <Image source={RecommendImg} className="w-5 h-5 opacity-80" />
              </View>
              <View className="flex-1">
                <Text className="main-font text-[16px] font-semibold text-gray-900">
                  {t("recommend") || "Recommend App"}
                </Text>
                <Text className="main-font text-[13px] text-gray-600 mt-1">
                  {t("recommendDescription") || "Share with friends and family"}
                </Text>
              </View>
            </View>
            <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center">
              <Image
                source={arrowRight}
                className="w-3 h-3"
                style={{ tintColor: "#6B7280" }}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <Footer />
    </View>
  );
}
