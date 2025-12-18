import HeaderForLessonMinimal from "@/components/forLesson/HeaderForLessonMinimal";
import { useLanguage } from "@/components/LanguageContext";
import { useTheme } from "@/components/ThemeContext";
import { lessons } from "@/lessonRelated.js";
import { playInterfaceSound } from "@/utils/soundUtils";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ---- Types ----
interface QuizItem {
  text: string;
  audio?: any;
  explain?: string;
}

interface BuiltQuestion {
  prompt: string;
  correctIndex: number;
  options: QuizItem[];
  mode: "TEXT_TO_AUDIO" | "AUDIO_TO_TEXT";
  correctItem: QuizItem;
}

// 15 вопросов как просили
const TOTAL_QUESTIONS = 15;
const RESULT_KEY_PREFIX = "testResult_";

// Fisher-Yates
const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Дет-ерминированный seed из строки (sceneId) для варианта теста
const seededRandomIndexes = (length: number, seedStr: string): number[] => {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++)
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const TestScene = () => {
  const { letter, sceneId } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const lessonKey = letter as keyof typeof lessons;
  const lessonScenes = lessons[lessonKey];
  const variantId = (sceneId as string) || "1"; // используем как seed
  const { t } = useLanguage();
  const redColor = theme.dark ? "#ef5350" : "#dc2626";
  const greenColor = theme.dark ? "#10b981" : "#059669";
  const greenLightBg = theme.dark ? "#065f46" : "#d1fae5";
  const redLightBg = theme.dark ? "#7f1d1d" : "#fee2e2";
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [soundLoading, setSoundLoading] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Пул сцен (только объекты с text)
  const quizPool: QuizItem[] = useMemo(() => {
    if (!lessonScenes) return [];
    return lessonScenes.filter(
      (s: any) => typeof s === "object" && "text" in s
    ) as QuizItem[];
  }, [lessonScenes]);

  // Построение вопросов с детерминированным порядком по сцене
  const questions: BuiltQuestion[] = useMemo(() => {
    if (quizPool.length === 0) return [];
    const indices = seededRandomIndexes(quizPool.length, variantId);
    const picked = indices
      .slice(0, Math.min(TOTAL_QUESTIONS, quizPool.length))
      .map((i) => quizPool[i]);
    return picked.map((item) => {
      const distractors = shuffle(quizPool.filter((i) => i !== item)).slice(
        0,
        Math.min(3, quizPool.length - 1)
      );
      const options = shuffle([item, ...distractors]);
      const correctIndex = options.findIndex((o) => o === item);
      const mode: BuiltQuestion["mode"] =
        Math.random() < 0.6 ? "TEXT_TO_AUDIO" : "AUDIO_TO_TEXT";
      return {
        prompt: item.text,
        correctIndex,
        options,
        mode,
        correctItem: item,
      };
    });
  }, [quizPool, variantId]);

  // Очистка аудио
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        try {
          soundRef.current.stopAsync();
        } catch {}
        try {
          soundRef.current.unloadAsync();
        } catch {}
        soundRef.current = null;
      }
    };
  }, []);

  const playOption = async (audio: any) => {
    if (!audio) return;
    try {
      setSoundLoading(true);
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
        } catch {}
        try {
          await soundRef.current.unloadAsync();
        } catch {}
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(audio, {
        shouldPlay: true,
      });
      soundRef.current = sound;
      global.activeAudio = sound;
    } catch (e) {
      console.error("Audio play error", e);
    } finally {
      setSoundLoading(false);
    }
  };

  const handleSelect = async (idx: number) => {
    if (feedbackVisible || showSummary) return;
    await playInterfaceSound();
    setSelectedOption(idx);
    const correct = idx === questions[currentQuestion].correctIndex;
    setIsCorrect(correct);
    if (correct) setScore((s) => s + 1);
    setFeedbackVisible(true);
    setTimeout(() => {
      goNext();
    }, 1000);
  };

  const persistResult = async (finalScore: number) => {
    try {
      const key = `${RESULT_KEY_PREFIX}${lessonKey}`;
      const record = {
        score: finalScore,
        total: questions.length,
        ts: Date.now(),
        variant: variantId,
      };
      await AsyncStorage.setItem(key, JSON.stringify(record));
    } catch (e) {
      console.error("Save test result error", e);
    }
  };

  const goNext = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((q) => q + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setFeedbackVisible(false);
    } else {
      persistResult(score + (isCorrect ? 1 : 0));
      setShowSummary(true);
    }
  };

  const restart = async () => {
    await playInterfaceSound();
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setFeedbackVisible(false);
    setScore(0);
    setShowSummary(false);
  };

  if (!lessonScenes || questions.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text>{t("no_available_data_for_test")}</Text>
      </SafeAreaView>
    );
  }

  const q = questions[currentQuestion];
  const progressPercent = showSummary
    ? 100
    : ((currentQuestion + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      <HeaderForLessonMinimal
        header={lessonScenes[0] as string}
        currentScene={currentQuestion + 1}
        totalScenes={questions.length}
      />

      <View className="px-5 pt-6 flex-1">
        {!showSummary && (
          <>
            <Text style={{ fontSize: 16, fontWeight: "500", marginBottom: 8, color: theme.colors.fontSecondary, textAlign: "center" }}>
              {t("question")} {currentQuestion + 1} / {questions.length} ·{" "}
              {t("score")}: {score}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 16, color: theme.colors.font, textAlign: "center" }}>
              {q.mode === "TEXT_TO_AUDIO"
                ? t("selectCorrectAudio")
                : t("listenAndSelectText")}
            </Text>
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              {q.mode === "TEXT_TO_AUDIO" ? (
                <Text style={{ fontSize: 52, fontWeight: "800", color: theme.colors.font, marginBottom: 8 }}>
                  {q.prompt}
                </Text>
              ) : (
                <Pressable
                  onPress={() => playOption(q.correctItem.audio)}
                  style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: theme.colors.accent, alignItems: "center", justifyContent: "center" }}
                >
                  {soundLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.font} />
                  ) : (
                    <Ionicons name="play" size={34} color={theme.colors.font} />
                  )}
                </Pressable>
              )}
            </View>

            <FlatList
              data={q.options}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item, index }) => {
                const isSelected = selectedOption === index;
                let bgColor = theme.colors.card;
                if (feedbackVisible && index === q.correctIndex)
                  bgColor = greenLightBg;
                else if (feedbackVisible && isSelected && !isCorrect)
                  bgColor = redLightBg;
                else if (isSelected) bgColor = theme.colors.accent + '33';
                return (
                  <Pressable
                    onPress={() => handleSelect(index)}
                    style={{ marginBottom: 12, borderWidth: 1, borderColor: theme.colors.cardBorder, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: bgColor }}
                  >
                    <Text style={{ fontSize: 30, fontWeight: "bold", color: theme.colors.font }}>
                      {item.text}
                    </Text>
                    {q.mode === "TEXT_TO_AUDIO" && (
                      <Pressable
                        disabled={soundLoading}
                        onPress={(e) => {
                          e.stopPropagation();
                          playOption(item.audio);
                        }}
                        style={{ marginLeft: 16, width: 48, height: 48, borderRadius: 24, backgroundColor: soundLoading ? theme.colors.fontLight : theme.colors.accent, alignItems: "center", justifyContent: "center" }}
                      >
                        {soundLoading ? (
                          <ActivityIndicator size="small" color={theme.colors.font} />
                        ) : (
                          <Ionicons name="volume-high" size={22} color={theme.colors.font} />
                        )}
                      </Pressable>
                    )}
                  </Pressable>
                );
              }}
            />

            {feedbackVisible && (
              <View style={{ marginTop: 8, alignItems: "center" }}>
                <Text
                  style={{ fontSize: 18, fontWeight: "500", marginBottom: 8, color: isCorrect ? greenColor : redColor }}
                >
                  {isCorrect ? "Правильно!" : "Неправильно"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <ActivityIndicator size="small" color={theme.colors.font} />
                  <Text style={{ color: theme.colors.fontSecondary }}>Следующий вопрос...</Text>
                </View>
              </View>
            )}
          </>
        )}

        {showSummary && (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 32, fontWeight: "bold", marginBottom: 16, color: theme.colors.font }}>Результат</Text>
            <Text style={{ fontSize: 20, marginBottom: 24, color: theme.colors.fontSecondary }}>
              {t("you_got")} {score} {t("from")} {questions.length} (
              {Math.round((score / questions.length) * 100)}%)
            </Text>
            <Pressable
              onPress={restart}
              style={{ backgroundColor: theme.colors.accent, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24, marginBottom: 12 }}
            >
              <Text style={{ color: theme.colors.font, fontWeight: "600", fontSize: 16 }}>
                {t("tryAgain")}
              </Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                await playInterfaceSound();
                router.push(`/` as any);
              }}
              style={{ backgroundColor: theme.colors.font, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 }}
            >
              <Text style={{ color: theme.colors.card, fontWeight: "600", fontSize: 16 }}>
                {t("goHome")}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={{ width: '100%', height: 12, backgroundColor: theme.colors.cardBorder }}>
        <View
          style={{ height: '100%', backgroundColor: theme.colors.accent, width: `${progressPercent}%` }}
        />
      </View>
    </SafeAreaView>
  );
};

export default TestScene;
