import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing, radius } from '../utils/theme';

const FEATURE_ICONS = [
  { icon: 'calculator-outline', color: '#00e5a0', tk: 'landing_feature1' },
  { icon: 'analytics-outline', color: '#7c6aff', tk: 'landing_feature2' },
  { icon: 'receipt-outline', color: '#ff6b35', tk: 'landing_feature3' },
  { icon: 'flash-outline', color: '#ffb830', tk: 'landing_feature4' },
];

export default function LandingScreen({ onGetStarted, onSignIn }) {
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'GigsProfit — Real Profit Calculator for Gig Drivers';
    }
  }, []);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fadeAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: false }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: false }),
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

  const rtl = isRTL ? { flexDirection: 'row-reverse' } : {};
  const textAlign = isRTL ? 'right' : 'center';
  const textAlignLeft = isRTL ? 'right' : 'left';

  const STATS = [
    { value: t('landing_stat1_value'), label: t('landing_stat1_label'), color: '#00e5a0' },
    { value: t('landing_stat2_value'), label: t('landing_stat2_label'), color: '#7c6aff' },
    { value: t('landing_stat3_value'), label: t('landing_stat3_label'), color: '#ff6b35' },
  ];

  const TESTIMONIALS = [
    { quote: t('landing_testimonial1_quote'), name: t('landing_testimonial1_name'), location: t('landing_testimonial1_location') },
    { quote: t('landing_testimonial2_quote'), name: t('landing_testimonial2_name'), location: t('landing_testimonial2_location') },
  ];

  const FAQS = [
    { q: t('landing_faq1_q'), a: t('landing_faq1_a') },
    { q: t('landing_faq2_q'), a: t('landing_faq2_a') },
    { q: t('landing_faq3_q'), a: t('landing_faq3_a') },
    { q: t('landing_faq4_q'), a: t('landing_faq4_a') },
    { q: t('landing_faq5_q'), a: t('landing_faq5_a') },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Nav */}
      <View style={[styles.nav, rtl]}>
        <Text style={styles.navLogo}>
          <Text style={{ color: colors.text }}>Gigs</Text>
          <Text style={{ color: colors.accent }}>Profit</Text>
        </Text>
        <TouchableOpacity style={styles.navSignIn} onPress={onSignIn} activeOpacity={0.8}>
          <Text style={styles.navSignInText}>{t('landing_nav_signin')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={[styles.heroHead, { textAlign }]}>{t('landing_hero_head')}</Text>
          <Animated.Text style={[styles.heroHeadItalic, { color: pulseColor, textAlign }]}>
            {t('landing_hero_italic')}
          </Animated.Text>
          <Text style={[styles.heroSub, { textAlign }]}>
            {t('landing_hero_sub')}
          </Text>
          <TouchableOpacity style={styles.heroCta} onPress={onGetStarted} activeOpacity={0.85}>
            <Text style={styles.heroCtaText}>{t('landing_cta_start')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroSecondary} onPress={onSignIn} activeOpacity={0.7}>
            <Text style={styles.heroSecondaryText}>{t('landing_signin_arrow')}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          {STATS.map((s, i) => (
            <View key={i} style={[styles.statCol, i > 0 && styles.statColBorder]}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { textAlign }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Problem */}
        <View style={styles.section}>
          <Text style={[styles.sectionEyebrow, { textAlign: textAlignLeft }]}>{t('landing_problem_eyebrow')}</Text>
          <Text style={[styles.sectionHead, { textAlign: textAlignLeft }]}>{t('landing_problem_head')}</Text>
          <View style={[styles.compareRow, rtl]}>
            <View style={styles.compareCardNeutral}>
              <Text style={styles.compareLabel}>{t('landing_compare_gross')}</Text>
              <Text style={styles.compareValueNeutral}>$847</Text>
            </View>
            <View style={styles.compareCardReal}>
              <Text style={styles.compareLabel}>{t('landing_compare_real')}</Text>
              <Text style={styles.compareValueReal}>$491</Text>
            </View>
          </View>
          <View style={styles.compareNote}>
            <Text style={[styles.compareNoteText, { textAlign: textAlignLeft }]}>
              {t('landing_compare_note')}
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionEyebrow, { textAlign: textAlignLeft }]}>{t('landing_features_eyebrow')}</Text>
          {FEATURE_ICONS.map((f) => (
            <View key={f.tk} style={[styles.featureRow, rtl]}>
              <View style={[styles.featureIcon, { backgroundColor: f.color + '18', borderColor: f.color + '30' }]}>
                <Ionicons name={f.icon} size={22} color={f.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { textAlign: textAlignLeft }]}>{t(`${f.tk}_title`)}</Text>
                <Text style={[styles.featureBody, { textAlign: textAlignLeft }]}>{t(`${f.tk}_body`)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Testimonials */}
        <View style={styles.section}>
          <Text style={[styles.sectionEyebrow, { textAlign: textAlignLeft }]}>{t('landing_testimonials_eyebrow')}</Text>
          {TESTIMONIALS.map((item) => (
            <View key={item.name} style={styles.testimonialCard}>
              <Text style={styles.testimonialQuoteMark}>"</Text>
              <Text style={[styles.testimonialQuote, { textAlign: textAlignLeft }]}>{item.quote}</Text>
              <View style={[styles.testimonialAuthorRow, rtl]}>
                <View style={styles.testimonialAvatar}>
                  <Text style={styles.testimonialAvatarText}>{item.name[0]}</Text>
                </View>
                <View>
                  <Text style={[styles.testimonialName, { textAlign: textAlignLeft }]}>{item.name}</Text>
                  <Text style={[styles.testimonialLocation, { textAlign: textAlignLeft }]}>{item.location}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* FAQ accordion */}
        <View style={styles.section}>
          <Text style={[styles.sectionEyebrow, { textAlign: textAlignLeft }]}>{t('landing_faq_eyebrow')}</Text>
          <Text style={[styles.sectionHead, { textAlign: textAlignLeft }]}>{t('landing_faq_head')}</Text>
          {FAQS.map((item, i) => {
            const open = openFaq === i;
            return (
              <TouchableOpacity
                key={i}
                style={styles.faqItem}
                onPress={() => setOpenFaq(open ? null : i)}
                activeOpacity={0.8}
              >
                <View style={[styles.faqHeader, rtl]}>
                  <Text style={[styles.faqQuestion, { textAlign: textAlignLeft }]}>{item.q}</Text>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.accent}
                  />
                </View>
                {open && <Text style={[styles.faqAnswer, { textAlign: textAlignLeft }]}>{item.a}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Final CTA */}
        <View style={styles.finalCta}>
          <Text style={[styles.finalHead, { textAlign }]}>{t('landing_final_head')}</Text>
          <Text style={[styles.finalSub, { textAlign }]}>{t('landing_final_sub')}</Text>
          <TouchableOpacity style={styles.heroCta} onPress={onGetStarted} activeOpacity={0.85}>
            <Text style={styles.heroCtaText}>{t('landing_cta_create')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroSecondary} onPress={onSignIn} activeOpacity={0.7}>
            <Text style={styles.heroSecondaryText}>{t('landing_signin_existing')}</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { textAlign }]}>{t('landing_footer_platforms')}</Text>
          <Text style={[styles.footerDisclaimer, { textAlign }]}>{t('landing_footer_disclaimer')}</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 32 },

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
  statValue: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: colors.muted, textAlign: 'center', marginTop: 4, lineHeight: 14 },

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
  },
  compareNoteText: { color: colors.textSub, fontSize: 13, fontWeight: '500', lineHeight: 20 },

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

  faqItem: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 10,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  faqQuestion: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text, lineHeight: 20 },
  faqAnswer: { fontSize: 13, color: colors.muted, lineHeight: 20, marginTop: 12 },

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

  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: 24,
    gap: 8,
  },
  footerText: { fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18 },
  footerDisclaimer: { fontSize: 11, color: colors.border, textAlign: 'center', lineHeight: 16 },
});
