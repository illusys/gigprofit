import React, { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../utils/theme';

const FEATURES = [
  { icon: 'calculator-outline', color: '#00e5a0', title: 'Real profit, not just earnings', body: 'Deducts fuel, depreciation, insurance, tires, oil, and maintenance on every trip.' },
  { icon: 'analytics-outline', color: '#7c6aff', title: 'Compare every platform', body: 'Ranks Uber, Lyft, DoorDash, and more by actual net $/hr — not gross.' },
  { icon: 'receipt-outline', color: '#ff6b35', title: 'Tax snapshot built in', body: 'Self-employment tax + IRS mileage deduction calculated automatically.' },
  { icon: 'flash-outline', color: '#ffb830', title: 'AI profit coach', body: 'Claude AI gives you 2 specific actions to improve your numbers this week.' },
];

const TESTIMONIALS = [
  {
    quote: 'I thought DoorDash was my best earner. Turns out Uber nets me $4 more per hour after costs.',
    name: 'Marcus T.',
    location: 'Dallas TX',
  },
  {
    quote: 'Found out my cost per mile was $0.94. I was barely breaking even on short trips. Now I decline anything under 4 miles.',
    name: 'Priya S.',
    location: 'Austin TX',
  },
];

export default function LandingScreen({ onGetStarted, onSignIn }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fadeAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const pulseColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.accent, '#7c6aff'],
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Nav */}
      <View style={styles.nav}>
        <Text style={styles.navLogo}>
          <Text style={{ color: colors.text }}>Gigs</Text>
          <Text style={{ color: colors.accent }}>Profit</Text>
        </Text>
        <TouchableOpacity style={styles.navSignIn} onPress={onSignIn} activeOpacity={0.8}>
          <Text style={styles.navSignInText}>Sign in</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.heroHead}>Your gross pay</Text>
          <Animated.Text style={[styles.heroHeadItalic, { color: pulseColor }]}>
            isn't your income.
          </Animated.Text>
          <Text style={styles.heroSub}>
            GigsProfit calculates your real take-home after fuel, depreciation, insurance, maintenance, and taxes — across every platform you drive.
          </Text>
          <TouchableOpacity style={styles.heroCta} onPress={onGetStarted} activeOpacity={0.85}>
            <Text style={styles.heroCtaText}>Start tracking for free</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroSecondary} onPress={onSignIn} activeOpacity={0.7}>
            <Text style={styles.heroSecondaryText}>Sign in →</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          {[
            { value: '$0.67', label: 'IRS mileage rate tracked', color: colors.accent },
            { value: '9', label: 'cost categories calculated', color: '#7c6aff' },
            { value: '∞', label: 'platforms supported', color: '#ff6b35' },
          ].map((s, i) => (
            <View key={s.label} style={[styles.statCol, i > 0 && styles.statColBorder]}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Problem */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>THE REAL MATH</Text>
          <Text style={styles.sectionHead}>Apps show what you earned.{'\n'}We show what you made.</Text>
          <View style={styles.compareRow}>
            <View style={styles.compareCardNeutral}>
              <Text style={styles.compareLabel}>Gross earnings</Text>
              <Text style={styles.compareValueNeutral}>$847</Text>
            </View>
            <View style={styles.compareCardReal}>
              <Text style={styles.compareLabel}>Real take-home</Text>
              <Text style={styles.compareValueReal}>$491</Text>
            </View>
          </View>
          <View style={styles.compareNote}>
            <Text style={styles.compareNoteText}>$356 in costs you didn't see.</Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>WHAT GIGSPROFIT DOES</Text>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: f.color + '18', borderColor: f.color + '30' }]}>
                <Ionicons name={f.icon} size={22} color={f.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureBody}>{f.body}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Testimonials */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>FROM DRIVERS USING IT</Text>
          {TESTIMONIALS.map((t) => (
            <View key={t.name} style={styles.testimonialCard}>
              <Text style={styles.testimonialQuoteMark}>"</Text>
              <Text style={styles.testimonialQuote}>{t.quote}</Text>
              <View style={styles.testimonialAuthorRow}>
                <View style={styles.testimonialAvatar}>
                  <Text style={styles.testimonialAvatarText}>{t.name[0]}</Text>
                </View>
                <View>
                  <Text style={styles.testimonialName}>{t.name}</Text>
                  <Text style={styles.testimonialLocation}>{t.location}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Final CTA */}
        <View style={styles.finalCta}>
          <Text style={styles.finalHead}>Know your real number.</Text>
          <Text style={styles.finalSub}>Free to use. No subscription required.</Text>
          <TouchableOpacity style={styles.heroCta} onPress={onGetStarted} activeOpacity={0.85}>
            <Text style={styles.heroCtaText}>Create free account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroSecondary} onPress={onSignIn} activeOpacity={0.7}>
            <Text style={styles.heroSecondaryText}>Sign in to existing account →</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Works with Uber, Lyft, DoorDash, Instacart, Amazon Flex, and any other platform.
          </Text>
          <Text style={styles.footerDisclaimer}>
            Tax estimates are for informational purposes only. Consult a tax professional for advice specific to your situation.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 32 },

  // Nav
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navLogo: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  navSignIn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  navSignInText: { color: colors.text, fontWeight: '700', fontSize: 13 },

  // Hero
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: 48,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroHead: {
    fontSize: 38,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: 44,
  },
  heroHeadItalic: {
    fontSize: 38,
    fontWeight: '900',
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: 44,
    marginBottom: 20,
  },
  heroSub: {
    fontSize: 16,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 340,
  },
  heroCta: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 15,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 14,
    width: '100%',
    maxWidth: 320,
  },
  heroCtaText: { color: '#000', fontWeight: '900', fontSize: 16 },
  heroSecondary: { paddingVertical: 8 },
  heroSecondaryText: { color: colors.accent, fontWeight: '700', fontSize: 14 },

  // Stats
  statsStrip: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  statCol: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statColBorder: { borderLeftWidth: 1, borderLeftColor: colors.border },
  statValue: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: colors.muted, textAlign: 'center', marginTop: 4, lineHeight: 14 },

  // Sections
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: 36,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.muted,
    letterSpacing: 2,
    marginBottom: 12,
  },
  sectionHead: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: 24,
  },

  // Compare
  compareRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  compareCardNeutral: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 18,
    alignItems: 'center',
  },
  compareCardReal: {
    flex: 1,
    backgroundColor: '#ff6b3510',
    borderWidth: 1,
    borderColor: '#ff6b3540',
    borderRadius: radius.lg,
    padding: 18,
    alignItems: 'center',
  },
  compareLabel: { fontSize: 11, color: colors.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  compareValueNeutral: { fontSize: 32, fontWeight: '900', color: colors.text },
  compareValueReal: { fontSize: 32, fontWeight: '900', color: '#ff6b35' },
  compareNote: {
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'center',
  },
  compareNoteText: { color: colors.textSub, fontSize: 14, fontWeight: '600' },

  // Features
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 20,
  },
  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 3 },
  featureBody: { fontSize: 13, color: colors.muted, lineHeight: 19 },

  // Testimonials
  testimonialCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 12,
  },
  testimonialQuoteMark: { fontSize: 40, color: colors.accent, fontWeight: '900', lineHeight: 36, marginBottom: 8 },
  testimonialQuote: { fontSize: 14, color: colors.textSub, fontStyle: 'italic', lineHeight: 22, marginBottom: 16 },
  testimonialAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  testimonialAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent + '22',
    borderWidth: 1,
    borderColor: colors.accent + '44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialAvatarText: { color: colors.accent, fontWeight: '900', fontSize: 15 },
  testimonialName: { color: colors.text, fontWeight: '700', fontSize: 13 },
  testimonialLocation: { color: colors.muted, fontSize: 11 },

  // Final CTA
  finalCta: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 48,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  finalHead: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  finalSub: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 28,
  },

  // Footer
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: 24,
    gap: 8,
  },
  footerText: { fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18 },
  footerDisclaimer: { fontSize: 11, color: colors.border, textAlign: 'center', lineHeight: 16 },
});
