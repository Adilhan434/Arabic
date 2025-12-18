import HeaderForLessonMinimal from "@/components/forLesson/HeaderForLessonMinimal";
import { useLanguage } from "@/components/LanguageContext";
import { useTheme } from "@/components/ThemeContext";
import { lessons } from "@/lessonRelated.js";
import { playInterfaceSound } from "@/utils/soundUtils";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

declare global {
  var activeAudio: any;
  var activeVideoPlayer: any;
}

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

// Детерминированный seed из строки (sceneId) для варианта теста
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
  const [saving, setSaving] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null); // Используем локальное состояние

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

  // Очистка аудио при размонтировании компонента
  useEffect(() => {
    return () => {
      const cleanupAudio = async () => {
        try {
          // Очищаем локальный звук
          if (sound) {
            try {
              await sound.stopAsync();
            } catch (e) {
              console.log("Error stopping sound on unmount:", e);
            }
            try {
              await sound.unloadAsync();
            } catch (e) {
              console.log("Error unloading sound on unmount:", e);
            }
          }
          
          // Очищаем глобальное аудио
          if (global.activeAudio) {
            try {
              await global.activeAudio.stopAsync();
            } catch (e) {
              console.log("Error stopping global audio on unmount:", e);
            }
            try {
              await global.activeAudio.unloadAsync();
            } catch (e) {
              console.log("Error unloading global audio on unmount:", e);
            }
            global.activeAudio = null;
          }
        } catch (e) {
          console.log("Error during audio cleanup on unmount:", e);
        }
      };
      
      cleanupAudio();
    };
  }, []);

  const playOption = async (audio: any) => {
    if (!audio) return;
    
    try {
      // Останавливаем и выгружаем предыдущий звук
      if (sound) {
        try {
          await sound.unloadAsync();
        } catch (e) {
          console.log("Error releasing previous sound:", e);
        }
      }

      setSoundLoading(true);

      // Создаем новый звук
      const { sound: newSound } = await Audio.Sound.createAsync(audio, {
        shouldPlay: true
      });

      setSound(newSound);
      global.activeAudio = newSound;
      setSoundLoading(false);
      
    } catch (e) {
      console.error("Audio play error", e);
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
      
      // Останавливаем звук при переходе к следующему вопросу
      if (sound) {
        sound.stopAsync().catch(() => {});
      }
    } else {
      persistResult(score);
      setShowSummary(true);
      
      // Останавливаем звук при завершении теста
      if (sound) {
        sound.stopAsync().catch(() => {});
      }
    }
  };

  const restart = async () => {
    await playInterfaceSound();
    
    // Останавливаем звук при перезапуске
    if (sound) {
      sound.stopAsync().catch(() => {});
    }
    
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setFeedbackVisible(false);
    setScore(0);
    setShowSummary(false);
  };

  if (!lessonScenes || questions.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.font }}>{t("no_available_data_for_test")}</Text>
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
            <Text className="text-base font-medium mb-2 text-center" style={{ color: theme.colors.fontSecondary }}>
              {t("question")} {currentQuestion + 1} / {questions.length} ·{" "}
              {t("score")}: {score}
            </Text>
            <Text className="text-xl font-semibold mb-4 text-center" style={{ color: theme.colors.fontSecondary }}>
              {q.mode === "TEXT_TO_AUDIO"
                ? t("selectCorrectAudio")
                : t("listenAndSelectText")}
            </Text>
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              {q.mode === "TEXT_TO_AUDIO" ? (
                <Text className="text-5xl font-extrabold mb-2" style={{ color: theme.colors.font }}>
                  {q.prompt}
                </Text>
              ) : (
                <Pressable
                  onPress={() => playOption(q.correctItem.audio)}
                  className="w-24 h-24 rounded-full items-center justify-center"
                  style={{ backgroundColor: theme.colors.accent }}
                  disabled={soundLoading}
                >
                  {soundLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.secondary} />
                  ) : (
                    <Ionicons name="play" size={34} color={theme.colors.secondary} />
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
                    style={{ 
                      marginBottom: 12, 
                      borderWidth: 1, 
                      borderColor: theme.colors.cardBorder, 
                      borderRadius: 12, 
                      padding: 16, 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      backgroundColor: bgColor 
                    }}
                    disabled={feedbackVisible || showSummary}
                  >
                    {q.mode === "AUDIO_TO_TEXT" && <Text className="text-3xl font-bold" style={{ color: theme.colors.font }}>
                      {item.text}
                    </Text>}
                    {q.mode === "TEXT_TO_AUDIO" && (
                      <Pressable
                        disabled={soundLoading || feedbackVisible}
                        onPress={(e) => {
                          e.stopPropagation();
                          playOption(item.audio);
                        }}
                        className="ml-4 w-12 h-12 rounded-full items-center justify-center"
                        style={{ backgroundColor: soundLoading ? theme.colors.cardBorder : theme.colors.accent }}
                      >
                        {soundLoading ? (
                          <ActivityIndicator size="small" color={theme.colors.secondary} />
                        ) : (
                          <Ionicons name="volume-high" size={22} color={theme.colors.secondary} />
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
                  className="text-lg font-medium mb-2"
                  style={{ color: isCorrect ? (theme.dark ? "#10b981" : "#059669") : (theme.dark ? "#ef4444" : "#dc2626") }}
                >
                  {isCorrect ? t("correct") : t("incorrect")}
                </Text>
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color={theme.colors.font} />
                  <Text className="text-gray-600" style={{ color: theme.colors.fontSecondary }}>{t("next_question")}</Text>
                </View>
              </View>
            )}
          </>
        )}

        {showSummary && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-3xl font-bold mb-4" style={{ color: theme.colors.font }}>{t("result")}</Text>
            <Text className="text-xl mb-6" style={{ color: theme.colors.fontSecondary }}>
              {t("you_got")} {score} {t("from")} {questions.length} (
              {Math.round((score / questions.length) * 100)}%)
            </Text>
            <Pressable
              onPress={restart}
              className="px-8 py-3 rounded-full mb-3"
              style={{ backgroundColor: theme.colors.accent }}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={theme.colors.secondary} />
              ) : (
                <Text className="font-semibold text-base" style={{ color: theme.colors.secondary }}>
                  {t("tryAgain")}
                </Text>
              )}
            </Pressable>
            <Pressable
              onPress={async () => {
                await playInterfaceSound();
                
                // Останавливаем аудио перед выходом на главную
                try {
                  if (sound) {
                    try {
                      await sound.stopAsync();
                    } catch (e) {
                      console.log("Error stopping local sound:", e);
                    }
                    try {
                      await sound.unloadAsync();
                    } catch (e) {
                      console.log("Error unloading local sound:", e);
                    }
                    setSound(null);
                  }
                  
                  if (global.activeAudio) {
                    try {
                      await global.activeAudio.stopAsync();
                    } catch (e) {
                      console.log("Error stopping global audio:", e);
                    }
                    try {
                      await global.activeAudio.unloadAsync();
                    } catch (e) {
                      console.log("Error unloading global audio:", e);
                    }
                    global.activeAudio = null;
                  }
                } catch (e) {
                  console.log("Error stopping media before going home:", e);
                }
                
                router.push(`/` as any);
              }}
              className="px-8 py-3 rounded-full"
              style={{ backgroundColor: theme.colors.font }}
            >
              <Text className="font-semibold text-base" style={{ color: theme.colors.card }}>
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
