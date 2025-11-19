import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Массивы мотивационных уведомлений на трех языках
const notificationMessages = {
  en: [
    "Continue your journey to understanding the language of the Quran 🌟",
    "Every step brings you closer to reading the Holy Quran ✨",
    "Allah's knowledge is infinite - keep learning! 🤲",
    "Practice makes perfect - continue your Arabic lessons today 📚",
    "The best of you are those who learn the Quran and teach it 💫",
    "Take a few minutes to practice Arabic today 🕌",
    "Keep your learning streak alive! Every lesson counts 🌙",
    "Knowledge is light - illuminate your path with Arabic 💡",
    "Your daily Arabic practice is waiting for you! 📖",
    "Small steps lead to great achievements - continue learning! 🎯",
  ],
  ru: [
    "Продолжайте свой путь к пониманию языка Корана 🌟",
    "Каждый шаг приближает вас к чтению Священного Корана ✨",
    "Знания Аллаха бесконечны - продолжайте учиться! 🤲",
    "Практика делает совершенным - продолжайте уроки арабского сегодня 📚",
    "Лучшие из вас те, кто изучает Коран и учит ему 💫",
    "Уделите несколько минут практике арабского сегодня 🕌",
    "Поддерживайте свою серию обучения! Каждый урок важен 🌙",
    "Знание - это свет - озарите свой путь арабским 💡",
    "Ваша ежедневная практика арабского ждет вас! 📖",
    "Маленькие шаги ведут к большим достижениям - продолжайте учиться! 🎯",
  ],
  kg: [
    "Куран тилин түшүнүү жолунузду улантыңыз 🌟",
    "Ар бир кадам сизди Ыйык Куранды окууга жакындатат ✨",
    "Аллахтын билимдери чексиз - үйрөнүүнү улантыңыз! 🤲",
    "Практика мыкты кылат - бүгүн араб сабактарын улантыңыз 📚",
    "Силердин эң жакшыларыңыз Куранды үйрөнгөндөр жана үйрөткөндөр 💫",
    "Бүгүн араб тилин практикалоого бир нече мүнөт бөлүңүз 🕌",
    "Үйрөнүү сериялыңызды сактаңыз! Ар бир сабак маанилүү 🌙",
    "Билим - бул жарык - араб тили менен жолуңузду жарык кылыңыз 💡",
    "Күндөлүк араб тилин практикалоо сизди күтүп жатат! 📖",
    "Кичинекей кадамдар чоң жетишкендиктерге алып келет - үйрөнүүнү улантыңыз! 🎯",
  ],
};

const notificationTitles = {
  en: "Time to learn Arabic! 📖",
  ru: "Время изучать арабский! 📖",
  kg: "Араб тилин үйрөнүү убактысы! 📖",
};

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Запрашивает разрешения на отправку уведомлений
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
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
