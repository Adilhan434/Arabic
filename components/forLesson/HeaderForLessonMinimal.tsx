import { icons } from "@/consonants.js";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";

interface HeaderForLessonProps {
  header: string;
  currentScene?: number;
  totalScenes?: number;
}

const HeaderForLessonMinimal = ({
  header,
  currentScene = 1,
  totalScenes = 15,
}: HeaderForLessonProps) => {
  const router = useRouter();

  const stopCurrentMediaAndGoHome = async () => {
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
          await global.activeVideoPlayer.pause();
        } catch (e) {
          console.error("Ошибка при паузе видео-плеера:", e);
        }
        global.activeVideoPlayer = null;
      }
    } catch (err) {
      console.error("Ошибка при остановке медиа перед переходом в меню:", err);
    } finally {
      router.push("/");
    }
  };

  const progressPercent =
    currentScene >= totalScenes ? 100 : (currentScene / totalScenes) * 100;

  return (
    <View>
      <View className="w-full bg-[#0B503D] h-[100px] px-4 py-3 items-end justify-between flex-row">
        <Pressable onPress={stopCurrentMediaAndGoHome}>
          <Image source={icons.left_circle} style={{width: 38, height:38}} />
        </Pressable>

        <View className="flex-row gap-5 justify-center items-center">
          <Text className="font-extrabold text-[40px] leading-[64px] text-white">
            {header}
          </Text>
          <Text className="text-white font-normal text-2xl leading-[27px]">
            тамгасы
          </Text>
        </View>

        <View className="w-10 h-10" />
      </View>

      {/* Inline progress bar */}
      <View className="w-full pt-[7px] bg-gray-50 border-b border-gray-300">
        <View className="flex-row items-center justify-between mb-0"></View>
        <View className="w-full h-2 bg-gray-300 overflow-hidden">
          <View
            className="h-full bg-black"
            style={{ width: `${progressPercent}%` }}
          />
        </View>
      </View>
    </View>
  );
};

export default HeaderForLessonMinimal;
