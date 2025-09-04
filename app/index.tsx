import Footer from "@/components/Footer";
import { icons } from "@/consonants.js";
import { getTodayHadith } from "@/hadiths";
import { getCurrentScene, getLessonProgress } from "@/utils/lessonProgress";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const orange = "#FF6B35";

export default function Index() {
  const router = useRouter();
  const [currentLesson, setCurrentLesson] = useState({
    lessonKey: "alifBa",
    letter: "ا ب",
    index: 1,
  });
  const [lessonProgress, setLessonProgress] = useState(0);
  const [currentScene, setCurrentScene] = useState(1);
  const hadith = getTodayHadith();
  const totalScenesPerLesson = 15; // fixed scenes per lesson
  const progressPercent = lessonProgress >= totalScenesPerLesson
    ? 100
    : Math.round((lessonProgress / totalScenesPerLesson) * 100);

  function progressTagline(p: number) {
    if (p === 100) return "Ready to revise & teach others.";
    if (p >= 70) return "Strong pace — finish this lesson soon.";
    if (p >= 40) return "Keep building mastery step by step.";
    if (p > 0) return "Great start — consistency wins.";
    return "Begin now — first scene is the doorway.";
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
    <View className="flex-1 items-center justify-center pb-[100px] bg-primary">
      {/* book and welcome text */}
      <View className="relative flex items-center overflow-hidden w-[345px] h-[347px]">
        <Image source={icons.main} className="w-[172px] h-[172px]" />
        <View className="relative -top-6">
          {/* Shadow element for Android offset effect */}
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
            className="w-[345px] h-[189px] justify-around  overflow-hidden relative"
          >
            <LinearGradient
              colors={[orange, "#0B503D"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
            <Text className="font-['Seymour One'] text-center  mt-3 text-secondary font-normal text-[35px] ">
              {hadith.arabic}
            </Text>
            <Text className="main-font text-center text-secondary text-[11px] px-1">
              {hadith.english}
            </Text>
            <View className="items-center mb-[20px] w-full">
              <View className="w-[65%] h-[1px] bg-white/40 my-[6px]" />
              <Text className="main-font text-center text-[#FFE4B5] text-[12px] font-semibold italic tracking-wide">
                Prophet ﷺ {hadith.source ? `• ${hadith.source}` : ""}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* statistics and actions (restored redesigned version) */}
      <View className="bg-secondary w-[345px] mt-[22px] rounded-[25px] px-[22px] pt-[18px] pb-[22px] min-h-[265px] flex justify-between">
        {/* progress + continue */}
        <View className="flex-row justify-between items-start">
          <View className="flex flex-col" style={{maxWidth: 170}}>
            <View className="flex-row flex-wrap items-end">
              <Text className="main-font text-[18px] font-semibold leading-[22px]">
                Lesson {currentLesson.index}:
              </Text>
              <Text className="main-font text-[18px] font-semibold leading-[22px] ml-1">
                {currentLesson.letter}
              </Text>
            </View>
            <View className="flex-row items-center mt-[6px]">
              <ProgressBar percent={progressPercent} />
              <Text className="main-font text-[11px] font-medium text-gray-600 ml-2">
                {progressPercent}%
              </Text>
            </View>
            <View className="mt-[10px]">
              
              <Text className="main-font text-[10px] mt-[8px] text-gray-400 tracking-wide">
                {progressTagline(progressPercent)}
              </Text>
            </View>
          </View>
          <Pressable
            className="bg-orange rounded-[32px] px-[20px] h-[44px] items-center justify-center"
            onPress={() => {
              router.push(`/lesson/${currentLesson.lessonKey}/${currentScene}`);
            }}
          >
            <Text className="text-white font-semibold text-[16px] main-font">
              Continue
            </Text>
          </Pressable>
        </View>

        {/* actions */}
        <View className="mt-[20px] mb-[4px]">
          <View className="flex-row justify-between">
            <Pressable
              onPress={() => { router.push("/alphabet"); }}
              className="w-[95px] h-[88px] bg-orange/95 rounded-[18px] justify-center items-center"
            >
              <Image source={icons.book} />
              <Text className="main-font text-[12px] font-semibold text-secondary mt-[4px]">
                Alphabet
              </Text>
            </Pressable>

            <TouchableOpacity
              onPress={async () => {
                try {
                  const lessonData = { lessonKey: "alifBa", letter: "ا ب", index: 1 };
                  await AsyncStorage.setItem("currentLesson", JSON.stringify(lessonData));
                  setCurrentLesson(lessonData);
                  router.push("/allLessons");
                } catch (error) {
                  console.error("Error saving lesson:", error);
                  router.push("/allLessons");
                }
              }}
              className="w-[95px] h-[88px] bg-orange/95 rounded-[18px] justify-center items-center"
            >
              <Image className="w-[41px] h-[41px]" source={icons.all_lessons} />
              <Text className="main-font text-[12px] font-semibold text-secondary mt-[4px]">
                All lessons
              </Text>
            </TouchableOpacity>

            <Pressable
              onPress={() => {
                router.push(`/test/${currentLesson.lessonKey}/1` as any);
              }}
              className="w-[95px] h-[88px] bg-orange/95 rounded-[18px] justify-center items-center"
            >
              <Image className="w-[41px] h-[41px]" source={icons.approval} />
              <Text className="main-font text-[12px] font-semibold text-secondary mt-[4px]">
                Tests
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
      <Footer></Footer>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    // iOS shadow properties
    shadowColor: "#000000",
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    // Android shadow property (smaller elevation since we have manual shadow)
    elevation: 5,
  },
  pressable: {
    alignSelf: 'flex-end'
  }
});

const ProgressBar: React.FC<{ percent: number }> = ({ percent }) => {
  const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <View
      className="w-[120px] h-[9px] rounded-full overflow-hidden"
      style={{
        backgroundColor: "#e5e7eb",
      }}
    >
      <View className="h-full bg-orange" style={{ width: `${safePercent}%` }} />
    </View>
  );
};

// Subtle badge component for compact stats
const InfoBadge: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <View className="px-[8px] py-[3px] rounded-[9px] bg-white/10 flex-row items-center">
      <Text className="main-font text-[10px] font-semibold mr-[4px] text-gray-200">{value}</Text>
      <Text className="main-font text-[9px] text-gray-300">{label}</Text>
    </View>
  );
};
