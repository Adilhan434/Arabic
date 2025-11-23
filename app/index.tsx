import { useLanguage } from "@/components/LanguageContext";
import { useTheme } from "@/components/ThemeContext";
import { icons } from "@/consonants.js";
import { getTodayHadith } from "@/hadiths";
import { getCurrentScene, getLessonProgress } from "@/utils/lessonProgress";
import { playInterfaceSound } from "@/utils/soundUtils";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL_SCREEN = SCREEN_WIDTH < 375 || SCREEN_HEIGHT < 700; // iPhone SE and similar

export default function Index() {
  const router = useRouter();
  const { theme } = useTheme();
  const [currentLesson, setCurrentLesson] = useState({
    lessonKey: "alifBa",
    letter: "ا ب",
    index: 1,
  });
  const [lessonProgress, setLessonProgress] = useState(0);
  const [currentScene, setCurrentScene] = useState(1);
  const hadith = getTodayHadith();
  const totalScenesPerLesson = 15; // fixed scenes per lesson
  const { t } = useLanguage();

  const progressPercent =
    lessonProgress >= totalScenesPerLesson
      ? 100
      : Math.round((lessonProgress / totalScenesPerLesson) * 100);

  function progressTagline(p: number) {
    if (p === 100) return t("100%");
    if (p >= 70) return t("70%+");
    if (p >= 40) return t("40%+");
    if (p > 0) return t("0%+");
    return t("not_started");
  }

  // Загружаем сохраненный прогресс при загрузке экрана
  useFocusEffect(
    useCallback(() => {
      const loadCurrentLesson = async () => {
        try {
          const savedLesson = await AsyncStorage.getItem("currentLesson");
          if (savedLesson) {
            const parsed = JSON.parse(savedLesson);
            setCurrentLesson(parsed);

            // Загружаем прогресс урока
            const progress = await getLessonProgress(parsed.lessonKey);
            const scene = await getCurrentScene(parsed.lessonKey);
            setLessonProgress(progress);
            setCurrentScene(scene);
          }
        } catch (error) {
          console.error("Error loading current lesson:", error);
        }
      };

      loadCurrentLesson();
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      
      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: IS_SMALL_SCREEN ? 16 : 24 }}
      >
        {/* Logo and Title Section */}
        <View style={{ alignItems: 'center', paddingTop: IS_SMALL_SCREEN ? 16 : 24, paddingBottom: IS_SMALL_SCREEN ? 12 : 20 }}>
          <Image 
            source={icons.main} 
            style={{ width: IS_SMALL_SCREEN ? 60 : 80, height: IS_SMALL_SCREEN ? 60 : 80, marginBottom: IS_SMALL_SCREEN ? 8 : 12 }} 
          />
          <Text style={{ 
            fontSize: IS_SMALL_SCREEN ? 24 : 32, 
            fontWeight: 'bold', 
            color: theme.colors.font,
            marginBottom: 4
          }}>
            Arabic Learning
          </Text>
          
          {/* Settings Button - positioned at top right */}
          <TouchableOpacity
            onPress={async () => {
              await playInterfaceSound();
              router.push("/settings");
            }}
            style={{ 
              position: 'absolute',
              right: 16,
              top: IS_SMALL_SCREEN ? 16 : 24,
              width: IS_SMALL_SCREEN ? 36 : 44, 
              height: IS_SMALL_SCREEN ? 36 : 44, 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRadius: IS_SMALL_SCREEN ? 18 : 22, 
              backgroundColor: theme.colors.card,
              ...styles.cardShadow
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={IS_SMALL_SCREEN ? 20 : 24} color={theme.colors.font} />
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: IS_SMALL_SCREEN ? 12 : 16 }}>

        {/* Daily Hadith Card */}
        <View
          style={{ 
            ...styles.cardShadow, 
            backgroundColor: theme.colors.card, 
            borderRadius: IS_SMALL_SCREEN ? 12 : 16, 
            padding: IS_SMALL_SCREEN ? 14 : 20, 
            marginBottom: IS_SMALL_SCREEN ? 12 : 16 
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: IS_SMALL_SCREEN ? 8 : 12 }}>
            <View style={{ width: 4, height: IS_SMALL_SCREEN ? 16 : 20, backgroundColor: theme.colors.accent, borderRadius: 2, marginRight: 8 }} />
            <Text style={{ 
              fontSize: IS_SMALL_SCREEN ? 10 : 12, 
              fontWeight: '600', 
              color: theme.colors.fontSecondary, 
              textTransform: 'uppercase', 
              letterSpacing: 1 
            }}>
              {t("hadithOfTheDay")}
            </Text>
          </View>
          <Text style={{ 
            fontSize: IS_SMALL_SCREEN ? 16 : 20, 
            fontFamily: 'Seymour One', 
            color: theme.colors.font, 
            marginBottom: IS_SMALL_SCREEN ? 6 : 8, 
            textAlign: 'center',
            lineHeight: IS_SMALL_SCREEN ? 24 : 30
          }}>
            {hadith.arabic}
          </Text>
          <Text style={{ 
            fontSize: IS_SMALL_SCREEN ? 12 : 14, 
            color: theme.colors.fontSecondary, 
            textAlign: 'center', 
            marginBottom: IS_SMALL_SCREEN ? 6 : 8,
            lineHeight: IS_SMALL_SCREEN ? 16 : 20
          }}>
            {hadith.english}
          </Text>
          <View style={{ alignItems: 'center', paddingTop: IS_SMALL_SCREEN ? 6 : 8, borderTopWidth: 1, borderTopColor: theme.colors.cardBorder }}>
            <Text style={{ fontSize: IS_SMALL_SCREEN ? 10 : 12, color: theme.colors.fontLight, fontStyle: 'italic' }}>
              Prophet ﷺ {hadith.source ? `• ${hadith.source}` : ""}
            </Text>
          </View>
        </View>

        {/* Current Lesson Card */}
        <View
          style={{ 
            ...styles.cardShadow, 
            backgroundColor: theme.colors.card, 
            borderRadius: IS_SMALL_SCREEN ? 12 : 16, 
            padding: IS_SMALL_SCREEN ? 14 : 20, 
            marginBottom: IS_SMALL_SCREEN ? 12 : 16 
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: IS_SMALL_SCREEN ? 8 : 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: IS_SMALL_SCREEN ? 10 : 12, 
                fontWeight: '600', 
                color: theme.colors.fontSecondary, 
                textTransform: 'uppercase', 
                letterSpacing: 1, 
                marginBottom: 4 
              }}>
                Current Lesson
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <Text style={{ fontSize: IS_SMALL_SCREEN ? 20 : 24, fontWeight: 'bold', color: theme.colors.font }}>
                  {t("lesson")} {currentLesson.index}
                </Text>
                <Text style={{ fontSize: IS_SMALL_SCREEN ? 18 : 20, fontWeight: 'bold', color: theme.colors.font, marginLeft: 8 }}>
                  {currentLesson.letter}
                </Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: IS_SMALL_SCREEN ? 10 : 12, color: theme.colors.fontSecondary, marginBottom: 4 }}>Progress</Text>
              <Text style={{ fontSize: IS_SMALL_SCREEN ? 20 : 24, fontWeight: 'bold', color: theme.colors.accent }}>
                {progressPercent}%
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={{ marginBottom: IS_SMALL_SCREEN ? 12 : 16 }}>
            <ProgressBar percent={progressPercent} theme={theme} />
            <Text style={{ fontSize: IS_SMALL_SCREEN ? 10 : 12, color: theme.colors.fontLight, marginTop: 4 }}>
              {progressTagline(progressPercent)}
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={{ 
              backgroundColor: theme.colors.accent, 
              borderRadius: IS_SMALL_SCREEN ? 10 : 12, 
              paddingVertical: IS_SMALL_SCREEN ? 12 : 16, 
              alignItems: 'center' 
            }}
            onPress={async () => {
              await playInterfaceSound();
              router.push(`/lesson/${currentLesson.lessonKey}/${currentScene}`);
            }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: IS_SMALL_SCREEN ? 16 : 18, fontWeight: 'bold', color: theme.colors.font }}>
              {t("continue")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={async () => {
              await playInterfaceSound();
              router.push("/alphabet");
            }}
            style={{ 
              ...styles.cardShadow, 
              flex: 1, 
              marginRight: IS_SMALL_SCREEN ? 6 : 8, 
              backgroundColor: theme.colors.card, 
              borderRadius: IS_SMALL_SCREEN ? 12 : 16, 
              padding: IS_SMALL_SCREEN ? 12 : 16, 
              alignItems: 'center' 
            }}
            activeOpacity={0.7}
          >
            <Image source={icons.book} style={{ width: IS_SMALL_SCREEN ? 32 : 40, height: IS_SMALL_SCREEN ? 32 : 40, marginBottom: IS_SMALL_SCREEN ? 6 : 8 }} />
            <Text style={{ fontSize: IS_SMALL_SCREEN ? 12 : 14, fontWeight: '600', color: theme.colors.font, textAlign: 'center' }}>
              {t("alphabet")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              await playInterfaceSound();
              try {
                const lessonData = {
                  lessonKey: "alifBa",
                  letter: "ا ب",
                  index: 1,
                };
                await AsyncStorage.setItem(
                  "currentLesson",
                  JSON.stringify(lessonData)
                );
                setCurrentLesson(lessonData);
                router.push("/allLessons");
              } catch (error) {
                console.error("Error saving lesson:", error);
                router.push("/allLessons");
              }
            }}
            style={{ 
              ...styles.cardShadow, 
              flex: 1, 
              marginHorizontal: IS_SMALL_SCREEN ? 3 : 4, 
              backgroundColor: theme.colors.card, 
              borderRadius: IS_SMALL_SCREEN ? 12 : 16, 
              padding: IS_SMALL_SCREEN ? 12 : 16, 
              alignItems: 'center' 
            }}
            activeOpacity={0.7}
          >
            <Image style={{ width: IS_SMALL_SCREEN ? 32 : 40, height: IS_SMALL_SCREEN ? 32 : 40, marginBottom: IS_SMALL_SCREEN ? 6 : 8 }} source={icons.all_lessons} />
            <Text style={{ fontSize: IS_SMALL_SCREEN ? 12 : 14, fontWeight: '600', color: theme.colors.font, textAlign: 'center' }}>
              {t("allLessons")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              await playInterfaceSound();
              router.push(`/test/${currentLesson.lessonKey}/1` as any);
            }}
            style={{ 
              ...styles.cardShadow, 
              flex: 1, 
              marginLeft: IS_SMALL_SCREEN ? 6 : 8, 
              backgroundColor: theme.colors.card, 
              borderRadius: IS_SMALL_SCREEN ? 12 : 16, 
              padding: IS_SMALL_SCREEN ? 12 : 16, 
              alignItems: 'center' 
            }}
            activeOpacity={0.7}
          >
            <Image style={{ width: IS_SMALL_SCREEN ? 32 : 40, height: IS_SMALL_SCREEN ? 32 : 40, marginBottom: IS_SMALL_SCREEN ? 6 : 8 }} source={icons.approval} />
            <Text style={{ fontSize: IS_SMALL_SCREEN ? 12 : 14, fontWeight: '600', color: theme.colors.font, textAlign: 'center' }}>
              {t("tests")}
            </Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
