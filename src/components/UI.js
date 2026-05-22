import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../utils/theme';

// ─── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent, style }) {
  const ac = accent || colors.text;
  return (
    <View style={[styles.statCard, style]}>
      <View style={[styles.statGlow, { backgroundColor: ac }]} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: ac }]}>{value}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

// ─── MiniProgressBar ──────────────────────────────────────────────────────────
export function MiniBar({ label, value, max, color, right }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <View style={styles.barWrap}>
      <View style={styles.barRow}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>{right || value}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: pct + '%', backgroundColor: color || colors.accent }]} />
      </View>
    </View>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style, gradient }) {
  if (gradient) {
    return (
      <LinearGradient colors={gradient} style={[styles.card, style]}>
        {children}
      </LinearGradient>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

// ─── SectionTitle ─────────────────────────────────────────────────────────────
export function SectionTitle({ children, style }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

// ─── PrimaryButton ────────────────────────────────────────────────────────────
export function PrimaryButton({ label, onPress, loading: busy, style, textStyle, color }) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={busy}
      style={[styles.primaryBtn, { backgroundColor: color || colors.accent }, style]}
    >
      {busy ? (
        <ActivityIndicator color="#000" />
      ) : (
        <Text style={[styles.primaryBtnText, textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── GhostButton ──────────────────────────────────────────────────────────────
export function GhostButton({ label, onPress, style, color }) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.ghostBtn, { borderColor: color || colors.border }, style]}
    >
      <Text style={[styles.ghostBtnText, { color: color || colors.muted }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────
export function Row({ children, style }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ label, color, bg }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg || colors.surface2, borderColor: color || colors.border }]}>
      <Text style={[styles.badgeText, { color: color || colors.muted }]}>{label}</Text>
    </View>
  );
}

// ─── AlertBanner ──────────────────────────────────────────────────────────────
export function AlertBanner({ type = 'warn', title, body }) {
  const map = {
    warn: { border: colors.warn, bg: 'rgba(255,184,48,0.08)', icon: '⚡' },
    danger: { border: colors.danger, bg: 'rgba(255,77,106,0.08)', icon: '⚠' },
    success: { border: colors.accent, bg: 'rgba(0,229,160,0.08)', icon: '✓' },
    info: { border: colors.accent3, bg: 'rgba(124,106,255,0.08)', icon: 'ℹ' },
  };
  const t = map[type] || map.info;
  return (
    <View style={[styles.alertBanner, { borderColor: t.border, backgroundColor: t.bg }]}>
      <Text style={[styles.alertTitle, { color: t.border }]}>{t.icon}  {title}</Text>
      {body ? <Text style={styles.alertBody}>{body}</Text> : null}
    </View>
  );
}

// ─── LoadingScreen ─────────────────────────────────────────────────────────────
export function LoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <Text style={styles.loadingLogo}>Gig<Text style={{ color: colors.accent }}>Profit</Text></Text>
      <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  statCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    overflow: 'hidden',
    flex: 1,
  },
  statGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 70,
    height: 70,
    borderRadius: 35,
    opacity: 0.07,
  },
  statLabel: {
    fontSize: 10,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  statSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 3,
  },
  barWrap: { marginBottom: 12 },
  barRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  barLabel: { fontSize: 12, color: colors.muted },
  barValue: { fontSize: 12, color: colors.text, fontWeight: '600' },
  barTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  primaryBtn: {
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  ghostBtn: {
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  ghostBtnText: { fontWeight: '600', fontSize: 14 },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  badge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  alertBanner: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  alertTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  alertBody: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1,
  },
});
