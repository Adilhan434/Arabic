import { useLanguage } from "@/components/LanguageContext";
import { useTheme } from "@/components/ThemeContext";
import { playInterfaceSound } from "@/utils/soundUtils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Letter {
  name: string;
  isolated: string;
  initial: string;
  medial: string;
  final: string;
  transliteration: string;
}

const arabicAlphabet: Letter[] = [
  {
    name: "Alif",
    isolated: "ا",
    initial: "ا",
    medial: "ـا",
    final: "ـا",
    transliteration: "a",
  },
  {
    name: "Ba",
    isolated: "ب",
    initial: "بـ",
    medial: "ـبـ",
    final: "ـب",
    transliteration: "b",
  },
  {
    name: "Ta",
    isolated: "ت",
    initial: "تـ",
    medial: "ـتـ",
    final: "ـت",
    transliteration: "t",
  },
  {
    name: "Tha",
    isolated: "ث",
    initial: "ثـ",
    medial: "ـثـ",
    final: "ـث",
    transliteration: "th",
  },
  {
    name: "Jim",
    isolated: "ج",
    initial: "جـ",
    medial: "ـجـ",
    final: "ـج",
    transliteration: "j",
  },
  {
    name: "Ha",
    isolated: "ح",
    initial: "حـ",
    medial: "ـحـ",
    final: "ـح",
    transliteration: "h",
  },
  {
    name: "Kha",
    isolated: "خ",
    initial: "خـ",
    medial: "ـخـ",
    final: "ـخ",
    transliteration: "kh",
  },
  {
    name: "Dal",
    isolated: "د",
    initial: "د",
    medial: "ـد",
    final: "ـد",
    transliteration: "d",
  },
  {
    name: "Dhal",
    isolated: "ذ",
    initial: "ذ",
    medial: "ـذ",
    final: "ـذ",
    transliteration: "dh",
  },
  {
    name: "Ra",
    isolated: "ر",
    initial: "ر",
    medial: "ـر",
    final: "ـر",
    transliteration: "r",
  },
  {
    name: "Zay",
    isolated: "ز",
    initial: "ز",
    medial: "ـز",
    final: "ـز",
    transliteration: "z",
  },
  {
    name: "Sin",
    isolated: "س",
    initial: "سـ",
    medial: "ـسـ",
    final: "ـس",
    transliteration: "s",
  },
  {
    name: "Shin",
    isolated: "ش",
    initial: "شـ",
    medial: "ـشـ",
    final: "ـش",
    transliteration: "sh",
  },
  {
    name: "Sad",
    isolated: "ص",
    initial: "صـ",
    medial: "ـصـ",
    final: "ـص",
    transliteration: "s",
  },
  {
    name: "Dad",
    isolated: "ض",
    initial: "ضـ",
    medial: "ـضـ",
    final: "ـض",
    transliteration: "d",
  },
  {
    name: "Ta (emphatic)",
    isolated: "ط",
    initial: "طـ",
    medial: "ـطـ",
    final: "ـط",
    transliteration: "t",
  },
  {
    name: "Dha (emphatic)",
    isolated: "ظ",
    initial: "ظـ",
    medial: "ـظـ",
    final: "ـظ",
    transliteration: "dh",
  },
  {
    name: "Ayn",
    isolated: "ع",
    initial: "عـ",
    medial: "ـعـ",
    final: "ـع",
    transliteration: "a",
  },
  {
    name: "Ghayn",
    isolated: "غ",
    initial: "غـ",
    medial: "ـغـ",
    final: "ـغ",
    transliteration: "gh",
  },
  {
    name: "Fa",
    isolated: "ف",
    initial: "فـ",
    medial: "ـفـ",
    final: "ـف",
    transliteration: "f",
  },
  {
    name: "Qaf",
    isolated: "ق",
    initial: "قـ",
    medial: "ـقـ",
    final: "ـق",
    transliteration: "q",
  },
  {
    name: "Kaf",
    isolated: "ك",
    initial: "كـ",
    medial: "ـكـ",
    final: "ـك",
    transliteration: "k",
  },
  {
    name: "Lam",
    isolated: "ل",
    initial: "لـ",
    medial: "ـلـ",
    final: "ـل",
    transliteration: "l",
  },
  {
    name: "Mim",
    isolated: "م",
    initial: "مـ",
    medial: "ـمـ",
    final: "ـم",
    transliteration: "m",
  },
  {
    name: "Nun",
    isolated: "ن",
    initial: "نـ",
    medial: "ـنـ",
    final: "ـن",
    transliteration: "n",
  },
  {
    name: "Ha (light)",
    isolated: "ه",
    initial: "هـ",
    medial: "ـهـ",
    final: "ـه",
    transliteration: "h",
  },
  {
    name: "Waw",
    isolated: "و",
    initial: "و",
    medial: "ـو",
    final: "ـو",
    transliteration: "w",
  },
  {
    name: "Ya",
    isolated: "ي",
    initial: "يـ",
    medial: "ـيـ",
    final: "ـي",
    transliteration: "y",
  },
];

const Alphabet = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const renderLetterCard = (letter: Letter, index: number) => {
    return (
      <View key={index} style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <View style={{ ...styles.cardShadow, backgroundColor: theme.colors.card, borderRadius: 16, padding: 16 }}>
          {/* Header: Letter name and transliteration */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder }}>
            <View>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.font, marginBottom: 4 }}>
                {letter.name}
              </Text>
              <Text style={{ fontSize: 14, color: theme.colors.fontSecondary }}>
                {letter.transliteration}
              </Text>
            </View>
            <View style={{ backgroundColor: theme.colors.accent + '20', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 4 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.font }}>#{index + 1}</Text>
            </View>
          </View>

          {/* Letter forms grid */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 12, color: theme.colors.fontSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                {t("isolated")}
              </Text>
              <View style={{ backgroundColor: theme.colors.background, borderRadius: 8, width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 30, fontWeight: 'bold', color: theme.colors.font }}>
                  {letter.isolated}
                </Text>
              </View>
            </View>

            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 12, color: theme.colors.fontSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                {t("initial")}
              </Text>
              <View style={{ backgroundColor: theme.colors.background, borderRadius: 8, width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 30, fontWeight: 'bold', color: theme.colors.font }}>
                  {letter.initial}
                </Text>
              </View>
            </View>

            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 12, color: theme.colors.fontSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                {t("medial")}
              </Text>
              <View style={{ backgroundColor: theme.colors.background, borderRadius: 8, width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 30, fontWeight: 'bold', color: theme.colors.font }}>
                  {letter.medial}
                </Text>
              </View>
            </View>

            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 12, color: theme.colors.fontSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                {t("final")}
              </Text>
              <View style={{ backgroundColor: theme.colors.background, borderRadius: 8, width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 30, fontWeight: 'bold', color: theme.colors.font }}>
                  {letter.final}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16, backgroundColor: theme.colors.card, borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity
            onPress={async () => {
              await playInterfaceSound();
              router.back();
            }}
            style={{ marginRight: 12, padding: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.font} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.font }}>
              {t("arabicAlphabet")}
            </Text>
          </View>
          <View style={{ backgroundColor: theme.colors.accent, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.font }}>28</Text>
          </View>
        </View>
        <Text style={{ fontSize: 30, fontWeight: 'bold', textAlign: 'center', color: theme.colors.font }}>
          الأبجدية العربية
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16, paddingBottom: 100 }}
      >
        {arabicAlphabet.map((letter, index) =>
          renderLetterCard(letter, index)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});

export default Alphabet;
