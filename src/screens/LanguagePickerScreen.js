import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../i18n/translations';
import { colors, spacing, radius } from '../utils/theme';

export default function LanguagePickerScreen() {
  const { setLanguage } = useLanguage();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Text style={styles.logo}>
          Gigs<Text style={{ color: colors.accent }}>Profit</Text>
        </Text>
        <Text style={styles.title}>Choose your language</Text>
        <Text style={styles.sub}>Elige tu idioma · اختر لغتك</Text>

        <View style={styles.list}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={styles.option}
              onPress={() => setLanguage(lang.code)}
              activeOpacity={0.8}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <View style={styles.optionText}>
                <Text style={styles.optionNative}>{lang.nativeLabel}</Text>
                <Text style={styles.optionLabel}>{lang.label}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 32,
    letterSpacing: -1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 36,
    textAlign: 'center',
  },
  list: { width: '100%', gap: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 18,
    gap: 16,
  },
  flag: { fontSize: 28 },
  optionText: { flex: 1 },
  optionNative: { fontSize: 17, fontWeight: '800', color: colors.text },
  optionLabel: { fontSize: 12, color: colors.muted, marginTop: 2 },
  arrow: { fontSize: 22, color: colors.accent, fontWeight: '700' },
});
