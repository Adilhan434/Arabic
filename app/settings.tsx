import arrowRight from "@/assets/icons/arrow_right.png";
import ResetImg from "@/assets/icons/Reset.png";
import FeedbackImg from "@/assets/icons/send.png";
import RecommendImg from "@/assets/icons/share.png";
import DropdownLanguageSwitch from "@/components/DropdownLanguageSwitch";
import { useLanguage } from "@/components/LanguageContext";
import { useTheme } from "@/components/ThemeContext";
import {
  getNotificationStatus,
  sendTestNotification,
  setNotificationStatus,
} from "@/utils/notificationUtils";
import { playInterfaceSound } from "@/utils/soundUtils";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  Share,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const colors = theme.colors;
  const [currentLesson, setCurrentLesson] = useState({
    lessonKey: "alifBa",
    letter: "ا ب",
    index: 1,
  });
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={colors.background} 
      />
      
      {/* Header */}
      <View style={{ 
        paddingHorizontal: 16, 
        paddingVertical: 16, 
        backgroundColor: colors.card, 
        borderBottomWidth: 1, 
        borderBottomColor: colors.cardBorder 
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={async () => {
              await playInterfaceSound();
              router.push("/");
            }}
            style={{ 
              marginRight: 12, 
              padding: 8, 
              borderRadius: 20, 
              backgroundColor: colors.background 
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.font} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.font, flex: 1 }}>
            {t("settings")}
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16, paddingBottom: 24 }}>

        {/* Language Card */}
        <View style={{ 
          backgroundColor: colors.card, 
          borderRadius: 16, 
          padding: 20, 
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 4, height: 20, backgroundColor: colors.accent, borderRadius: 2, marginRight: 8 }} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.fontSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
              {t("language")}
            </Text>
          </View>
          <DropdownLanguageSwitch />
        </View>

        {/* Toggles Card */}
        <View style={{ 
          backgroundColor: colors.card, 
          borderRadius: 16, 
          padding: 20, 
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}>
          {/* Theme Toggle */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            paddingBottom: 16, 
            borderBottomWidth: 1, 
            borderBottomColor: colors.cardBorder 
          }}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.font, marginBottom: 4 }}>
                {t("theme")}
              </Text>
              <Text style={{ fontSize: 14, color: colors.fontSecondary }}>
                {t("themeDescription")}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={async () => {
                await playInterfaceSound();
                await toggleTheme();
              }}
              trackColor={{ false: "#E5E7EB", true: colors.accent }}
              thumbColor={"#FFFFFF"}
              ios_backgroundColor="#E5E7EB"
            />
          </View>

          {/* Sound Toggle */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            paddingTop: 16,
            paddingBottom: 16, 
            borderBottomWidth: 1, 
            borderBottomColor: colors.cardBorder 
          }}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.font, marginBottom: 4 }}>
                {t("sound")}
              </Text>
              <Text style={{ fontSize: 14, color: colors.fontSecondary }}>
                {t("soundDescription")}
              </Text>
            </View>
            <Switch
              value={isSoundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: "#E5E7EB", true: colors.accent }}
              thumbColor={"#FFFFFF"}
              ios_backgroundColor="#E5E7EB"
            />
          </View>

          {/* Notifications Toggle */}
          <View style={{ paddingTop: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.font, marginBottom: 4 }}>
                  {t("notifications")}
                </Text>
                <Text style={{ fontSize: 14, color: colors.fontSecondary }}>
                  {t("notificationsDescription")}
                </Text>
              </View>
              <Switch
                value={isNotificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: "#E5E7EB", true: colors.accent }}
                thumbColor={"#FFFFFF"}
                ios_backgroundColor="#E5E7EB"
              />
            </View>

            {/* Test Notification Button */}
            {isNotificationsEnabled && (
              <TouchableOpacity
                style={{
                  backgroundColor: colors.accent,
                  borderRadius: 12,
                  paddingVertical: 12,
                  marginTop: 16,
                }}
                onPress={handleTestNotification}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.font, textAlign: 'center' }}>
                  🔔 Test Notification
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Actions Card */}
        <View style={{ 
          backgroundColor: colors.card, 
          borderRadius: 16, 
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}>
          {/* Reset Progress */}
          <TouchableOpacity
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              padding: 16, 
              borderBottomWidth: 1, 
              borderBottomColor: colors.cardBorder 
            }}
            onPress={handleResetResults}
            activeOpacity={0.7}
          >
            <View style={{ 
              width: 48, 
              height: 48, 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: 24, 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginRight: 16 
            }}>
              <Image source={ResetImg} style={{ width: 24, height: 24 }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.font, marginBottom: 4 }}>
                {t("resetResults")}
              </Text>
              <Text style={{ fontSize: 14, color: colors.fontSecondary }}>
                {t("resetDescription")}
              </Text>
            </View>
            <Image
              source={arrowRight}
              style={{ width: 20, height: 20, tintColor: colors.fontLight }}
            />
          </TouchableOpacity>

          {/* Send Feedback */}
          <TouchableOpacity
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              padding: 16, 
              borderBottomWidth: 1, 
              borderBottomColor: colors.cardBorder 
            }}
            onPress={handleSendFeedback}
            activeOpacity={0.7}
          >
            <View style={{ 
              width: 48, 
              height: 48, 
              backgroundColor: 'rgba(59, 130, 246, 0.1)', 
              borderRadius: 24, 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginRight: 16 
            }}>
              <Image source={FeedbackImg} style={{ width: 24, height: 24 }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.font, marginBottom: 4 }}>
                {t("sendFeedback")}
              </Text>
              <Text style={{ fontSize: 14, color: colors.fontSecondary }}>
                {t("feedbackDescription")}
              </Text>
            </View>
            <Image
              source={arrowRight}
              style={{ width: 20, height: 20, tintColor: colors.fontLight }}
            />
          </TouchableOpacity>

          {/* Recommend App */}
          <TouchableOpacity
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              padding: 16 
            }}
            onPress={handleRecommend}
            activeOpacity={0.7}
          >
            <View style={{ 
              width: 48, 
              height: 48, 
              backgroundColor: 'rgba(34, 197, 94, 0.1)', 
              borderRadius: 24, 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginRight: 16 
            }}>
              <Image source={RecommendImg} style={{ width: 24, height: 24 }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.font, marginBottom: 4 }}>
                {t("recommend")}
              </Text>
              <Text style={{ fontSize: 14, color: colors.fontSecondary }}>
                {t("recommendDescription")}
              </Text>
            </View>
            <Image
              source={arrowRight}
              style={{ width: 20, height: 20, tintColor: colors.fontLight }}
            />
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
