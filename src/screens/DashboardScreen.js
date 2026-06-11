import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { computeStats, fmt, fmtMi, profitColor } from '../utils/calculations';
import { api } from '../services/api';
import { colors, spacing, radius } from '../utils/theme';
import {
  StatCard,
  Card,
  SectionTitle,
  AlertBanner,
  Divider,
  Row,
  Badge,
} from '../components/UI';

const PERIODS = ['day', 'week', 'month', 'year'];

export default function DashboardScreen() {
  const { trips, vehicle, taxSettings, period, setPeriod, user } = useApp();
  const [aiTip, setAiTip] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const stats = useMemo(
    () => computeStats(trips, vehicle, period, taxSettings),
    [trips, vehicle, period, taxSettings]
  );

  // 7-day chart data
  const chartData = useMemo(() => {
    const days = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days[key] = { gross: 0, cost: 0, label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2) };
    }
    Object.entries(stats.byDay).forEach(([date, v]) => {
      if (days[date]) {
        days[date].gross = v.gross;
        days[date].cost = v.cost;
      }
    });
    return Object.values(days);
  }, [stats.byDay]);

  const maxBar = Math.max(...chartData.map((d) => d.gross), 1);

  async function getAiTip() {
    setAiLoading(true);
    setAiTip('');
    try {
      const summary = `
Gig driver weekly stats:
- Gross: ${fmt(stats.gross)}, Expenses: ${fmt(stats.cost)}, Net: ${fmt(stats.net)}
- Miles: ${fmtMi(stats.miles)}, Hours: ${stats.hours?.toFixed(1)}h
- Cost/mile: ${fmt(stats.cpm)}, Earn/mile: ${fmt(stats.epm)}
- Effective hourly: ${fmt(stats.hourlyRate)}/hr
- Platforms: ${Object.keys(stats.byPlatform).join(', ')}
- Trips: ${stats.totalTrips}
- Vehicle MPG: ${vehicle.mpg}, Fuel: $${vehicle.fuelPrice}/gal
`;
      const data = await api.aiCoach(`You are a financial coach for gig drivers. Give exactly 2 short, specific, actionable tips to improve profitability based on this data. Be direct, practical, no fluff. Keep total response under 120 words.\n\n${summary}`);
      setAiTip(data.tip || 'No tips available.');
    } catch {
      setAiTip('Could not connect. Check your internet connection.');
    }
    setAiLoading(false);
  }

  const netColor = profitColor(stats.net);
  const margin = stats.gross > 0 ? ((stats.net / stats.gross) * 100).toFixed(0) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>
            Gigs<Text style={{ color: colors.accent }}>Profit</Text>
          </Text>
          {user ? (
            <Text style={styles.logoSub}>Hey, {user.firstName} 👋</Text>
          ) : (
            <Text style={styles.logoSub}>EARNINGS INTELLIGENCE</Text>
          )}
        </View>
        <View style={[styles.netBadge, { borderColor: netColor }]}>
          <Text style={styles.netLabel}>NET</Text>
          <Text style={[styles.netValue, { color: netColor }]}>{fmt(stats.net)}</Text>
        </View>
      </View>

      {/* Period Tabs */}
      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodTab, period === p && styles.periodTabActive]}
            onPress={() => setPeriod(p)}
            activeOpacity={0.75}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Grid */}
        <Row style={{ gap: 8, marginBottom: 8 }}>
          <StatCard label="Gross" value={fmt(stats.gross)} accent={colors.text} />
          <StatCard label="Expenses" value={fmt(stats.cost)} accent={colors.danger} />
        </Row>
        <Row style={{ gap: 8, marginBottom: 8 }}>
          <StatCard
            label="Net Profit"
            value={fmt(stats.net)}
            accent={netColor}
            sub={`${margin}% margin`}
          />
          <StatCard
            label="Hourly Rate"
            value={fmt(stats.hourlyRate)}
            sub={`${stats.hours?.toFixed(1)}h worked`}
          />
        </Row>

        {/* Per-Mile */}
        <Card style={styles.card}>
          <SectionTitle>Per-Mile Breakdown</SectionTitle>
          <Row style={{ justifyContent: 'space-around' }}>
            {[
              { l: 'Earned/mi', v: fmt(stats.epm), c: colors.accent },
              { l: 'Cost/mi', v: fmt(stats.cpm), c: colors.danger },
              { l: 'Net/mi', v: fmt(stats.epm - stats.cpm), c: profitColor(stats.epm - stats.cpm) },
            ].map((item) => (
              <View key={item.l} style={{ alignItems: 'center', flex: 1 }}>
                <Text style={[styles.perMileVal, { color: item.c }]}>{item.v}</Text>
                <Text style={styles.perMileLabel}>{item.l}</Text>
              </View>
            ))}
          </Row>
          <Divider />
          <Row style={{ justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.perMileVal}>{fmtMi(stats.miles)}</Text>
              <Text style={styles.perMileLabel}>Total Miles</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.perMileVal}>{stats.totalTrips}</Text>
              <Text style={styles.perMileLabel}>Trips</Text>
            </View>
          </Row>
        </Card>

        {/* 7-Day Bar Chart */}
        <Card style={styles.card}>
          <SectionTitle>7-Day Earnings vs Costs</SectionTitle>
          <View style={styles.chartContainer}>
            {chartData.map((day, i) => {
              const gPct = (day.gross / maxBar) * 100;
              const cPct = (day.cost / maxBar) * 100;
              return (
                <View key={i} style={styles.barGroup}>
                  <View style={styles.bars}>
                    <View style={[styles.bar, { height: `${Math.max(gPct, 2)}%`, backgroundColor: colors.accent }]} />
                    <View style={[styles.bar, { height: `${Math.max(cPct, 2)}%`, backgroundColor: colors.danger, opacity: 0.75 }]} />
                  </View>
                  <Text style={styles.barLabel}>{day.label}</Text>
                </View>
              );
            })}
          </View>
          <Row style={{ justifyContent: 'center', gap: 20, marginTop: 8 }}>
            <Row style={{ gap: 6 }}>
              <View style={[styles.legend, { backgroundColor: colors.accent }]} />
              <Text style={styles.legendText}>Earnings</Text>
            </Row>
            <Row style={{ gap: 6 }}>
              <View style={[styles.legend, { backgroundColor: colors.danger, opacity: 0.75 }]} />
              <Text style={styles.legendText}>Costs</Text>
            </Row>
          </Row>
        </Card>

        {/* Tax Snapshot */}
        <Card style={[styles.card, { borderColor: colors.warn }]}>
          <SectionTitle>🧾 Tax Snapshot</SectionTitle>
          <Row style={{ gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.taxLabel}>Est. Tax Liability</Text>
              <Text style={[styles.taxValue, { color: colors.warn }]}>{fmt(stats.taxEst)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.taxLabel}>IRS Mileage Deduction</Text>
              <Text style={[styles.taxValue, { color: colors.accent }]}>{fmt(stats.mileageDeduction)}</Text>
            </View>
          </Row>
          <Text style={styles.taxNote}>{Math.round((stats.taxSettings?.mileageRate || 0) * 100)}¢/mi mileage rate · configurable tax estimate</Text>
        </Card>

        {/* Alerts */}
        {stats.net < 0 && (
          <AlertBanner
            type="danger"
            title="Operating at a Loss"
            body={`You need ${fmt(Math.abs(stats.net))} more to break even. Review low-margin platforms.`}
          />
        )}
        {stats.cpm > 0.85 && stats.net >= 0 && (
          <AlertBanner
            type="warn"
            title="High Cost Per Mile"
            body={`Your cost/mi is ${fmt(stats.cpm)}. Improving fuel efficiency could save significantly.`}
          />
        )}
        {stats.net >= 0 && stats.cpm <= 0.85 && (
          <AlertBanner
            type="success"
            title={`Profitable · ${margin}% Margin`}
            body="Great work! Keep tracking to maintain performance and catch slow periods early."
          />
        )}

        {/* AI Coach */}
        <Card style={[styles.card, { borderColor: colors.accent3 }]}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>✦ AI Profit Coach</Text>
              <Text style={styles.aiSub}>Powered by Claude AI</Text>
            </View>
            <TouchableOpacity
              onPress={getAiTip}
              disabled={aiLoading}
              style={[styles.aiBtn, aiLoading && { opacity: 0.6 }]}
              activeOpacity={0.8}
            >
              <Text style={styles.aiBtnText}>{aiLoading ? '...' : 'Get Tips'}</Text>
            </TouchableOpacity>
          </Row>
          {aiLoading && (
            <Row style={{ gap: 8, paddingVertical: 8 }}>
              <ActivityIndicator color={colors.accent3} size="small" />
              <Text style={{ color: colors.muted, fontSize: 13 }}>Analyzing your data…</Text>
            </Row>
          )}
          {aiTip ? (
            <>
              <Divider />
              <Text style={styles.aiTip}>{aiTip}</Text>
            </>
          ) : !aiLoading ? (
            <Text style={{ color: colors.muted, fontSize: 13 }}>
              Tap "Get Tips" for personalized profitability recommendations.
            </Text>
          ) : null}
        </Card>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  logo: { fontSize: 24, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  logoSub: { fontSize: 9, color: colors.muted, letterSpacing: 1.5, fontWeight: '600', marginTop: 1 },
  netBadge: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  netLabel: { fontSize: 9, color: colors.muted, letterSpacing: 1.5, fontWeight: '700' },
  netValue: { fontSize: 17, fontWeight: '900', letterSpacing: -0.3 },
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: 6,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.surface2,
  },
  periodTabActive: { backgroundColor: colors.accent },
  periodText: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'capitalize' },
  periodTextActive: { color: '#000' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },
  card: { marginBottom: 8 },
  perMileVal: { fontSize: 16, fontWeight: '800', color: colors.text },
  perMileLabel: { fontSize: 10, color: colors.muted, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.8 },
  chartContainer: {
    flexDirection: 'row',
    height: 90,
    alignItems: 'flex-end',
    gap: 6,
    marginBottom: 4,
  },
  barGroup: { flex: 1, alignItems: 'center', height: '100%' },
  bars: { flex: 1, width: '100%', flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar: { flex: 1, borderRadius: 3, minHeight: 2 },
  barLabel: { fontSize: 9, color: colors.muted, marginTop: 4, fontWeight: '600' },
  legend: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 11, color: colors.muted },
  taxLabel: { fontSize: 11, color: colors.muted, marginBottom: 4 },
  taxValue: { fontSize: 20, fontWeight: '900' },
  taxNote: { fontSize: 10, color: colors.muted, marginTop: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
  aiSub: { fontSize: 11, color: colors.muted, marginTop: 1 },
  aiBtn: {
    backgroundColor: colors.accent3,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  aiBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  aiTip: { fontSize: 13, color: colors.textSub, lineHeight: 20, marginTop: 8 },
});
