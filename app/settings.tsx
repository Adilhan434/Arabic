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
        require('@/assets/audios/click.mp3') // Создайте этот файл или используйте другой
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
      
      // Воспроизвести звук при переключении, только если включаем звук
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
    <View className="flex-1 items-center justify-center pb-[100px] bg-primary">
      {/* book and welcome text */}
      <View className="relative flex items-center w-[345px] h-[347px]">
        <Image source={icons.main} className="w-[172px] h-[172px]" />
        <View className="relative -top-6">
          <View
            className="absolute w-[345px] h-[189px] bg-black/25 rounded-[38px]"
            style={{
              top: 10,
              left: 10,
              zIndex: 1,
            }}
          />
          <View
            style={[styles.shadow, { borderRadius: 38, zIndex: 2 }]}
            className="w-[345px] h-[189px] justify-around items-center overflow-hidden relative"
          >
            <LinearGradient
              colors={[orange, "#0B503D"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
            <Text className="font-['Seymour One'] mt-3 text-secondary font-normal text-[51px]">
              {t('mainArabic')}
            </Text>
            <Text className="main-font text-center mb-[23px] text-secondary text-[20px]">
              {t('mainEnglish')}
            </Text>
          </View>
        </View>
      </View>
      
      <View className="mt-3 w-[345px] bg-white rounded-[25px] px-4">
        <DropdownLanguageSwitch />
        
        <View className="flex-row items-center justify-between ml-4 items-center py-4">
          <Text className="text-[21px] font-semibold">{t('sound')}</Text>
          <Switch
            value={isSoundEnabled}
            onValueChange={toggleSound}
            trackColor={{ false: "#767577", true: orange }}
            thumbColor={isSoundEnabled ? "#FF6B35" : "#f4f3f4"}
          />
        </View>
        <Text className="text-[23px] ml-4 font-bold pb-[15px]">
          {t('general') }
        </Text>
        
        <TouchableOpacity 
          className="flex-row items-center justify-between pr-1"
          onPress={handleResetResults}
        >
          <View className="flex-row items-center ml-4">
            <Image source={ResetImg} className="w-6 h-6 mr-3" />
            <Text className="text-[21px] font-semibold">{t('resetResults')}</Text>
          </View>
          <Image 
            source={arrowRight} 
            className="w-5 h-5" 
            style={{ tintColor: orange }} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-row items-center justify-between py-4 pr-1"
          onPress={handleSendFeedback}
        >
          <View className="flex-row items-center ml-4">
            <Image source={FeedbackImg} className="w-6 h-6 mr-3" />
            <Text className="text-[21px] font-semibold">{t('sendFeedback')}</Text>
          </View>
          <Image 
            source={arrowRight} 
            className="w-5 h-5" 
            style={{ tintColor: orange }} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-row items-center justify-between pb-4 pr-1"
          onPress={handleRecommend}
        >
          <View className="flex-row items-center ml-4">
            <Image source={RecommendImg} className="w-6 h-6 mr-3" />
            <Text className="text-[21px] font-semibold">{t('recommend')}</Text>
          </View>
          <Image 
            source={arrowRight} 
            className="w-5 h-5" 
            style={{ tintColor: orange }} 
          />
        </TouchableOpacity>
      </View>
      
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000000",
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  activeButton: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});