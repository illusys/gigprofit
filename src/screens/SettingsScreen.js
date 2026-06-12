import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../i18n/translations';
import { tripCost, totalCost, fmt, DEFAULT_TAX_SETTINGS, defaultVehicle } from '../utils/calculations';
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
  const { user, vehicle, taxSettings, setVehicle, setTaxSettings, trips, clearAllData, logout } = useApp();
  const { t, language, setLanguage } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

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
            {`Mileage rate: $${taxSettings.mileageRate}/mi (${Math.round(taxSettings.mileageRate * 100)}¢) — managed from your profile or Admin Settings.`}
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

        {/* Tax settings */}
        <Card>
          <SectionTitle>Tax Settings</SectionTitle>
          <Text style={styles.aboutText}>Override default tax assumptions for your account.</Text>
          <Row style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { flex: 1 }]}>Mileage Rate ($/mi)</Text>
            <TextInput style={styles.stepInput} value={String(taxSettings.mileageRate ?? DEFAULT_TAX_SETTINGS.mileageRate)} onChangeText={(v) => { const n = parseFloat(v); if (!isNaN(n)) setTaxSettings({ mileageRate: n }); }} keyboardType="decimal-pad" />
          </Row>
          <Row style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { flex: 1 }]}>Income Tax Rate</Text>
            <TextInput style={styles.stepInput} value={String(taxSettings.incomeTaxRate ?? DEFAULT_TAX_SETTINGS.incomeTaxRate)} onChangeText={(v) => { const n = parseFloat(v); if (!isNaN(n)) setTaxSettings({ incomeTaxRate: n }); }} keyboardType="decimal-pad" />
          </Row>
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
          <SectionTitle>About GigsProfit</SectionTitle>
          <Text style={styles.aboutText}>
            GigsProfit helps gig economy drivers track real profitability across all platforms — after fuel, depreciation, maintenance, insurance, and taxes.
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

        {/* Language */}
        <Card>
          <SectionTitle>{t('settings_language')}</SectionTitle>
          <TouchableOpacity
            style={styles.langRow}
            onPress={() => setLangModalVisible(true)}
            activeOpacity={0.8}
          >
            <Row style={{ gap: 10, flex: 1 }}>
              <Text style={{ fontSize: 22 }}>{currentLang.flag}</Text>
              <View>
                <Text style={styles.langLabel}>{currentLang.nativeLabel}</Text>
                <Text style={styles.langSub}>{currentLang.label}</Text>
              </View>
            </Row>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </TouchableOpacity>
        </Card>

        <Modal
          visible={langModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setLangModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setLangModalVisible(false)}
          >
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>{t('settings_language_pick')}</Text>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.modalOption, lang.code === language && styles.modalOptionActive]}
                  onPress={() => { setLanguage(lang.code); setLangModalVisible(false); }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 22 }}>{lang.flag}</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.modalOptionNative}>{lang.nativeLabel}</Text>
                    <Text style={styles.modalOptionSub}>{lang.label}</Text>
                  </View>
                  {lang.code === language && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.modalDone} onPress={() => setLangModalVisible(false)}>
                <Text style={styles.modalDoneText}>{t('settings_language_done')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Actions */}
        <GhostButton label="Reset Vehicle Defaults" onPress={handleReset} style={{ marginBottom: 8 }} />
        {user ? <GhostButton label="Logout" onPress={logout} style={{ marginBottom: 8 }} /> : null}
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
  langRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  langLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
  langSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 16, textAlign: 'center' },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    marginBottom: 6,
    backgroundColor: colors.surface2,
  },
  modalOptionActive: { borderWidth: 1, borderColor: colors.accent },
  modalOptionNative: { fontSize: 15, fontWeight: '700', color: colors.text },
  modalOptionSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  modalDone: {
    marginTop: 8,
    paddingVertical: 13,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  modalDoneText: { color: '#000', fontWeight: '800', fontSize: 14 },
});
