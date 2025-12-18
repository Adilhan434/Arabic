import { useLanguage } from "@/components/LanguageContext";
import { useTheme } from "@/components/ThemeContext";
import { icons } from "@/consonants.js";
import { getTodayHadith } from "@/hadiths";
import { path } from "@/lessonRelated.js";
import { getCurrentScene, getLessonProgress } from "@/utils/lessonProgress";
import { playInterfaceSound } from "@/utils/soundUtils";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const orange = "#FF6B35";

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
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          backgroundColor: theme.colors.card,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.cardBorder,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Image
              source={icons.main}
              style={{ width: 40, height: 40, marginRight: 12 }}
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: theme.colors.font,
              }}
            >
              {t("appTitle")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={async () => {
              await playInterfaceSound();
              router.push("/settings");
            }}
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              backgroundColor: theme.colors.background,
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={24} color={theme.colors.font} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "start" }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
          {/* Daily Hadith Card - inDrive style */}
          <View
            className="mt-4"
            style={{
              ...styles.cardShadow,
              backgroundColor: theme.colors.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 4,
                  height: 20,
                  backgroundColor: theme.colors.accent,
                  borderRadius: 2,
                  marginRight: 8,
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: theme.colors.fontSecondary,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {t("hadithOfTheDay")}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Seymour One",
                color: theme.colors.font,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              {hadith.arabic}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.fontSecondary,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {t("hadithText")}
            </Text>
            <View
              style={{
                alignItems: "center",
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: theme.colors.cardBorder,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.fontLight,
                  fontStyle: "italic",
                }}
              >
                {t("prophet")} ﷺ {hadith.source ? `• ${t("bukhari")}` : ""}
              </Text>
            </View>
          </View>

          {/* Current Lesson Card - inDrive "offer" style */}
          <View
            style={{
              ...styles.cardShadow,
              backgroundColor: theme.colors.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
            }}
            className="mt"
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: theme.colors.fontSecondary,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  {t("currentLesson")}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: theme.colors.font,
                    }}
                  >
                    {t("lesson")} {currentLesson.index}
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: theme.colors.font,
                      marginLeft: 8,
                    }}
                  >
                    {currentLesson.letter}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.fontSecondary,
                    marginBottom: 4,
                  }}
                >
                  {t("progress")}
                </Text>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: theme.colors.accent,
                  }}
                >
                  {progressPercent}%
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={{ marginBottom: 16 }}>
              <ProgressBar percent={progressPercent} theme={theme} />
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.fontLight,
                  marginTop: 4,
                }}
              >
                {progressTagline(progressPercent)}
              </Text>
            </View>

          {/* Action Buttons */}
          {progressPercent >= 100 ? (
            // Показать две кнопки когда урок завершен
            <View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.accent, textAlign: 'center', marginBottom: 12 }}>
                {t("lessonCompleted")}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: theme.colors.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
                  onPress={async () => {
                    await playInterfaceSound();
                    router.push(`/test/${currentLesson.lessonKey}/1` as any);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>
                    {t("goToTests")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ 
                    flex: 1, 
                    backgroundColor: theme.colors.card, 
                    borderRadius: 12, 
                    paddingVertical: 14, 
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: theme.colors.accent
                  }}
                  onPress={async () => {
                    await playInterfaceSound();
                    // Найти следующий урок
                    const currentIndex = path.findIndex(lesson => Object.keys(lesson)[0] === currentLesson.lessonKey);
                    if (currentIndex !== -1 && currentIndex < path.length - 1) {
                      const nextLessonObj = path[currentIndex + 1] as any;
                      const nextLessonKey = Object.keys(nextLessonObj)[0];
                      const nextLetter = nextLessonObj[nextLessonKey];
                      const nextLessonData = {
                        lessonKey: nextLessonKey,
                        letter: nextLetter,
                        index: currentIndex + 2,
                      };
                      await AsyncStorage.setItem("currentLesson", JSON.stringify(nextLessonData));
                      setCurrentLesson(nextLessonData);
                      // Загрузить прогресс следующего урока
                      const nextProgress = await getLessonProgress(nextLessonKey);
                      const nextScene = await getCurrentScene(nextLessonKey);
                      setLessonProgress(nextProgress);
                      setCurrentScene(nextScene);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.accent }}>
                    {t("nextLesson")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Показать одну кнопку Continue когда урок не завершен
            <TouchableOpacity
              style={{ backgroundColor: theme.colors.accent, borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
              onPress={async () => {
                await playInterfaceSound();
                router.push(`/lesson/${currentLesson.lessonKey}/${currentScene}`);
              }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>
                {t("continue")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions Grid */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={async () => {
              await playInterfaceSound();
              router.push("/alphabet");
            }}
            style={{ ...styles.cardShadow, flex: 1, marginRight: 8, backgroundColor: theme.colors.card, borderRadius: 16, padding: 16, alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Image source={icons.book} style={{ width: 40, height: 40, marginBottom: 8, tintColor: theme.colors.font }}   />
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.font, textAlign: 'center' }}>
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
            style={{ ...styles.cardShadow, flex: 1, marginHorizontal: 4, backgroundColor: theme.colors.card, borderRadius: 16, padding: 16, alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Image style={{ width: 40, height: 40, marginBottom: 8, tintColor: theme.colors.font }} source={icons.all_lessons} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.font, textAlign: 'center' }}>
              {t("allLessons")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              await playInterfaceSound();
              router.push(`/test/${currentLesson.lessonKey}/1` as any);
            }}
            style={{ ...styles.cardShadow, flex: 1, marginLeft: 8, backgroundColor: theme.colors.card, borderRadius: 16, padding: 16, alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Image style={{ width: 40, height: 40, marginBottom: 8, tintColor: theme.colors.font }} source={icons.approval} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.font, textAlign: 'center' }}>
              {t("tests")}
            </Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});

const ProgressBar: React.FC<{ percent: number; theme: any }> = ({
  percent,
  theme,
}) => {
  const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <View
      style={{
        width: "100%",
        height: 8,
        borderRadius: 4,
        overflow: "hidden",
        backgroundColor: theme.colors.cardBorder,
      }}
    >
      <View
        style={{
          height: "100%",
          backgroundColor: theme.colors.accent,
          width: `${safePercent}%`,
        }}
      />
    </View>
  );
};
