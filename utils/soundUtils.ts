import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";

let soundObject: Audio.Sound | null = null;

/**
 * Воспроизводит звук интерфейса, если эта функция включена в настройках
 */
export async function playInterfaceSound(): Promise<void> {
  try {
    // Проверяем, включен ли звук в настройках
    const soundEnabled = await AsyncStorage.getItem("soundEnabled");

    // По умолчанию звук включен, если настройка не установлена
    if (soundEnabled === null || JSON.parse(soundEnabled) === true) {
      // Если уже есть загруженный звук, выгружаем его
      if (soundObject) {
        await soundObject.unloadAsync();
        soundObject = null;
      }

      // Создаем и воспроизводим новый звук
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/audios/click.mp3")
      );

      soundObject = sound;
      await sound.playAsync();

      // Выгружаем звук после воспроизведения
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          if (soundObject === sound) {
            soundObject = null;
          }
        }
      });
    }
  } catch (error) {
    console.log("Error playing interface sound:", error);
  }
}

/**
 * Выгружает звуковой объект (для очистки ресурсов)
 */
export async function unloadInterfaceSound(): Promise<void> {
  try {
    if (soundObject) {
      await soundObject.unloadAsync();
      soundObject = null;
    }
  } catch (error) {
    console.log("Error unloading interface sound:", error);
  }
}
