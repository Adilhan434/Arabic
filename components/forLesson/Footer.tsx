import { icons } from "@/consonants.js";
import { playInterfaceSound } from "@/utils/soundUtils";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, View } from "react-native";

const Footer = () => {
  const router = useRouter();
  const { lessonName, sceneId } = useLocalSearchParams<{
    lessonName: string;
    sceneId: string;
  }>();

  const currentId = parseInt(sceneId || "1", 10);

  // универсальная остановка медиа (аудио и видео)
  const stopCurrentMedia = async () => {
    try {
      if (global.activeAudio) {
        try {
          await global.activeAudio.stopAsync();
        } catch {} // ignore
        try {
          await global.activeAudio.unloadAsync();
        } catch {} // ignore
        global.activeAudio = null;
      }

      if (global.activeVideoPlayer) {
        try {
          // pause может быть sync/async в зависимости от реализации — await безопасно
          await global.activeVideoPlayer.pause();
        } catch (e) {
          console.error("Ошибка при паузе видео-плеера:", e);
        }
        // не выгружаем ресурс видео здесь (чтобы не ломать поведение плеера),
        // просто очищаем ссылку: следующая сцена при необходимости создаст/подставит новый плеер
        global.activeVideoPlayer = null;
      }
    } catch (error) {
      console.error("Ошибка при остановке медиа:", error);
    }
  };

  const handleNext = async () => {
    await playInterfaceSound();
    await stopCurrentMedia();
    if (currentId < 15) {
      router.push(`/lesson/${lessonName}/${currentId + 1}`);
    } else {
      router.push(`/lesson/${lessonName}/1`);
    }
  };

  const handlePrevious = async () => {
    await playInterfaceSound();
    await stopCurrentMedia();
    if (currentId > 1) {
      router.push(`/lesson/${lessonName}/${currentId - 1}`);
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: 40,
        paddingVertical: 20,
        width: "100%",
        height: 90,
        alignItems: "center",
        justifyContent: "space-between",
      }}
      className="bg-primary"
    >
      <Pressable
        onPress={handlePrevious}
        disabled={currentId <= 1}
        style={({ pressed }) => ({
          opacity: pressed || currentId <= 1 ? 0.5 : 1,
        })}
      >
        <Image source={icons.left_circle} style={{ width: 38, height: 38 }} />
      </Pressable>

      <Pressable
        onPress={handleNext}
        style={({ pressed }) => ({
          opacity: pressed ? 0.5 : 1,
        })}
      >
        <Image source={icons.right_circle} style={{ width: 38, height: 38 }} />
      </Pressable>
    </View>
  );
};

export default Footer;
