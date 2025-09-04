import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Letter {
  name: string;
  isolated: string;
  initial: string;
  medial: string;
  final: string;
  transliteration: string;
}

const arabicAlphabet: Letter[] = [
  { name: 'Alif', isolated: 'ا', initial: 'ا', medial: 'ـا', final: 'ـا', transliteration: 'a' },
  { name: 'Ba', isolated: 'ب', initial: 'بـ', medial: 'ـبـ', final: 'ـب', transliteration: 'b' },
  { name: 'Ta', isolated: 'ت', initial: 'تـ', medial: 'ـتـ', final: 'ـت', transliteration: 't' },
  { name: 'Tha', isolated: 'ث', initial: 'ثـ', medial: 'ـثـ', final: 'ـث', transliteration: 'th' },
  { name: 'Jim', isolated: 'ج', initial: 'جـ', medial: 'ـجـ', final: 'ـج', transliteration: 'j' },
  { name: 'Ha', isolated: 'ح', initial: 'حـ', medial: 'ـحـ', final: 'ـح', transliteration: 'h' },
  { name: 'Kha', isolated: 'خ', initial: 'خـ', medial: 'ـخـ', final: 'ـخ', transliteration: 'kh' },
  { name: 'Dal', isolated: 'د', initial: 'د', medial: 'ـد', final: 'ـد', transliteration: 'd' },
  { name: 'Dhal', isolated: 'ذ', initial: 'ذ', medial: 'ـذ', final: 'ـذ', transliteration: 'dh' },
  { name: 'Ra', isolated: 'ر', initial: 'ر', medial: 'ـر', final: 'ـر', transliteration: 'r' },
  { name: 'Zay', isolated: 'ز', initial: 'ز', medial: 'ـز', final: 'ـز', transliteration: 'z' },
  { name: 'Sin', isolated: 'س', initial: 'سـ', medial: 'ـسـ', final: 'ـس', transliteration: 's' },
  { name: 'Shin', isolated: 'ش', initial: 'شـ', medial: 'ـشـ', final: 'ـش', transliteration: 'sh' },
  { name: 'Sad', isolated: 'ص', initial: 'صـ', medial: 'ـصـ', final: 'ـص', transliteration: 's' },
  { name: 'Dad', isolated: 'ض', initial: 'ضـ', medial: 'ـضـ', final: 'ـض', transliteration: 'd' },
  { name: 'Ta (emphatic)', isolated: 'ط', initial: 'طـ', medial: 'ـطـ', final: 'ـط', transliteration: 't' },
  { name: 'Dha (emphatic)', isolated: 'ظ', initial: 'ظـ', medial: 'ـظـ', final: 'ـظ', transliteration: 'dh' },
  { name: 'Ayn', isolated: 'ع', initial: 'عـ', medial: 'ـعـ', final: 'ـع', transliteration: 'a' },
  { name: 'Ghayn', isolated: 'غ', initial: 'غـ', medial: 'ـغـ', final: 'ـغ', transliteration: 'gh' },
  { name: 'Fa', isolated: 'ف', initial: 'فـ', medial: 'ـفـ', final: 'ـف', transliteration: 'f' },
  { name: 'Qaf', isolated: 'ق', initial: 'قـ', medial: 'ـقـ', final: 'ـق', transliteration: 'q' },
  { name: 'Kaf', isolated: 'ك', initial: 'كـ', medial: 'ـكـ', final: 'ـك', transliteration: 'k' },
  { name: 'Lam', isolated: 'ل', initial: 'لـ', medial: 'ـلـ', final: 'ـل', transliteration: 'l' },
  { name: 'Mim', isolated: 'م', initial: 'مـ', medial: 'ـمـ', final: 'ـم', transliteration: 'm' },
  { name: 'Nun', isolated: 'ن', initial: 'نـ', medial: 'ـنـ', final: 'ـن', transliteration: 'n' },
  { name: 'Ha (light)', isolated: 'ه', initial: 'هـ', medial: 'ـهـ', final: 'ـه', transliteration: 'h' },
  { name: 'Waw', isolated: 'و', initial: 'و', medial: 'ـو', final: 'ـو', transliteration: 'w' },
  { name: 'Ya', isolated: 'ي', initial: 'يـ', medial: 'ـيـ', final: 'ـي', transliteration: 'y' },
];

const Alphabet = () => {
  const router = useRouter();

  const renderTableHeader = () => {
    return (
      <View className="bg-primary rounded-lg mx-4 mb-3 p-3">
        <View className="flex-row">
          <Text className="text-white font-bold text-sm flex-1 text-center">Name</Text>
          <Text className="text-white font-bold text-sm flex-1 text-center">Isolated</Text>
          <Text className="text-white font-bold text-sm flex-1 text-center">Initial</Text>
          <Text className="text-white font-bold text-sm flex-1 text-center">Medial</Text>
          <Text className="text-white font-bold text-sm flex-1 text-center">Final</Text>
        </View>
      </View>
    );
  };

  const renderLetterRow = (letter: Letter, index: number) => {
    const isEven = index % 2 === 0;
    return (
      <TouchableOpacity
        key={index}
        className={`mx-4 mb-1 rounded-lg ${isEven ? 'bg-white' : 'bg-gray-50'}`}
        style={{
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
          paddingHorizontal: 12,
          paddingVertical: 12,
        }}
      >
        <View className="flex-row items-center">
          {/* Name column */}
          <View className="flex-1 items-center">
            <Text className="text-primary font-semibold text-xs text-center">{letter.name}</Text>
            <Text className="text-gray-500 text-xs text-center mt-1">{letter.transliteration}</Text>
          </View>
          
          {/* Isolated column */}
          <View className="flex-1 items-center">
            <View className="bg-primary/10 rounded-lg w-10 h-10 items-center justify-center">
              <Text className="text-gray-500 text-xl font-bold">{letter.isolated}</Text>
            </View>
          </View>
          
          {/* Initial column */}
          <View className="flex-1 items-center">
            <View className="bg-primary/10 rounded-lg w-10 h-10 items-center justify-center">
              <Text className="text-primary text-lg font-bold">{letter.initial}</Text>
            </View>
          </View>
          
          {/* Medial column */}
          <View className="flex-1 items-center">
            <View className="bg-primary/10 rounded-lg w-10 h-10 items-center justify-center">
              <Text className="text-primary text-lg font-bold">{letter.medial}</Text>
            </View>
          </View>
          
          {/* Final column */}
          <View className="flex-1 items-center">
            <View className="bg-primary/10 rounded-lg w-10 h-10 items-center justify-center">
              <Text className="text-primary text-lg font-bold">{letter.final}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Header */}
      <View className="px-4 pt-2 pb-6">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1" />
        </View>
        
        <View className="items-center">
          <Text className="text-white text-[32px] font-bold mb-2">
            الأبجدية العربية
          </Text>
          <Text className="text-white/80 text-lg main-font">
            Arabic Alphabet
          </Text>
          <View className="bg-orange/20 rounded-full px-4 py-1 mt-2">
            <Text className="text-orange font-semibold text-sm">28 Letters</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 120,
            paddingTop: 20,
          }}
          style={{
            backgroundColor: "white",
            borderRadius: 10,
            marginHorizontal: 16,
            marginTop: 0,
          }}
        >
          {renderTableHeader()}
          <View>
            {arabicAlphabet.map((letter, index) => renderLetterRow(letter, index))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Alphabet;
