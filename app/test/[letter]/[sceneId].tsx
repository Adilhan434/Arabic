import HeaderForLessonMinimal from "@/components/forLesson/HeaderForLessonMinimal";
import { lessons } from "@/lessonRelated.js";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageContext";
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
	for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
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
	const lessonKey = letter as keyof typeof lessons;
	const lessonScenes = lessons[lessonKey];
	const variantId = (sceneId as string) || "1"; // используем как seed
	const {t} = useLanguage();
 	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [selectedOption, setSelectedOption] = useState<number | null>(null);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
	const [soundLoading, setSoundLoading] = useState(false);
	const [feedbackVisible, setFeedbackVisible] = useState(false);
	const [score, setScore] = useState(0);
	const [showSummary, setShowSummary] = useState(false);
	const [saving, setSaving] = useState(false);
	const soundRef = useRef<Audio.Sound | null>(null);

	// Пул сцен (только объекты с text)
	const quizPool: QuizItem[] = useMemo(() => {
		if (!lessonScenes) return [];
		return lessonScenes.filter((s: any) => typeof s === "object" && "text" in s) as QuizItem[];
	}, [lessonScenes]);

	// Построение вопросов с детерминированным порядком по сцене
	const questions: BuiltQuestion[] = useMemo(() => {
		if (quizPool.length === 0) return [];
		const indices = seededRandomIndexes(quizPool.length, variantId);
		const picked = indices.slice(0, Math.min(TOTAL_QUESTIONS, quizPool.length)).map(i => quizPool[i]);
		return picked.map(item => {
			const distractors = shuffle(quizPool.filter(i => i !== item)).slice(0, Math.min(3, quizPool.length - 1));
			const options = shuffle([item, ...distractors]);
			const correctIndex = options.findIndex(o => o === item);
			const mode: BuiltQuestion["mode"] = Math.random() < 0.6 ? "TEXT_TO_AUDIO" : "AUDIO_TO_TEXT";
			return { prompt: item.text, correctIndex, options, mode, correctItem: item };
		});
	}, [quizPool, variantId]);

	// Очистка аудио
	useEffect(() => {
		return () => {
			if (soundRef.current) {
				try { soundRef.current.stopAsync(); } catch {}
				try { soundRef.current.unloadAsync(); } catch {}
				soundRef.current = null;
			}
		};
	}, []);

	const playOption = async (audio: any) => {
		if (!audio) return;
		try {
			setSoundLoading(true);
			if (soundRef.current) {
				try { await soundRef.current.stopAsync(); } catch {}
				try { await soundRef.current.unloadAsync(); } catch {}
				soundRef.current = null;
			}
			const { sound } = await Audio.Sound.createAsync(audio, { shouldPlay: true });
			soundRef.current = sound;
			global.activeAudio = sound;
		} catch (e) {
			console.error("Audio play error", e);
		} finally {
			setSoundLoading(false);
		}
	};

		const handleSelect = (idx: number) => {
			if (feedbackVisible || showSummary) return;
			setSelectedOption(idx);
			const correct = idx === questions[currentQuestion].correctIndex;
			setIsCorrect(correct);
			if (correct) setScore(s => s + 1);
			setFeedbackVisible(true);
			setTimeout(() => {
				goNext();
			}, 1000);
		};

	const persistResult = async (finalScore: number) => {
		try {
			setSaving(true);
			const key = `${RESULT_KEY_PREFIX}${lessonKey}`;
			const record = { score: finalScore, total: questions.length, ts: Date.now(), variant: variantId };
			await AsyncStorage.setItem(key, JSON.stringify(record));
		} catch (e) {
			console.error("Save test result error", e);
		} finally {
			setSaving(false);
		}
	};

	const goNext = () => {
		if (currentQuestion + 1 < questions.length) {
			setCurrentQuestion(q => q + 1);
			setSelectedOption(null);
			setIsCorrect(null);
			setFeedbackVisible(false);
		} else {
			persistResult(score + (isCorrect ? 1 : 0));
			setShowSummary(true);
		}
	};

	const restart = () => {
		setCurrentQuestion(0);
		setSelectedOption(null);
		setIsCorrect(null);
		setFeedbackVisible(false);
		setScore(0);
		setShowSummary(false);
	};

	if (!lessonScenes || questions.length === 0) {
		return (
			<SafeAreaView className="flex-1 items-center justify-center bg-white">
				<Text>{t('no_available_data_for_test')}</Text>
			</SafeAreaView>
		);
	}

	const q = questions[currentQuestion];
	const progressPercent = showSummary ? 100 : ((currentQuestion + 1) / questions.length) * 100;

	return (
		<SafeAreaView className="flex-1 bg-white">
			<StatusBar barStyle="dark-content" backgroundColor="white" />
			<HeaderForLessonMinimal
				header={lessonScenes[0] as string}
				currentScene={currentQuestion + 1}
				totalScenes={questions.length}
			/>

			<View className="px-5 pt-6 flex-1">
				{!showSummary && (
					<>
						<Text className="text-base font-medium mb-2 text-gray-500 text-center">
              					{t('question')} {currentQuestion + 1} / {questions.length} · {t('score')}: {score}
						</Text>
						<Text className="text-xl font-semibold mb-4 text-gray-800 text-center">
							 {q.mode === "TEXT_TO_AUDIO" ? t('selectCorrectAudio') : t('listenAndSelectText')}
						</Text>
						<View className="items-center mb-6">
							{q.mode === "TEXT_TO_AUDIO" ? (
								<Text className="text-5xl font-extrabold text-black mb-2">{q.prompt}</Text>
							) : (
								<Pressable
									onPress={() => playOption(q.correctItem.audio)}
									className="w-24 h-24 rounded-full bg-primary items-center justify-center"
								>
									{soundLoading ? (
										<ActivityIndicator size="small" color="#fff" />
									) : (
										<Ionicons name="play" size={34} color="#fff" />
									)}
								</Pressable>
							)}
						</View>

						<FlatList
							data={q.options}
							keyExtractor={(_, i) => i.toString()}
							renderItem={({ item, index }) => {
								const isSelected = selectedOption === index;
								let bg = "bg-white";
								if (feedbackVisible && index === q.correctIndex) bg = "bg-green-100";
								else if (feedbackVisible && isSelected && !isCorrect) bg = "bg-red-100";
								else if (isSelected) bg = "bg-indigo-100";
								return (
									<Pressable
										onPress={() => handleSelect(index)}
										className={`mb-3 border border-gray-300 rounded-xl p-4 flex-row items-center justify-between ${bg}`}
									>
										<Text className="text-3xl font-bold text-gray-900">{item.text}</Text>
										{q.mode === "TEXT_TO_AUDIO" && (
											<Pressable
												disabled={soundLoading}
												onPress={(e) => { e.stopPropagation(); playOption(item.audio); }}
												className={`ml-4 w-12 h-12 rounded-full ${soundLoading ? "bg-gray-400" : "bg-primary"} items-center justify-center`}
											>
												{soundLoading ? (
													<ActivityIndicator size="small" color="#fff" />
												) : (
													<Ionicons name="volume-high" size={22} color="#fff" />
												)}
											</Pressable>
										)}
									</Pressable>
								);
							}}
						/>

									{feedbackVisible && (
										<View className="mt-2 items-center">
											<Text className={`text-lg font-medium mb-2 ${isCorrect ? "text-green-600" : "text-red-600"}`}>
												{isCorrect ? "Правильно!" : "Неправильно"}
											</Text>
											<View className="flex-row items-center gap-2">
												<ActivityIndicator size="small" color="#000" />
												<Text className="text-gray-600">Следующий вопрос...</Text>
											</View>
										</View>
									)}
					</>
				)}

				{showSummary && (
					<View className="flex-1 items-center justify-center">
						<Text className="text-3xl font-bold mb-4">Результат</Text>
						<Text className="text-xl mb-6">
							{t('you_got')} {score} {t('from')} {questions.length} ({Math.round((score / questions.length) * 100)}%)
						</Text>
							<Pressable onPress={restart} className="bg-primary px-8 py-3 rounded-full mb-3">
							<Text className="text-white font-semibold text-base">{t('tryAgain')}</Text>
							</Pressable>
							<Pressable onPress={() => router.push(`/` as any)} className="bg-black px-8 py-3 rounded-full">
							<Text className="text-white font-semibold text-base">{t('goHome')}</Text>
							</Pressable>
					</View>
				)}
			</View>

			<View className="w-full h-3 bg-gray-200">
				<View className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
			</View>
		</SafeAreaView>
	);
};

export default TestScene;

