# Arabic Learning App - Sound & Notifications Guide

## 🔊 Interface Sound System

### Overview

The app now includes interface sound effects that play when users interact with buttons throughout the application.

### How it works

- Sound effects are controlled by a global setting in `Settings` screen
- When enabled, a "click" sound plays on button presses
- Sound setting is stored in AsyncStorage and persists across app sessions
- By default, sounds are **enabled**

### Implementation

All interactive elements (buttons, pressables) now use the `playInterfaceSound()` utility function from `utils/soundUtils.ts`:

```typescript
import { playInterfaceSound } from "@/utils/soundUtils";

// In your onPress handler:
onPress={async () => {
  await playInterfaceSound();
  // ... rest of your logic
}}
```

### Files with Sound Integration

- ✅ `app/index.tsx` - Main screen buttons
- ✅ `app/settings.tsx` - All settings actions
- ✅ `app/alphabet.tsx` - Navigation
- ✅ `app/allLessons.tsx` - Lesson selection
- ✅ `app/lesson/[lessonName]/[sceneId].tsx` - Lesson controls
- ✅ `app/test/[letter]/[sceneId].tsx` - Test interactions
- ✅ `components/Footer.tsx` - Tab navigation
- ✅ `components/forLesson/Footer.tsx` - Lesson navigation

---

## 🔔 Notification System

### Overview

The app includes a daily notification system to motivate users to continue learning Arabic and studying the Quran.

### Features

- **3 Daily Notifications**: Scheduled at 9:00 AM, 2:00 PM, and 7:00 PM
- **Multi-language Support**: Notifications adapt to the app's interface language (English, Russian, Kyrgyz)
- **Motivational Messages**: 10 unique messages per language encouraging Quran study
- **User Control**: Can be enabled/disabled in Settings

### Notification Messages (samples)

- 🌟 "Continue your journey to understanding the language of the Quran"
- ✨ "Every step brings you closer to reading the Holy Quran"
- 🤲 "Allah's knowledge is infinite - keep learning!"
- 📚 "Practice makes perfect - continue your Arabic lessons today"
- 💫 "The best of you are those who learn the Quran and teach it"

### How to Test Notifications

#### Option 1: Use Test Button (Recommended)

1. Open the app
2. Go to **Settings**
3. Enable **Notifications** toggle
4. Tap the **🔔 Test Notification** button
5. A notification will appear immediately

#### Option 2: Wait for Scheduled Time

Notifications are automatically scheduled for:

- 9:00 AM (Morning motivation)
- 2:00 PM (Afternoon reminder)
- 7:00 PM (Evening encouragement)

### Implementation Details

#### Main Files

- `utils/notificationUtils.ts` - Core notification logic
- `app/settings.tsx` - User interface for notification controls
- `app/_layout.tsx` - Initialization on app start
- `components/LanguageContext.tsx` - Updates notifications on language change

#### Key Functions

```typescript
// Request notification permissions
await requestNotificationPermissions();

// Schedule daily notifications (3x per day)
await scheduleDailyNotifications();

// Send immediate test notification
await sendTestNotification();

// Enable/disable notifications
await setNotificationStatus(true / false);

// Update notifications when language changes
await updateNotificationsForLanguageChange();
```

#### Translations

All notification messages are stored in locale files:

- `locales/en.json` - English
- `locales/ru.json` - Russian (default)
- `locales/kg.json` - Kyrgyz

### Permissions

#### Android

- Added `NOTIFICATIONS` permission in `app.json`
- Creates notification channel "Daily Learning Reminders"

#### iOS

- Requests permission on first notification enable
- No additional configuration needed

### Data Storage

- Notification preference: `AsyncStorage.notificationsEnabled`
- By default: **enabled** (true)

### Technical Notes

- Uses `expo-notifications` package
- Notifications persist after app restart
- Language-specific messages based on `AsyncStorage.language`
- All notifications are local (no server required)

---

## 🧪 Testing Guide

### Test Interface Sounds

1. Go to Settings
2. Toggle "Sound" on/off
3. Try pressing any button in the app
4. Sound should play when enabled, silent when disabled

### Test Notifications

1. Go to Settings
2. Enable "Notifications"
3. Tap "🔔 Test Notification"
4. Check your notification center (pull down from top)
5. You should see the notification appear

### Test Language-Specific Notifications

1. Change app language in Settings (English/Russian/Kyrgyz)
2. Send a test notification
3. Notification should appear in the selected language

---

## 📝 Configuration

### Changing Notification Schedule

Edit `utils/notificationUtils.ts`:

```typescript
const notificationTimes = [
  { hour: 9, minute: 0 }, // Morning
  { hour: 14, minute: 0 }, // Afternoon
  { hour: 19, minute: 0 }, // Evening
];
```

### Adding More Notification Messages

Edit locale files (`locales/en.json`, `locales/ru.json`, `locales/kg.json`):

```json
{
  "notification11": "Your new message here! 🌙",
  "notification12": "Another motivational message ✨"
}
```

Then update `utils/notificationUtils.ts` to include new messages in the array.

### Changing Sound Effect

Replace `assets/audios/click.mp3` with your own sound file (keep the same name).

---

## 🐛 Troubleshooting

### Notifications Not Appearing?

1. Check device notification settings
2. Ensure app has notification permission
3. Check that notifications are enabled in Settings
4. Try sending a test notification

### No Sound on Button Press?

1. Check that sound is enabled in Settings
2. Verify device volume is not muted
3. Check that `assets/audios/click.mp3` exists

### Notifications in Wrong Language?

1. The app uses the interface language setting
2. Change language in Settings
3. Notifications will update automatically

---

## 📦 Dependencies

```json
{
  "expo-notifications": "latest",
  "expo-av": "latest",
  "@react-native-async-storage/async-storage": "latest"
}
```

---

## 🎯 Future Improvements

- [ ] Custom notification sounds
- [ ] Configurable notification times
- [ ] Streak tracking (days in a row)
- [ ] Achievement notifications
- [ ] Weekly progress summaries

---

Made with ❤️ for Arabic and Quran learners worldwide 🕌
