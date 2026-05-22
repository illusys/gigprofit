import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { tripCost, totalCost, fmt, IRS_RATE, defaultVehicle } from '../utils/calculations';
import { colors, spacing, radius } from '../utils/theme';
import { Card, SectionTitle, PrimaryButton, GhostButton, Divider, Row } from '../components/UI';

const FIELDS = [
  { key: 'mpg', label: 'Fuel Economy', unit: 'MPG', step: 1, min: 5, max: 100, icon: 'speedometer-outline' },
  { key: 'fuelPrice', label: 'Fuel Price', unit: '$/gal', step: 0.01, min: 1, max: 10, icon: 'flame-outline' },
  { key: 'deprecPerMile', label: 'Depreciation', unit: '$/mi', step: 0.01, min: 0, max: 1, icon: 'trending-down-outline' },
  { key: 'insuranceMonthly', label: 'Insurance', unit: '$/mo', step: 5, min: 0, max: 1000, icon: 'shield-outline' },
  { key: 'maintenancePerMile', label: 'Maintenance', unit: '$/mi', step: 0.005, min: 0, max: 0.5, icon: 'construct-outline' },
  { key: 'tirePerMile', label: 'Tire Wear', unit: '$/mi', step: 0.001, min: 0, max: 0.2, icon: 'ellipse-outline' },
  { key: 'oilChangeInterval', label: 'Oil Change Every', unit: 'mi', step: 500, min: 1000, max: 15000, icon: 'water-outline' },
  { key: 'oilChangeCost', label: 'Oil Change Cost', unit: '$', step: 5, min: 20, max: 300, icon: 'cash-outline' },
  { key: 'loanMonthly', label: 'Loan / Lease', unit: '$/mo', step: 25, min: 0, max: 2000, icon: 'card-outline' },
];

