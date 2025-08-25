import AsyncStorage from "@react-native-async-storage/async-storage";

export interface LessonProgress {
  lessonKey: string;
  currentScene: number;
  totalScenes: number;
  percentage: number;
}

export const getLessonProgress = async (lessonKey: string): Promise<number> => {
  try {
    const progressKey = `lessonProgress_${lessonKey}`;
    const savedProgress = await AsyncStorage.getItem(progressKey);
    return savedProgress ? parseInt(savedProgress, 10) : 0;
  } catch (error) {
    console.error("Error loading lesson progress:", error);
    return 0;
  }
};

export const getCurrentScene = async (lessonKey: string): Promise<number> => {
  try {
    const progressKey = `lessonProgress_${lessonKey}`;
    const savedProgress = await AsyncStorage.getItem(progressKey);
    return savedProgress ? parseInt(savedProgress, 10) : 1;
  } catch (error) {
    console.error("Error loading lesson progress:", error);
    return 1;
  }
};

export const setLessonProgress = async (
  lessonKey: string,
  sceneNumber: number
): Promise<void> => {
  try {
    const progressKey = `lessonProgress_${lessonKey}`;
    const currentProgress = await getCurrentScene(lessonKey);
    const maxScene = Math.max(sceneNumber, currentProgress);
    await AsyncStorage.setItem(progressKey, maxScene.toString());
  } catch (error) {
    console.error("Error saving lesson progress:", error);
  }
};

export const getLessonProgressPercentage = async (
  lessonKey: string,
  totalScenes: number = 15
): Promise<number> => {
  const currentScene = await getLessonProgress(lessonKey);
  if (currentScene === 0) {
    return 0;
  }
  if (currentScene >= totalScenes) {
    return 100;
  }
  return Math.round((currentScene / totalScenes) * 100);
};

export const getAllLessonsProgress = async (
  lessonKeys: string[]
): Promise<LessonProgress[]> => {
  const progressList: LessonProgress[] = [];

  for (const lessonKey of lessonKeys) {
    const currentScene = await getLessonProgress(lessonKey);
    const totalScenes = 15;
    const percentage =
      currentScene >= totalScenes
        ? 100
        : Math.round((currentScene / totalScenes) * 100);

    progressList.push({
      lessonKey,
      currentScene,
      totalScenes,
      percentage,
    });
  }

  return progressList;
};
