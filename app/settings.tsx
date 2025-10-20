import { icons } from "@/consonants";
import Footer from "@/components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Alert,
  Linking,
  Share,
} from "react-native";
import { useLanguage } from "@/components/LanguageContext";
import DropdownLanguageSwitch from '@/components/DropdownLanguageSwitch';
import ResetImg from '@/assets/icons/Reset.png';
import FeedbackImg from '@/assets/icons/send.png';
import RecommendImg from '@/assets/icons/share.png';
import arrowRight from '@/assets/icons/arrow_right.png';  
import { Audio } from 'expo-av';

const orange = "#FF6B35";

export default function Index() {
  const router = useRouter();
  const [currentLesson, setCurrentLesson] = useState({
    lessonKey: "alifBa",
    letter: "ا ب",
    index: 1,
  });
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [sound, setSound] = useState();

  const { t } = useLanguage();

  // Загрузка звукового файла
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Функция для воспроизведения звука
  const playSound = async () => {
    if (!isSoundEnabled) return;
    
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/audios/click.mp3')
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  };

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
        await playSound();
      }
    } catch (error) {
      console.error("Error saving sound setting:", error);
    }
  };

  const handleResetResults = async () => {
    await playSound();
    Alert.alert(
      t('resetConfirmationTitle') || "Reset Progress",
      t('resetConfirmationMessage') || "Are you sure you want to reset all your progress? This action cannot be undone.",
      [
        {
          text: t('cancel') || "Cancel",
          style: "cancel",
          onPress: async () => await playSound()
        },
        { 
          text: t('reset') || "Reset", 
          onPress: async () => {
            await playSound();
            try {
              const keys = await AsyncStorage.getAllKeys();
              
              const keysToKeep = ['soundEnabled', 'language'];
              
              const keysToRemove = keys.filter(key => !keysToKeep.includes(key));
              
              await AsyncStorage.multiRemove(keysToRemove);
              
              const initialLesson = {
                lessonKey: "alifBa",
                letter: "ا ب",
                index: 1,
              };
              setCurrentLesson(initialLesson);
              await AsyncStorage.setItem("currentLesson", JSON.stringify(initialLesson));
              
              Alert.alert(
                t('resetSuccessTitle') || "Success",
                t('resetSuccessMessage') || "Your progress has been reset successfully."
              );
            } catch (error) {
              console.error("Error resetting data:", error);
              Alert.alert(
                t('error') || "Error",
                t('resetErrorMessage') || "An error occurred while resetting your progress."
              );
            }
          }
        }
      ]
    );
  };

  const handleSendFeedback = async () => {
    await playSound();
    try {
      const email = 'support@yourapp.com';
      const subject = encodeURIComponent(t('feedbackEmailSubject') || 'Feedback for Arabic Learning App');
      const body = encodeURIComponent(t('feedbackEmailBody') || 'I would like to share the following feedback:');
      
      const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
      
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          t('emailNotAvailableTitle') || "Email Not Available",
          t('emailNotAvailableMessage') || `Please send your feedback to: ${email}`,
          [
            {
              text: t('ok') || "OK",
              style: "cancel",
              onPress: async () => await playSound()
            }
          ]
        );
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
      Alert.alert(
        t('error') || "Error",
        t('feedbackErrorMessage') || "An error occurred while trying to send feedback."
      );
    }
  };

  const handleRecommend = async () => {
    await playSound();
    try {
      const message = t('recommendMessage') || "Check out this great app for learning Arabic!";
      const url = '#'; // наш url приложения
      
      const result = await Share.share({
        message: `${message} ${url}`,
        title: t('recommendApp') || 'Recommend App',
      });
      
      if (result.action === Share.dismissedAction) {
        console.log("Sharing was dismissed");
      }
    } catch (error) {
      console.error("Error sharing app:", error);
      Alert.alert(
        t('error') || "Error",
        t('shareErrorMessage') || "An error occurred while trying to share the app."
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
            {t('settings') || "Settings"}
          </Text>
          <View className="h-1 w-16 bg-orange-500 rounded-full self-center mt-2" />
        </View>

        {/* Language Setting */}
        <View className="mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <Text className="main-font text-[16px] font-semibold mb-3 text-gray-900">
            {t('language') || "Language"}
          </Text>
          <DropdownLanguageSwitch />
        </View>

        {/* Sound Setting */}
        <View className="flex-row items-center justify-between mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <View className="flex-1">
            <Text className="main-font text-[16px] font-semibold text-gray-900 mb-1">
              {t('sound') || "Sound"}
            </Text>
            <Text className="main-font text-[14px] text-gray-600">
              {t('soundDescription') || "Enable or disable sound effects"}
            </Text>
          </View>
          <Switch
            value={isSoundEnabled}
            onValueChange={toggleSound}
            trackColor={{ false: "#E5E7EB", true: "#FF6B35" }}
            thumbColor={"#FFFFFF"}
          />
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
                  {t('resetResults') || "Reset Progress"}
                </Text>
                <Text className="main-font text-[13px] text-gray-600 mt-1">
                  {t('resetDescription') || "Clear all your learning progress"}
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
                  {t('sendFeedback') || "Send Feedback"}
                </Text>
                <Text className="main-font text-[13px] text-gray-600 mt-1">
                  {t('feedbackDescription') || "Share your thoughts with us"}
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
                  {t('recommend') || "Recommend App"}
                </Text>
                <Text className="main-font text-[13px] text-gray-600 mt-1">
                  {t('recommendDescription') || "Share with friends and family"}
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

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
});