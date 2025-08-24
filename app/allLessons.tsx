import { path } from "@/lessonRelated.js";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AllLessons = () => {
  const router = useRouter();

  const handleLessonSelect = async (
    lessonKey: string,
    letter: string,
    index: number
  ) => {
    try {
      // Сохраняем выбранный урок в AsyncStorage
      const lessonData = {
        lessonKey,
        letter,
        index: index + 1,
      };
      await AsyncStorage.setItem("currentLesson", JSON.stringify(lessonData));

      // Возвращаемся на главную страницу
      router.push("/");
    } catch (error) {
      console.error("Error saving lesson:", error);
      // В случае ошибки все равно переходим на главную
      router.push("/");
    }
  };

  const renderLessonCard = ({ item, index }: { item: any; index: number }) => {
    const lessonKey = Object.keys(item)[0];
    const letter = item[lessonKey];

    return (
      <TouchableOpacity
        className="bg-orange rounded-[25px] p-6 m-2 items-center justify-center min-h-[120px] flex-1 max-w-[45%]"
        onPress={() => {
          handleLessonSelect(lessonKey, letter, index);
        }}
        style={{
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Text className="text-white font-semibold text-[16px] mb-2 text-center">
          Letter {index + 1}
        </Text>
        <Text className="text-white font-bold text-[28px] font-noto text-center">
          {letter}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-white text-[24px] font-bold">
          All Lessons
        </Text>
        <View className="w-8" />
      </View>

      <View className="flex-1 px-4">
        <FlatList
          data={path}
          renderItem={renderLessonCard}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 120, // space for bottom navigation
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default AllLessons;