//             </Text>
//             <Text className="main-font text-center text-secondary text-[11px] px-1">
//               {hadith.english}
//             </Text>
//             <View className="items-center mb-[20px] w-full">
//               <View className="w-[65%] h-[1px] bg-white/40 my-[6px]" />
//               <Text className="main-font text-center text-[#FFE4B5] text-[12px] font-semibold italic tracking-wide">
//                 Prophet ﷺ {hadith.source ? `• ${hadith.source}` : ""}
//               </Text>
//             </View>
//           </View>
//         </View>
//       </View>

//       {/* statistics and actions (restored redesigned version) */}
//       <View className="bg-secondary w-[345px] mt-[22px] rounded-[25px] px-[22px] pt-[18px] pb-[22px] min-h-[265px] flex justify-between">
//         {/* progress + continue */}
//         <View className="flex-row justify-between items-start">
//           <View className="flex flex-col" style={{ maxWidth: 170 }}>
//             <View className="flex-row flex-wrap items-end">
//               <Text className="main-font text-[18px] font-semibold leading-[22px]">
//                 {t("lesson")} {currentLesson.index}:
//               </Text>
//               <Text className="main-font text-[18px] font-semibold leading-[22px] ml-1">
//                 {currentLesson.letter}
//               </Text>
//             </View>
//             <View className="flex-row items-center mt-[6px]">
//               <ProgressBar percent={progressPercent} />
//               <Text className="main-font text-[11px] font-medium text-gray-600 ml-2">
//                 {progressPercent}%
//               </Text>
//             </View>
//             <View className="mt-[10px]">
//               <Text className="main-font text-[10px] mt-[8px] text-gray-400 tracking-wide">
//                 {progressTagline(progressPercent)}
//               </Text>
//             </View>
//           </View>
//           <Pressable
//             className="bg-orange rounded-[32px] px-[20px] h-[44px] items-center justify-center"
//             onPress={async () => {
//               await playInterfaceSound();
//               router.push(`/lesson/${currentLesson.lessonKey}/${currentScene}`);
//             }}
//           >
//             <Text className="text-white font-semibold text-[16px] main-font">
//               {t("continue")}
//             </Text>
//           </Pressable>
//         </View>

