import { useTheme } from "@/components/ThemeContext";
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
  const { theme } = useTheme();

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
      <View style={{ width: '100%', backgroundColor: theme.colors.card, height: 100, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'flex-end', justifyContent: 'space-between', flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder }}>
        <Pressable onPress={stopCurrentMediaAndGoHome}>
          <Image source={icons.left_circle} style={{width: 38, height:38}} />
        </Pressable>

        <View style={{ flexDirection: 'row', gap: 20, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontWeight: '800', fontSize: 40, lineHeight: 64, color: theme.colors.font }}>
            {header}
          </Text>
          <Text style={{ color: theme.colors.fontSecondary, fontWeight: '400', fontSize: 24, lineHeight: 27 }}>
            тамгасы
          </Text>
        </View>

        <View style={{ width: 40, height: 40 }} />
      </View>

      {/* Inline progress bar */}
      <View style={{ width: '100%', paddingTop: 7, backgroundColor: theme.colors.background, borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}></View>
        <View style={{ width: '100%', height: 8, backgroundColor: theme.colors.cardBorder, overflow: 'hidden' }}>
          <View
            style={{ height: '100%', backgroundColor: theme.colors.accent, width: `${progressPercent}%` }}
          />
        </View>
      </View>
    </View>
  );
};

export default HeaderForLessonMinimal;
