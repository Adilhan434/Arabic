import { languages, useLanguage } from '@/components/LanguageContext';
import { useTheme } from '@/components/ThemeContext';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const FLAG_ICONS = {
  en: require('@/assets/icons/english_flag.png'),
  ru: require('@/assets/icons/russian_flag.png'),
  kg: require('@/assets/icons/kyrgyz_flag.png'),
};

const LanguageDropdown = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const { theme } = useTheme();
  const colors = theme.colors;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const currentLanguageData = languages.find(lang => lang.code === currentLanguage);

  const toggleDropdown = () => {
    if (isDropdownOpen) {
      // Анимация закрытия
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true
        })
      ]).start(() => setIsDropdownOpen(false));
    } else {
      setIsDropdownOpen(true);
      // Анимация открытия
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.ease,
          useNativeDriver: true
        })
      ]).start();
    }
  };

  const handleLanguageSelect = async (languageCode: string) => {
    // Анимация закрытия после выбора
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true
      })
    ]).start(async () => {
      setIsDropdownOpen(false);
      await changeLanguage(languageCode);
    });
  };

  const availableLanguages = languages.filter(lang => lang.code !== currentLanguage);

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={toggleDropdown}
        style={[styles.languageButton, { 
          backgroundColor: colors.card, 
          borderColor: colors.accent 
        }]}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          <Image 
            source={FLAG_ICONS[currentLanguage as keyof typeof FLAG_ICONS]} 
            style={styles.flagIcon} 
            resizeMode="contain"
          />
          <Text style={[styles.buttonText, { color: colors.font }]}>
            {currentLanguageData?.nativeName || 'Select Language'}
          </Text>
        </View>
        <Animated.Text style={[
          styles.arrow, 
          { color: colors.accent, transform: [{ rotate: rotateInterpolation }] }
        ]}>
          ▼
        </Animated.Text>
      </TouchableOpacity>

      <Modal
        visible={isDropdownOpen}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => toggleDropdown()}
        >
          <Animated.View 
            style={[
              styles.dropdown, 
              { 
                backgroundColor: colors.card,
                borderColor: colors.accent,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            {availableLanguages.map((language) => (
              <TouchableOpacity
                key={language.code}
                onPress={() => handleLanguageSelect(language.code)}
                style={[styles.languageOption, { backgroundColor: colors.background }]}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Image 
                    source={FLAG_ICONS[language.code as keyof typeof FLAG_ICONS]} 
                    style={styles.flagIcon} 
                    resizeMode="contain"
                  />
                  <Text style={[styles.optionText, { color: colors.font }]}>
                    {language.nativeName}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  languageButton: {
    width: 150,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  arrow: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  flagIcon: {
    width: 24,
    height: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdown: {
    borderRadius: 16,
    padding: 8,
    borderWidth: 2,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  languageOption: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});

export default LanguageDropdown;