//         {/* actions */}
//         <View className="mt-[20px] mb-[4px]">
//           <View className="flex-row justify-between">
//             <Pressable
//               onPress={async () => {
//                 await playInterfaceSound();
//                 router.push("/alphabet");
//               }}
//               className="w-[95px] h-[88px] bg-orange/95 rounded-[18px] justify-center items-center"
//             >
//               <Image source={icons.book} />
//               <Text className="main-font text-[12px] font-semibold text-secondary mt-[4px]">
//                 {t("alphabet")}
//               </Text>
//             </Pressable>

//             <TouchableOpacity
//               onPress={async () => {
//                 await playInterfaceSound();
//                 try {
//                   const lessonData = {
//                     lessonKey: "alifBa",
//                     letter: "ا ب",
//                     index: 1,
//                   };
//                   await AsyncStorage.setItem(
//                     "currentLesson",
//                     JSON.stringify(lessonData)
//                   );
//                   setCurrentLesson(lessonData);
//                   router.push("/allLessons");
//                 } catch (error) {
//                   console.error("Error saving lesson:", error);
//                   router.push("/allLessons");
//                 }
//               }}
//               className="w-[95px] h-[88px] bg-orange/95 rounded-[18px] justify-center items-center"
//             >
//               <Image className="w-[41px] h-[41px]" source={icons.all_lessons} />
//               <Text className="main-font text-[12px] font-semibold text-secondary mt-[4px]">
//                 {t("allLessons")}
//               </Text>
//             </TouchableOpacity>

//             <Pressable
//               onPress={async () => {
//                 await playInterfaceSound();
//                 router.push(`/test/${currentLesson.lessonKey}/1` as any);
//               }}
//               className="w-[95px] h-[88px] bg-orange/95 rounded-[18px] justify-center items-center"
//             >
//               <Image className="w-[41px] h-[41px]" source={icons.approval} />
//               <Text className="main-font text-[12px] font-semibold text-secondary mt-[4px]">
//                 {t("tests")}
//               </Text>
//             </Pressable>
//           </View>
//         </View>
//       </View>
//       <Footer></Footer>
//     </View>
//   );
// }

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});

const ProgressBar: React.FC<{ percent: number; theme: any }> = ({ percent, theme }) => {
  const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <View
      style={{
        width: '100%',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: theme.colors.cardBorder,
      }}
    >
      <View
        style={{ height: '100%', backgroundColor: theme.colors.accent, width: `${safePercent}%` }}
      />
    </View>
  );
};
