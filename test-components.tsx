// Test file to check component imports
import React from "react";
import { View } from "react-native";
import LessonProgressBar from "./components/forLesson/LessonProgressBar";

const TestComponent = () => {
  return (
    <View>
      <LessonProgressBar currentScene={5} totalScenes={15} />
    </View>
  );
};

export default TestComponent;
