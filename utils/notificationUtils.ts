import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';
import { Platform } from "react-native";

// Проверяем, запущено ли приложение в Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Условный импорт expo-notifications только для нативных платформ и не в Expo Go
const Notifications = Platform.OS !== 'web' && !isExpoGo
  ? require('expo-notifications') 
  : null;

// Массивы мотивационных уведомлений на трех языках
const notificationMessages = {
  en: [
    "Master the Arabic letters today — the key to beautiful Quran recitation 🌟",
    "Every letter you perfect brings you closer to reciting Quran ✨",
    "Practice the articulation points (makhraj) — recite the Quran flawlessly 🤲",
    "Allah rewards every letter recited correctly — keep learning the alphabet 📚",
    "The best are those who learn the Quran and teach it — start with the letters 💫",
    "Spend a few minutes on Tajweed rules today — beautify your recitation 🕌",
    "Don't break your streak — master one more Arabic letter now! 🌙",
    "Perfect pronunciation is light — illuminate your Quran reading 💡",
    "Your daily letter and Tajweed practice awaits — recite like the Prophet 📖",
    "Small steps in alphabet mastery lead to perfect Tajweed 🎯",
    "Recite the Quran with measured recitation (Tartil) — practice Tajweed today 🕋",
    "Learn the letters properly — unlock the beauty of the Holy Quran ✨",
  ],
  ru: [
    "Освойте арабские буквы сегодня — стремитесь к красивому чтению Корана 🌟",
    "Каждая выученная буква приближает вас к чтению с Корана ✨",
    "Практикуйте махраджи букв — читайте Коран правильно 🤲",
    "Аллах награждает за каждую правильно произнесённую букву — учитесь алфавиту 📚",
    "Лучшие — те, кто изучает Коран и учит ему — не останавливайтесь 💫",
    "Уделите несколько минут правилам чтения Корана сегодня 🕌",
    "Не прерывайте серию — освойте ещё одну арабскую букву сейчас! 🌙",
    "Идеальное произношение — это свет — озарите своё чтение Корана 💡",
    "Ваша ежедневная практика букв и таджвида ждёт — читайте как Пророк 📖",
    "Маленькие шаги в алфавите ведут к совершенному чтению 🎯",
    "Читайте Коран таджвидом 🕋",
    "Учите буквы правильно — откройте красоту Священного Корана ✨",
  ],
  kg: [
    "Араб тамгаларын бүгүн өздөштүрүңүз — Куранды кооз окууга умтулунуз 🌟",
    "Ар бир кемчиликсиз үйрөнгөн тамга Куран окууга жакындатат ✨",
    "Тамгалардын туура айттуга машыгыңыз — Куранды кемчиликсиз окуңуз 🤲",
    "Аллах ар бир туура айтылган тамга үчүн сыйлык берет — тамгаларды үйрөнүңүз 📚",
    "Эң жакшылары — Куранды үйрөнгөндөр жана үйрөткөндөр — тамгалардан баштаңыз 💫",
    "Бүгүн Куран окуу эрежелерине бир нече мүнөт бөлүңүз — окууңузду кооздоңуз 🕌",
    "дагы бир тамганы өздөштүрүңүз! 🌙",
    "Куранды кемчиликсиз окунуз💡",
    "Күндөлүк тамга жана тажвид практиканы кечиктирбениз — Пайгамбардай окуңуз 📖",
    "Алфавиттеги кичинекей кадамдар кемчиликсиз Куран окууга алып барат 🎯",
    "Куранды кемчиликсиз менен окуңуз🕋",
    "Тамгаларды туура үйрөнүңүз — Ыйык Курандын сулуулугун ачыңыз ✨",
  ],
};

const notificationTitles = {
  en: "Time to learn Quran! 📖",
  ru: "Время изучать Коран! 📖",
  kg: "Куран үйрөнүү убактысы! 📖",
};

// Настройка обработчика уведомлений только для нативных платформ и не в Expo Go
if (Platform.OS !== 'web' && Notifications && !isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} else if (isExpoGo) {
  console.log('Notifications are disabled in Expo Go. Use a development build for full notification support.');
}

