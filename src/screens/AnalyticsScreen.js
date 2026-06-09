import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { computeStats, fmt, fmtMi, profitColor } from '../utils/calculations';
import { colors, spacing, radius } from '../utils/theme';
import { Card, SectionTitle, MiniBar, Divider, Row, AlertBanner } from '../components/UI';

const EXPENSE_COLORS = {
  fuel: '#ff6b35',
  dep: '#7c6aff',
  maint: '#ffb830',
  tire: '#5ddcff',
  oil: '#ff9966',
  ins: '#c084fc',
  loan: '#fb7185',
};

export default function AnalyticsScreen() {
  const { trips, vehicle, taxSettings, period } = useApp();

  const stats = useMemo(
    () => computeStats(trips, vehicle, period, taxSettings),
    [trips, vehicle, period, taxSettings]
  );

  const platformList = Object.entries(stats.byPlatform)
    .map(([name, v]) => ({
      name,
      ...v,
      net: v.gross - v.cost,
      margin: v.gross > 0 ? ((v.gross - v.cost) / v.gross) * 100 : 0,
      hourly: v.hours > 0 ? (v.gross - v.cost) / v.hours : 0,
    }))
    .sort((a, b) => b.net - a.net);

  const maxPlatformGross = Math.max(...platformList.map((p) => p.gross), 1);

  const expenses = [
    { key: 'fuel', label: 'Fuel', value: stats.expenses?.fuel || 0 },
    { key: 'dep', label: 'Depreciation', value: stats.expenses?.dep || 0 },
    { key: 'maint', label: 'Maintenance', value: stats.expenses?.maint || 0 },
    { key: 'tire', label: 'Tires', value: stats.expenses?.tire || 0 },
    { key: 'oil', label: 'Oil Changes', value: stats.expenses?.oil || 0 },
    { key: 'ins', label: 'Insurance', value: stats.expenses?.ins || 0 },
    ...(stats.expenses?.loan > 0
      ? [{ key: 'loan', label: 'Loan/Lease', value: stats.expenses.loan }]
      : []),
    ...(stats.expenses?.tolls > 0 ? [{ key: 'tolls', label: 'Tolls', value: stats.expenses.tolls }] : []),
    ...(stats.expenses?.parking > 0 ? [{ key: 'parking', label: 'Parking', value: stats.expenses.parking }] : []),
  ].sort((a, b) => b.value - a.value);

  const maxExpense = Math.max(...expenses.map((e) => e.value), 1);

  const margin = stats.gross > 0 ? ((stats.net / stats.gross) * 100).toFixed(1) : 0;

  // Daily trend for last 14 days
  const dailyTrend = useMemo(() => {
    const now = new Date();
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const v = stats.byDay[key] || { gross: 0, cost: 0, net: 0 };
      days.push({
        key,
        label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1),
        ...v,
      });
    }
    return days;
  }, [stats.byDay]);

  const maxTrend = Math.max(...dailyTrend.map((d) => Math.max(d.gross, d.cost)), 1);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.periodBadge}>
          <Text style={styles.periodBadgeText}>{period.toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Summary strip */}
        <View style={styles.summaryStrip}>
          {[
            { l: 'Trips', v: stats.totalTrips },
            { l: 'Miles', v: fmtMi(stats.miles) },
            { l: 'Hours', v: `${(stats.hours || 0).toFixed(1)}h` },
            { l: 'Margin', v: `${margin}%`, c: profitColor(stats.net) },
          ].map((item) => (
            <View key={item.l} style={styles.summaryItem}>
              <Text style={[styles.summaryVal, item.c && { color: item.c }]}>{item.v}</Text>
              <Text style={styles.summaryLabel}>{item.l}</Text>
            </View>
          ))}
        </View>

        {/* 14-day trend */}
        <Card>
          <SectionTitle>14-Day Trend</SectionTitle>
          <View style={styles.trendChart}>
            {dailyTrend.map((d, i) => {
              const gPct = (d.gross / maxTrend) * 100;
              const cPct = (d.cost / maxTrend) * 100;
              const isPos = d.net >= 0;
              return (
                <View key={i} style={styles.trendCol}>
                  <View style={styles.trendBars}>
                    <View style={[styles.trendBar, { height: `${Math.max(gPct, 2)}%`, backgroundColor: colors.accent }]} />
                    <View style={[styles.trendBar, { height: `${Math.max(cPct, 2)}%`, backgroundColor: colors.danger, opacity: 0.7 }]} />
                  </View>
                  <View style={[styles.trendDot, { backgroundColor: isPos ? colors.accent : colors.danger }]} />
                  <Text style={styles.trendLabel}>{d.label}</Text>
                </View>
              );
            })}
          </View>
          <Row style={{ justifyContent: 'center', gap: 20, marginTop: 6 }}>
            <Row style={{ gap: 6 }}>
              <View style={[styles.lgd, { backgroundColor: colors.accent }]} />
              <Text style={styles.lgdText}>Earnings</Text>
            </Row>
            <Row style={{ gap: 6 }}>
              <View style={[styles.lgd, { backgroundColor: colors.danger, opacity: 0.7 }]} />
              <Text style={styles.lgdText}>Costs</Text>
            </Row>
          </Row>
        </Card>

        {/* Platform Performance */}
        {platformList.length > 0 && (
          <Card>
            <SectionTitle>Platform Performance</SectionTitle>
            {platformList.map((p, i) => (
              <View key={p.name} style={[styles.platformRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 }]}>
                <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
                  <View>
                    <Text style={styles.platformName}>{p.name}</Text>
                    <Text style={styles.platformSub}>{p.trips} trips · {fmtMi(p.miles)} · {p.hours?.toFixed(1)}h</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.platformNet, { color: profitColor(p.net) }]}>{fmt(p.net)}</Text>
                    <Text style={styles.platformMargin}>{p.margin.toFixed(0)}% margin · {fmt(p.hourly)}/hr</Text>
                  </View>
                </Row>
                <MiniBar label="Gross" value={p.gross} max={maxPlatformGross} color={colors.accent} right={fmt(p.gross)} />
                <MiniBar label="Expenses" value={p.cost} max={maxPlatformGross} color={colors.danger} right={fmt(p.cost)} />
              </View>
            ))}
          </Card>
        )}

        {/* Expense Breakdown */}
        <Card>
          <SectionTitle>Expense Breakdown</SectionTitle>
          {expenses.map((e) => (
            <MiniBar
              key={e.key}
              label={e.label}
              value={e.value}
              max={maxExpense}
              color={EXPENSE_COLORS[e.key] || colors.accent}
              right={fmt(e.value)}
            />
          ))}
          <Divider />
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600' }}>Total Expenses</Text>
            <Text style={{ color: colors.danger, fontWeight: '800', fontSize: 13 }}>{fmt(stats.cost)}</Text>
          </Row>
        </Card>

        {/* P&L Summary */}
        <Card>
          <SectionTitle>Profit & Loss Summary</SectionTitle>
          {[
            { l: 'Gross Revenue', v: stats.gross, c: colors.text },
            { l: 'Vehicle & Operating Expenses', v: -stats.cost, c: colors.danger },
            { l: 'Net Operating Profit', v: stats.net, c: profitColor(stats.net), bold: true },
            { l: 'Est. Tax (self-employment)', v: -stats.taxEst, c: colors.warn },
            { l: 'After-Tax Take-Home', v: stats.afterTax, c: profitColor(stats.afterTax), bold: true },
            { l: 'IRS Mileage Deduction', v: stats.mileageDeduction, c: colors.accent },
          ].map((row, i) => (
            <View key={i} style={[styles.plRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <Text style={[styles.plLabel, row.bold && { color: colors.text, fontWeight: '700' }]}>{row.l}</Text>
              <Text style={[styles.plValue, { color: row.c }, row.bold && { fontSize: 15, fontWeight: '900' }]}>
                {row.v >= 0 ? fmt(row.v) : `-${fmt(Math.abs(row.v))}`}
              </Text>
            </View>
          ))}
        </Card>

        {/* Smart Alerts */}
        <SectionTitle style={{ marginTop: 4 }}>Smart Alerts</SectionTitle>
        {stats.net < 0 && (
          <AlertBanner type="danger" title="Loss Period" body={`You're ${fmt(Math.abs(stats.net))} short of break-even. Focus on higher-paying routes.`} />
        )}
        {stats.cpm > 0.9 && (
          <AlertBanner type="warn" title="High Cost Per Mile" body={`${fmt(stats.cpm)}/mi is above target. Check fuel efficiency and deferred maintenance.`} />
        )}
        {stats.hourlyRate < 12 && stats.totalTrips > 0 && (
          <AlertBanner type="warn" title="Low Effective Hourly Rate" body={`${fmt(stats.hourlyRate)}/hr after expenses. Reduce idle time between pickups.`} />
        )}
        {stats.net >= 0 && stats.cpm <= 0.9 && stats.hourlyRate >= 12 && (
          <AlertBanner type="success" title="Healthy Performance" body={`${margin}% profit margin and ${fmt(stats.hourlyRate)}/hr net rate. Keep it up!`} />
        )}
        {platformList.length > 1 && (() => {
          const best = platformList[0];
          const worst = platformList[platformList.length - 1];
          if (best.net - worst.net > 20) {
            return (
              <AlertBanner
                type="info"
                title={`${best.name} Outperforms ${worst.name}`}
                body={`${best.name} nets ${fmt(best.net)} vs ${fmt(worst.net)} — consider shifting more hours to ${best.name}.`}
              />
            );
          }
          return null;
        })()}

        <View style={{ height: 30 }} />
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: colors.text },
  periodBadge: {
    backgroundColor: colors.surface2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodBadgeText: { fontSize: 11, color: colors.accent, fontWeight: '800', letterSpacing: 1 },
  scroll: { flex: 1 },
  content: { padding: spacing.md },
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    overflow: 'hidden',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  summaryVal: { fontSize: 14, fontWeight: '800', color: colors.text },
  summaryLabel: { fontSize: 9, color: colors.muted, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.8 },
  trendChart: {
    flexDirection: 'row',
    height: 80,
    alignItems: 'flex-end',
    gap: 3,
    marginBottom: 6,
  },
  trendCol: { flex: 1, alignItems: 'center', height: '100%' },
  trendBars: { flex: 1, width: '100%', flexDirection: 'row', alignItems: 'flex-end', gap: 1 },
  trendBar: { flex: 1, borderRadius: 2, minHeight: 2 },
  trendDot: { width: 4, height: 4, borderRadius: 2, marginTop: 3 },
  trendLabel: { fontSize: 8, color: colors.muted, marginTop: 1, fontWeight: '600' },
  lgd: { width: 10, height: 10, borderRadius: 2 },
  lgdText: { fontSize: 11, color: colors.muted },
  platformRow: { marginBottom: 14 },
  platformName: { fontSize: 14, fontWeight: '800', color: colors.text },
  platformSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  platformNet: { fontSize: 16, fontWeight: '900' },
  platformMargin: { fontSize: 10, color: colors.muted, marginTop: 2 },
  plRow: { paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plLabel: { fontSize: 12, color: colors.muted, flex: 1, paddingRight: 8 },
  plValue: { fontSize: 13, fontWeight: '700' },
});
