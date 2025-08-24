import React, { useState, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Image,
  Animated,
  Easing,
  Platform,
  Dimensions
} from 'react-native';
import { useLanguage, languages } from '@/components/LanguageContext';

const FLAG_ICONS = {
  en: require('@/assets/icons/english_flag.png'),
  ru: require('@/assets/icons/russian_flag.png'),
  kg: require('@/assets/icons/kyrgyz_flag.png'),
};

const LanguageDropdown = () => {
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
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
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 250,
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
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
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
      Animated.timing(slideAnim, {
        toValue: 0,
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
    ]).start(async () => {
      setIsDropdownOpen(false);
      await changeLanguage(languageCode);
    });
  };

  const availableLanguages = languages.filter(lang => lang.code !== currentLanguage);

  // Интерполяция для анимации
  const slideInterpolation = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0]
  });

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('language')}</Text>

      <TouchableOpacity
        onPress={toggleDropdown}
        style={styles.languageButton}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          <Image 
            source={FLAG_ICONS[currentLanguage as keyof typeof FLAG_ICONS]} 
            style={styles.flagIcon} 
            resizeMode="contain"
          />
          <Text style={styles.buttonText}>
            {currentLanguageData?.nativeName || t('selectLanguage')}
          </Text>
        </View>
        <Animated.Text style={[styles.arrow, { transform: [{ rotate: rotateInterpolation }] }]}>
          ▼
        </Animated.Text>
      </TouchableOpacity>

      {isDropdownOpen && (
        <Animated.View 
          style={[
            styles.dropdown, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideInterpolation }]
            }
          ]}
        >
          {availableLanguages.map((language) => (
            <TouchableOpacity
              key={language.code}
              onPress={() => handleLanguageSelect(language.code)}
              style={styles.languageOption}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <Image 
                  source={FLAG_ICONS[language.code as keyof typeof FLAG_ICONS]} 
                  style={styles.flagIcon} 
                  resizeMode="contain"
                />
                <Text style={styles.optionText}>
                  {language.nativeName}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
    paddingBottom: 0,
    zIndex: 1000,
  },
  title: {
    fontSize: 23,
    color: '#000',
    textAlign: 'left',
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Seymour One',
  },
  languageButton: {
    width: '150px',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B35',
    zIndex: 10,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginLeft: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Seymour One',
  },
  arrow: {
    color: '#FF6B35',
    fontSize: 16,
  },
  flagIcon: {
    width: 24,
    height: 18,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#FF6B35',
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  languageOption: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: '#f8f8f8',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {

    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginLeft: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Seymour One',
  },
});

export default LanguageDropdown;