/**
 * Запрашивает разрешения на отправку уведомлений
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    // Уведомления не поддерживаются на веб платформе или без expo-notifications
    if (Platform.OS === 'web' || !Notifications) {
      console.log('Notifications are not supported on this platform');
      return false;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("daily-reminders", {
        name: "Daily Learning Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF6B35",
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}

/**
 * Получает текущий язык приложения
 */
async function getCurrentLanguage(): Promise<"en" | "ru" | "kg"> {
  try {
    const language = await AsyncStorage.getItem("language");
    if (language === "en" || language === "ru" || language === "kg") {
      return language;
    }
    return "ru"; // По умолчанию русский
  } catch (error) {
    console.error("Error getting current language:", error);
    return "ru";
  }
}

/**
 * Планирует ежедневные уведомления
 */
export async function scheduleDailyNotifications(): Promise<void> {
  try {
    // Проверяем платформу - уведомления не работают на веб или без expo-notifications
    if (Platform.OS === 'web' || !Notifications) {
      console.log('Notifications are not supported on this platform');
      return;
    }

    // Проверяем, включены ли уведомления
    const notificationsEnabled = await AsyncStorage.getItem(
      "notificationsEnabled"
    );
    if (notificationsEnabled === "false") {
      return;
    }

    // Отменяем все существующие уведомления
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Получаем текущий язык
    const language = await getCurrentLanguage();
    const messages = notificationMessages[language];
    const title = notificationTitles[language];

    // Планируем уведомления на разное время дня (9:00, 14:00, 19:00)
    const notificationTimes = [
      { hour: 9, minute: 0 }, // Утро
      { hour: 14, minute: 0 }, // День
      { hour: 19, minute: 0 }, // Вечер
    ];

    for (let i = 0; i < notificationTimes.length; i++) {
      const time = notificationTimes[i];
      const messageIndex = i % messages.length;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: messages[messageIndex],
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          hour: time.hour,
          minute: time.minute,
          repeats: true,
        },
      });
    }

    console.log("Daily notifications scheduled successfully");
  } catch (error) {
    console.error("Error scheduling daily notifications:", error);
  }
}

/**
 * Отменяет все запланированные уведомления
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    // Уведомления не поддерживаются на веб платформе или без expo-notifications
    if (Platform.OS === 'web' || !Notifications) {
      console.log('Notifications are not supported on this platform');
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("All notifications cancelled");
  } catch (error) {
    console.error("Error cancelling notifications:", error);
  }
}

/**
 * Проверяет статус уведомлений
 */
export async function getNotificationStatus(): Promise<boolean> {
  try {
    const notificationsEnabled = await AsyncStorage.getItem(
      "notificationsEnabled"
    );
    return notificationsEnabled !== "false";
  } catch (error) {
    console.error("Error getting notification status:", error);
    return true; // По умолчанию включено
  }
}

/**
 * Включает или выключает уведомления
 */
export async function setNotificationStatus(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem("notificationsEnabled", String(enabled));

    if (enabled) {
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        await scheduleDailyNotifications();
      }
    } else {
      await cancelAllNotifications();
    }
  } catch (error) {
    console.error("Error setting notification status:", error);
  }
}

/**
 * Обновляет уведомления при изменении языка
 */
export async function updateNotificationsForLanguageChange(): Promise<void> {
  try {
    const notificationsEnabled = await getNotificationStatus();
    if (notificationsEnabled) {
      await scheduleDailyNotifications();
    }
  } catch (error) {
    console.error("Error updating notifications for language change:", error);
  }
}

/**
 * Отправляет тестовое уведомление немедленно (для отладки)
 */
export async function sendTestNotification(): Promise<void> {
  try {
    // Уведомления не поддерживаются на веб платформе или без expo-notifications
    if (Platform.OS === 'web' || !Notifications) {
      console.log('Notifications are not supported on this platform');
      return;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log("Notification permissions not granted");
      return;
    }

    const language = await getCurrentLanguage();
    const messages = notificationMessages[language];
    const title = notificationTitles[language];

    // Отправляем первое сообщение из списка
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: messages[0],
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Отправляем немедленно
    });

    console.log("Test notification scheduled for 2 seconds from now");
  } catch (error) {
    console.error("Error sending test notification:", error);
  }
}
