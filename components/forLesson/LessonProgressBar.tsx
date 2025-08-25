import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface LessonProgressBarProps {
  currentScene: number;
  totalScenes: number;
}

const LessonProgressBar: React.FC<LessonProgressBarProps> = ({
  currentScene,
  totalScenes,
}) => {
  const progressPercent = (currentScene / totalScenes) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progressText}>Прогресс урока</Text>
        <Text style={styles.progressText}>
          {currentScene}/{totalScenes}
        </Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
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
    borderRadius: 999,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FF6B35",
    borderRadius: 999,
  },
});

export default LessonProgressBar;
