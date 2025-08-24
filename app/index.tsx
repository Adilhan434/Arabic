import { icons, texts } from "@/consonants.js";
import Footer from "@/components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


const orange = "#FF6B35";

export default function Index() {
  const router = useRouter();
  const [currentLesson, setCurrentLesson] = useState({
    lessonKey: "alifBa",
    letter: "ا ب",
    index: 1,
  });

  // Загружаем сохраненный прогресс при загрузке экрана
  useFocusEffect(
    useCallback(() => {
      const loadCurrentLesson = async () => {
        try {
          const savedLesson = await AsyncStorage.getItem("currentLesson");
          if (savedLesson) {
            const parsed = JSON.parse(savedLesson);
            setCurrentLesson(parsed);
          }
        } catch (error) {
          console.error("Error loading current lesson:", error);
        }
      };

      loadCurrentLesson();
    }, [])
  );

  return (
    <View className="flex-1 items-center justify-center pb-[100px] bg-primary">
      {/* book and welcome text */}
      <View className="relative flex items-center  w-[345px] h-[347px]">
        <Image source={icons.main} className="w-[172px] h-[172px]" />
        <View className="relative -top-6">
          {/* Shadow element for Android offset effect */}
          <View
            className="absolute w-[345px] h-[189px] bg-black/25 rounded-[38px]"
            style={{
              top: 10,
              left: 10,
              zIndex: 1,
            }}
          />
          <View
            style={[styles.shadow, { borderRadius: 38, zIndex: 2 }]}
            className="w-[345px] h-[189px] justify-around items-center overflow-hidden relative"
          >
            <LinearGradient
              colors={[orange, "#0B503D"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
            <Text className="font-['Seymour One'] mt-3 text-secondary font-normal text-[51px] ">
              {texts.mainArabic}
            </Text>
            <Text className="main-font text-center mb-[23px] text-secondary text-[20px]">
              {texts.mainEnglish}
            </Text>
          </View>
        </View>
      </View>

      {/* statistics and other buttons */}
      <View className="bg-secondary w-[345px] mt-[30px] gap-[20px] justify-around h-[261px] rounded-[25px]">
        {/* progress and current letter */}
        <View className="flex-row  justify-around mx-[25px] h-[66px] items-end">
          <View className="flex flex-col gap-[6px] items-start">
            <Text className="main-font text-[14px] font-semibold">
              Continue learning arabic
            </Text>
            {/* here will be dynamic parameters */}
            <Text className="main-font text-[20px] font-semibold">
              Lesson {currentLesson.index}: {currentLesson.letter}
            </Text>
            <ProgressBar percent={50} />
          </View>
          <Pressable
            className="w-[124px] h-[50px] bg-orange rounded-[38px] items-center justify-center"
            onPress={() => {
              router.push(`/lesson/${currentLesson.lessonKey}/1`);
            }}
          >
            <Text className="text-white font-semibold  text-[20px] main-font">
              continue
            </Text>
          </Pressable>
        </View>

        <View className="h-[129px] mb-[21px] mx-[25px] items-start">
          <Text className="main-font text-[24px] font-semibold">
            Lorem ipsum
          </Text>
          <View className="flex-row flex justify-between mt-[23px] w-full">
            <View className="w-[89px] h-[87px] bg-orange rounded-[25px] justify-center items-center">
              <Image className="" source={icons.book}></Image>
              <Text className="main-font text-[12px] font-semibold text-secondary">
                Alphabet
              </Text>
            </View>

            <TouchableOpacity
              onPress={async () => {
                try {
                  // Устанавливаем первый урок как текущий
                  const lessonData = {
                    lessonKey: "alifBa",
                    letter: "ا ب",
                    index: 1,
                  };
                  await AsyncStorage.setItem(
                    "currentLesson",
                    JSON.stringify(lessonData)
                  );
                  setCurrentLesson(lessonData);
                  router.push("/allLessons");
                } catch (error) {
                  console.error("Error saving lesson:", error);
                  router.push("/allLessons");
                }
              }}
              className="w-[89px] h-[87px] bg-orange rounded-[25px] justify-center items-center"
            >
              <Image
                className="w-[41px] h-[41px]"
                source={icons.all_lessons}
              ></Image>
              <Text className="main-font text-[12px] font-semibold text-secondary">
                All lessons
              </Text>
            </TouchableOpacity>

            <View className="w-[89px] h-[87px] bg-orange rounded-[25px] justify-center items-center">
              <Image
                className="w-[41px] h-[41px]"
                source={icons.approval}
              ></Image>
              <Text className="main-font text-[12px] font-semibold text-secondary">
                Tests
              </Text>
            </View>
          </View>
        </View>
      </View>
      <Footer></Footer>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    // iOS shadow properties
    shadowColor: "#000000",
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    // Android shadow property (smaller elevation since we have manual shadow)
    elevation: 5,
  },
});

const ProgressBar: React.FC<{ percent: number }> = ({ percent }) => {
  const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <View
      className="w-[120px] h-[9px] rounded-full overflow-hidden"
      style={{
        backgroundColor: "#e5e7eb",
      }}
    >
      <View className="h-full bg-orange" style={{ width: `${safePercent}%` }} />
    </View>
  );
};
