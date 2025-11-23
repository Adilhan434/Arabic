import { useLanguage } from "@/components/LanguageContext";
import { useTheme } from "@/components/ThemeContext";
import { path } from "@/lessonRelated.js";
import { getLessonProgress } from "@/utils/lessonProgress";
import { playInterfaceSound } from "@/utils/soundUtils";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AllLessons = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const [lessonsProgress, setLessonsProgress] = useState<
    Record<string, number>
  >({});
  const { t } = useLanguage();

  // Загружаем прогресс всех уроков при загрузке экрана
  useFocusEffect(
    React.useCallback(() => {
      const loadAllProgress = async () => {
        const progressData: Record<string, number> = {};

        for (const lesson of path) {
          const lessonKey = Object.keys(lesson)[0];
          const progress = await getLessonProgress(lessonKey);
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
      const lessonData = {
        lessonKey,
        letter,
        index: index + 1,
      };
      await AsyncStorage.setItem("currentLesson", JSON.stringify(lessonData));
      router.push("/");
    } catch (error) {
      console.error("Error saving lesson:", error);
      router.push("/");
    }
  };

  const renderLessonCard = ({ item, index }: { item: any; index: number }) => {
    const lessonKey = Object.keys(item)[0];
    const letter = item[lessonKey];
    const progress = lessonsProgress[lessonKey] || 0;
    const isCompleted = progress >= 100;
    const isInProgress = progress > 0 && progress < 100;

    return (
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <TouchableOpacity
          style={{ ...styles.cardShadow, backgroundColor: theme.colors.card, borderRadius: 16, padding: 16 }}
          onPress={() => {
            handleLessonSelect(lessonKey, letter, index);
          }}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left: Lesson Info */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    backgroundColor: isCompleted ? '#10b981' : isInProgress ? theme.colors.accent : theme.colors.cardBorder
                  }}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={24} color="white" />
                  ) : (
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: isInProgress ? theme.colors.font : theme.colors.fontSecondary }}>
                      {index + 1}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: theme.colors.fontSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {t("lesson")} {index + 1}
                  </Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.font }}>
                    {letter}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              {progress > 0 && (
                <View className="mt-2">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-xs text-font-light">
                      {isCompleted ? t("completed") : t("in_progress")}
                    </Text>
                    <Text className="text-xs font-semibold text-font-secondary">
                      {progress}%
                    </Text>
                  </View>
                  <View className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <View
                      className={`h-full ${isCompleted ? "bg-green-500" : "bg-accent"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Right: Action Button */}
            <View className="ml-4">
              <View
                className={`rounded-button px-6 py-3 ${
                  isCompleted
                    ? "bg-green-500"
                    : isInProgress
                      ? "bg-accent"
                      : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    isCompleted || isInProgress ? "text-font" : "text-font-secondary"
                  }`}
                >
                  {isCompleted
                    ? t("review")
                    : isInProgress
                      ? t("continue")
                      : t("start")}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16, backgroundColor: theme.colors.card, borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={async () => {
              await playInterfaceSound();
              router.back();
            }}
            style={{ marginRight: 12, padding: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.font} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.font, flex: 1 }}>
            {t("allLessons")}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: theme.colors.fontSecondary }}>
            {path.length} {t("lessons")}
          </Text>
        </View>
      </View>

      {/* Lessons List */}
      <FlatList
        data={path}
        renderItem={renderLessonCard}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});

export default AllLessons;

//     return (
//       <View style={{ marginBottom: 16 }}>
//         <TouchableOpacity
//           className="rounded-[14px] flex-row items-center min-h-[68px] border-[4px] border-primary bg-white"
//           onPress={() => {
//             handleLessonSelect(lessonKey, letter, index);
//           }}
//           style={{
//             shadowColor: "#000000",
//             shadowOffset: { width: 0, height: 4 },
//             shadowOpacity: 0.2,
//             shadowRadius: 8,
//             elevation: 5,
//             paddingHorizontal: 16,
//             paddingVertical: 12,
//           }}
//         >
//           {/* Левая часть - прогресс */}
//           <View className="flex-col items-center justify-center w-16">
//             <View className="items-center">
//               <View
//                 className={`w-12 h-12 rounded-full items-center justify-center ${isCompleted ? "bg-green-500" : "bg-orange"}`}
//               >
//                 <Text className="text-white text-xs font-bold">
//                   {progress}%
//                 </Text>
//               </View>
//             </View>
//           </View>

//           {/* Центральная часть - информация об уроке */}
//           <View className="flex-1 flex-row items-center justify-center">
//             <Text className="font-semibold text-[16px] mr-5 text-center">
//               {t("lesson")} {index + 1}:
//             </Text>
//             <Text className="font-bold text-[38px] font-noto text-center">
//               {letter}
//             </Text>
//           </View>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-primary">
//       {/* Header */}
//       <View className="flex-row items-center px-4 pt-2 pb-4">
//         <TouchableOpacity
//           onPress={async () => {
//             await playInterfaceSound();
//             router.back();
//           }}
//           className="mr-4 p-2"
//         >
//           <Ionicons name="arrow-back" size={24} color="white" />
//         </TouchableOpacity>
//         <Text className="flex-1 text-center main-font text-white text-[33px] font-bold">
//           {t("allLessons")}
//         </Text>
//         <View className="w-8" />
//       </View>

//       <View className="flex-1 px-4 ">
//         <FlatList
//           data={path}
//           renderItem={renderLessonCard}
//           keyExtractor={(item, index) => `lesson-${index}`}
//           showsVerticalScrollIndicator={false}
//           removeClippedSubviews={true}
//           initialNumToRender={10}
//           maxToRenderPerBatch={10}
//           windowSize={10}
//           getItemLayout={(data, index) => ({
//             length: 84, // height of item + margin
//             offset: 84 * index,
//             index,
//           })}
//           contentContainerStyle={{
//             paddingBottom: 120,
//             paddingTop: 20,
//             paddingHorizontal: 22,
//           }}
//           style={{
//             backgroundColor: "white",
//             borderRadius: 10,
//             marginHorizontal: -16,
//             marginTop: 0,
//           }}
//         />
//       </View>
//     </SafeAreaView>
//   );
// };

// export default AllLessons;
