import { useLanguage } from "@/components/LanguageContext";
import { path } from "@/lessonRelated.js";
import { getLessonProgress } from "@/utils/lessonProgress";
import { playInterfaceSound } from "@/utils/soundUtils";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AllLessons = () => {
  const router = useRouter();
  const [lessonsProgress, setLessonsProgress] = useState<
    Record<string, number>
  >({});
  const { t } = useLanguage(); // Добавлено

  // Загружаем прогресс всех уроков при загрузке экрана
  useFocusEffect(
    React.useCallback(() => {
      const loadAllProgress = async () => {
        const progressData: Record<string, number> = {};

        for (const lesson of path) {
          const lessonKey = Object.keys(lesson)[0];
          const progress = await getLessonProgress(lessonKey);
          // Если прогресс 0, то урок не начат - показываем 0%
          // Если прогресс >= 15, то урок завершен - показываем 100%
          // Иначе показываем реальный процент
          const percentage =
            progress === 0
              ? 0
              : progress >= 15
                ? 100
                : Math.round((progress / 15) * 100);
          progressData[lessonKey] = percentage;
        }

        setLessonsProgress(progressData);
      };

      loadAllProgress();
    }, [])
  );

  const handleLessonSelect = async (
    lessonKey: string,
    letter: string,
    index: number
  ) => {
    await playInterfaceSound();
    try {
      // Сохраняем выбранный урок в AsyncStorage
      const lessonData = {
        lessonKey,
        letter,
        index: index + 1,
      };
      await AsyncStorage.setItem("currentLesson", JSON.stringify(lessonData));

      // Возвращаемся на главную страницу
      router.push("/");
    } catch (error) {
      console.error("Error saving lesson:", error);
      // В случае ошибки все равно переходим на главную
      router.push("/");
    }
  };

  const renderLessonCard = ({ item, index }: { item: any; index: number }) => {
    const lessonKey = Object.keys(item)[0];
    const letter = item[lessonKey];
    const progress = lessonsProgress[lessonKey] || 0;
    const isCompleted = progress >= 100;

    return (
      <View style={{ marginBottom: 16 }}>
        <TouchableOpacity
          className="rounded-[14px] flex-row items-center min-h-[68px] border-[4px] border-primary bg-white"
          onPress={() => {
            handleLessonSelect(lessonKey, letter, index);
          }}
          style={{
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          {/* Левая часть - прогресс */}
          <View className="flex-col items-center justify-center w-16">
            <View className="items-center">
              <View
                className={`w-12 h-12 rounded-full items-center justify-center ${isCompleted ? "bg-green-500" : "bg-orange"}`}
              >
                <Text className="text-white text-xs font-bold">
                  {progress}%
                </Text>
              </View>
            </View>
          </View>

          {/* Центральная часть - информация об уроке */}
          <View className="flex-1 flex-row items-center justify-center">
            <Text className="font-semibold text-[16px] mr-5 text-center">
              {t("lesson")} {index + 1}:
            </Text>
            <Text className="font-bold text-[38px] font-noto text-center">
              {letter}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-4">
        <TouchableOpacity
          onPress={async () => {
            await playInterfaceSound();
            router.back();
          }}
          className="mr-4 p-2"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="flex-1 text-center main-font text-white text-[33px] font-bold">
          {t("allLessons")}
        </Text>
        <View className="w-8" />
      </View>

      <View className="flex-1 px-4 ">
        <FlatList
          data={path}
          renderItem={renderLessonCard}
          keyExtractor={(item, index) => `lesson-${index}`}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          getItemLayout={(data, index) => ({
            length: 84, // height of item + margin
            offset: 84 * index,
            index,
          })}
          contentContainerStyle={{
            paddingBottom: 120,
            paddingTop: 20,
            paddingHorizontal: 22,
          }}
          style={{
            backgroundColor: "white",
            borderRadius: 10,
            marginHorizontal: -16,
            marginTop: 0,
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default AllLessons;