export default function SettingsScreen() {
  const { vehicle, setVehicle, trips, clearAllData } = useApp();
  const [saving, setSaving] = useState(false);

  function adjust(key, delta) {
    const field = FIELDS.find((f) => f.key === key);
    if (!field) return;
    const current = vehicle[key] || 0;
    const next = Math.max(field.min, Math.min(field.max, +(current + delta).toFixed(4)));
    setVehicle({ [key]: next });
  }

  // Preview: cost per 100 miles
  const preview100 = (() => {
    const mock = { miles: 100, hours: 3, gross: 0 };
    const c = tripCost(mock, vehicle);
    return { ...c, total: totalCost(c) };
  })();

  function handleReset() {
    Alert.alert(
      'Reset Vehicle Settings',
      'Restore all vehicle costs to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', onPress: () => setVehicle(defaultVehicle) },
      ]
    );
  }

  function handleClearData() {
    Alert.alert(
      'Clear All Data',
      'This will delete all trips and reset settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            await clearAllData();
            setSaving(false);
            Alert.alert('Done', 'All data has been reset with sample trips.');
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vehicle & Settings</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Cost preview card */}
        <Card style={{ borderColor: colors.accent3, marginBottom: 8 }}>
          <SectionTitle>Cost Preview · per 100 miles</SectionTitle>
          <Row style={{ flexWrap: 'wrap', gap: 6 }}>
            {[
              { l: 'Fuel', v: preview100.fuel, c: '#ff6b35' },
              { l: 'Depreciation', v: preview100.dep, c: '#7c6aff' },
              { l: 'Maintenance', v: preview100.maint, c: colors.warn },
              { l: 'Tires', v: preview100.tire, c: '#5ddcff' },
              { l: 'Oil', v: preview100.oil, c: '#ff9966' },
              { l: 'Insurance', v: preview100.ins, c: '#c084fc' },
              ...(preview100.loan > 0 ? [{ l: 'Loan', v: preview100.loan, c: '#fb7185' }] : []),
            ].map((item) => (
              <View key={item.l} style={[styles.costChip, { borderColor: item.c }]}>
                <Text style={[styles.costChipVal, { color: item.c }]}>{fmt(item.v)}</Text>
                <Text style={styles.costChipLabel}>{item.l}</Text>
              </View>
            ))}
          </Row>
          <Divider />
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={{ color: colors.muted, fontSize: 13 }}>Total / 100 mi</Text>
            <Text style={{ color: colors.danger, fontWeight: '900', fontSize: 16 }}>{fmt(preview100.total)}</Text>
          </Row>
          <Text style={{ fontSize: 10, color: colors.muted, marginTop: 6 }}>
            IRS standard mileage: ${IRS_RATE}/mi ({IRS_RATE * 100}¢) — use whichever method benefits you more at tax time.
          </Text>
        </Card>

        {/* Vehicle fields */}
        <Card>
          <SectionTitle>Vehicle Cost Settings</SectionTitle>
          {FIELDS.map((field, i) => (
            <View key={field.key}>
              {i > 0 && <Divider style={{ marginVertical: 2 }} />}
              <Row style={styles.fieldRow}>
                <Ionicons name={field.icon} size={18} color={colors.muted} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <Text style={styles.fieldUnit}>{field.unit}</Text>
                </View>
                <Row style={styles.stepper}>
                  <TouchableOpacity
                    onPress={() => adjust(field.key, -field.step)}
                    style={styles.stepBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.stepBtnText}>−</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.stepInput}
                    value={String(vehicle[field.key] ?? '')}
                    onChangeText={(v) => {
                      const n = parseFloat(v);
                      if (!isNaN(n)) setVehicle({ [field.key]: n });
                    }}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                  />
                  <TouchableOpacity
                    onPress={() => adjust(field.key, field.step)}
                    style={styles.stepBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </Row>
              </Row>
            </View>
          ))}
        </Card>

        {/* Stats summary */}
        <Card>
          <SectionTitle>Data Summary</SectionTitle>
          <Row style={{ justifyContent: 'space-around' }}>
            {[
              { l: 'Total Trips', v: trips.length },
              { l: 'Total Miles', v: trips.reduce((s, t) => s + t.miles, 0).toFixed(0) },
              { l: 'Total Hours', v: trips.reduce((s, t) => s + t.hours, 0).toFixed(1) },
            ].map((item) => (
              <View key={item.l} style={{ alignItems: 'center' }}>
                <Text style={styles.dataStat}>{item.v}</Text>
                <Text style={styles.dataLabel}>{item.l}</Text>
              </View>
            ))}
          </Row>
        </Card>

        {/* About */}
        <Card>
          <SectionTitle>About GigProfit</SectionTitle>
          <Text style={styles.aboutText}>
            GigProfit helps gig economy drivers track real profitability across all platforms — after fuel, depreciation, maintenance, insurance, and taxes.
          </Text>
          <Text style={[styles.aboutText, { marginTop: 8 }]}>
            AI coaching powered by Claude (Anthropic). Tax estimates are for informational purposes only — consult a tax professional.
          </Text>
          <Divider />
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={styles.aboutText}>Version</Text>
            <Text style={{ color: colors.accent, fontWeight: '700' }}>1.0.0</Text>
          </Row>
        </Card>

        {/* Actions */}
        <GhostButton label="Reset Vehicle Defaults" onPress={handleReset} style={{ marginBottom: 8 }} />
        <GhostButton
          label={saving ? 'Resetting…' : 'Clear All Data'}
          onPress={handleClearData}
          color={colors.danger}
          style={{ marginBottom: 30 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: colors.text },
  scroll: { flex: 1 },
  content: { padding: spacing.md },
  costChip: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    minWidth: 75,
  },
  costChipVal: { fontSize: 13, fontWeight: '800' },
  costChipLabel: { fontSize: 9, color: colors.muted, marginTop: 2, textTransform: 'uppercase' },
  fieldRow: { paddingVertical: 12 },
  fieldLabel: { fontSize: 13, color: colors.text, fontWeight: '600' },
  fieldUnit: { fontSize: 10, color: colors.muted, marginTop: 1 },
  stepper: { gap: 0 },
  stepBtn: {
    width: 32,
    height: 32,
    backgroundColor: colors.surface2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { color: colors.text, fontSize: 18, fontWeight: '700', lineHeight: 20 },
  stepInput: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    width: 64,
    backgroundColor: colors.surface2,
    marginHorizontal: 4,
    borderRadius: 8,
    paddingVertical: 6,
  },
  dataStat: { fontSize: 20, fontWeight: '900', color: colors.text },
  dataLabel: { fontSize: 10, color: colors.muted, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.8 },
  aboutText: { fontSize: 13, color: colors.muted, lineHeight: 20 },
});
