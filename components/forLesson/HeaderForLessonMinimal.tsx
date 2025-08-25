import { icons } from "@/consonants.js";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

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
      <View style={styles.header}>
        <Pressable onPress={stopCurrentMediaAndGoHome}>
          <Image source={icons.left_circle} style={{ width: 40, height: 40 }} />
        </Pressable>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{header}</Text>
          <Text style={styles.subtitle}>тамгасы</Text>
        </View>

        <View style={{ width: 40, height: 40 }} />
      </View>

      {/* Inline progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}></View>
        <View style={styles.progressBarContainer}>
          <View
            style={[styles.progressBar, { width: `${progressPercent}%` }]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    backgroundColor: "#0B503D",
    height: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "flex-end",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: "800",
    fontSize: 32,
    lineHeight: 41,
    color: "#000000",
  },
  subtitle: {
    color: "#000000",
    fontWeight: "400",
    fontSize: 20,
    lineHeight: 27,
  },
  progressContainer: {
    width: "100%",
    paddingTop: 7,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  progressText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 0,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#000",
    borderRadius:0,
  },
});

export default HeaderForLessonMinimal;
