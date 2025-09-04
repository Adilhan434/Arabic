// Daily motivational hadiths about learning/reciting the Qur'an.
// Texts are widely available and treated as public domain (religious texts).
// Keep each hadith concise so it fits existing UI layout.

export type Hadith = {
  arabic: string;
  english: string;
  source?: string; // Reference (e.g., Bukhari, Muslim)
};

// Single hadith (fixed) per request
export const hadith: Hadith = {
  arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
  english: "The best of you are those who learn the Qur'an and teach it.",
  source: "Bukhari",
};

export function getTodayHadith(): Hadith {
  return hadith;
}

export default hadith;
