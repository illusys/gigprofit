import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { tripCost, totalCost, fmt, fmtMi, profitColor, PLATFORMS } from '../utils/calculations';
import { colors, spacing, radius } from '../utils/theme';
import { Card, SectionTitle, PrimaryButton, Divider, Row } from '../components/UI';

function today() {
  return new Date().toISOString().split('T')[0];
}

export default function LogTripScreen() {
  const { trips, vehicle, addTrip, deleteTrip } = useApp();
  const [tab, setTab] = useState('log'); // 'log' | 'history'

  const [form, setForm] = useState({
    date: today(),
    platform: 'DoorDash',
    miles: '',
    hours: '',
    gross: '',
    tolls: '',
    note: '',
  });
  const [saving, setSaving] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // Live preview
  const preview = useMemo(() => {
    if (!form.miles || !form.gross) return null;
    const mock = {
      miles: parseFloat(form.miles) || 0,
      hours: parseFloat(form.hours) || 0,
      gross: parseFloat(form.gross) || 0,
    };
    if (mock.miles <= 0 || mock.gross <= 0) return null;
    const c = tripCost(mock, vehicle);
    const tc = totalCost(c) + (parseFloat(form.tolls) || 0);
    const net = mock.gross - tc;
    return { ...c, total: tc, net, gross: mock.gross, miles: mock.miles };
  }, [form, vehicle]);

  async function handleSubmit() {
    const miles = parseFloat(form.miles);
    const gross = parseFloat(form.gross);
    if (!miles || !gross || miles <= 0 || gross <= 0) {
      Alert.alert('Missing Info', 'Please enter miles and gross earnings.');
      return;
    }
    setSaving(true);
    await addTrip({
      date: form.date,
      platform: form.platform,
      miles,
      hours: parseFloat(form.hours) || 0,
      gross,
      tolls: parseFloat(form.tolls) || 0,
      note: form.note,
    });
    setForm({ date: today(), platform: form.platform, miles: '', hours: '', gross: '', tolls: '', note: '' });
    setSaving(false);
    Alert.alert('✓ Trip Logged', 'Your trip has been saved.');
  }

  function handleDelete(id) {
    Alert.alert('Delete Trip', 'Remove this trip?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTrip(id) },
    ]);
  }

  const recentTrips = [...trips]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Tab Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trips</Text>
        <Row style={styles.tabRow}>
          {['log', 'history'].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, tab === t && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'log' ? '+ Log Trip' : 'History'}
              </Text>
            </TouchableOpacity>
          ))}
        </Row>
      </View>

      {tab === 'log' ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Card>
              <SectionTitle>Trip Details</SectionTitle>

              {/* Date */}
              <Label>Date</Label>
              <StyledInput
                value={form.date}
                onChangeText={(v) => setField('date', v)}
                placeholder="YYYY-MM-DD"
                keyboardType={Platform.OS === 'web' ? 'default' : 'default'}
              />

              {/* Platform picker */}
              <Label>Platform</Label>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setPlatformOpen((o) => !o)}
                activeOpacity={0.8}
              >
                <Text style={styles.pickerText}>{form.platform}</Text>
                <Ionicons name={platformOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
              </TouchableOpacity>
              {platformOpen && (
                <View style={styles.dropdown}>
                  {PLATFORMS.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.dropItem, form.platform === p && styles.dropItemActive]}
                      onPress={() => { setField('platform', p); setPlatformOpen(false); }}
                    >
                      <Text style={[styles.dropText, form.platform === p && { color: colors.accent }]}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Miles + Hours */}
              <Row style={{ gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Label>Miles Driven</Label>
                  <StyledInput
                    value={form.miles}
                    onChangeText={(v) => setField('miles', v)}
                    placeholder="0.0"
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Label>Hours Active</Label>
                  <StyledInput
                    value={form.hours}
                    onChangeText={(v) => setField('hours', v)}
                    placeholder="0.0"
                    keyboardType="decimal-pad"
                  />
                </View>
              </Row>

              {/* Gross + Tolls */}
              <Row style={{ gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Label>Gross Earnings ($)</Label>
                  <StyledInput
                    value={form.gross}
                    onChangeText={(v) => setField('gross', v)}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Label>Tolls / Parking ($)</Label>
                  <StyledInput
                    value={form.tolls}
                    onChangeText={(v) => setField('tolls', v)}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>
              </Row>

              {/* Note */}
              <Label>Note (optional)</Label>
              <StyledInput
                value={form.note}
                onChangeText={(v) => setField('note', v)}
                placeholder="e.g. busy lunch rush"
                multiline
                style={{ minHeight: 60 }}
              />
            </Card>

            {/* Live Preview */}
            {preview && (
              <Card style={{ borderColor: profitColor(preview.net) }}>
                <SectionTitle>Trip Preview</SectionTitle>
                <Row style={{ justifyContent: 'space-around', marginBottom: 10 }}>
                  {[
                    { l: 'Gross', v: fmt(preview.gross), c: colors.text },
                    { l: 'Expenses', v: fmt(preview.total), c: colors.danger },
                    { l: 'Net', v: fmt(preview.net), c: profitColor(preview.net) },
                  ].map((x) => (
                    <View key={x.l} style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={[styles.previewVal, { color: x.c }]}>{x.v}</Text>
                      <Text style={styles.previewLabel}>{x.l}</Text>
                    </View>
                  ))}
                </Row>
                <Divider />
                <View style={styles.expGrid}>
                  {[
                    { l: 'Fuel', v: preview.fuel },
                    { l: 'Depreciation', v: preview.dep },
                    { l: 'Maintenance', v: preview.maint },
                    { l: 'Tires', v: preview.tire },
                    { l: 'Oil', v: preview.oil },
                    { l: 'Insurance', v: preview.ins },
                  ].map((e) => (
                    <View key={e.l} style={styles.expItem}>
                      <Text style={styles.expLabel}>{e.l}</Text>
                      <Text style={styles.expVal}>{fmt(e.v)}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            <PrimaryButton
              label={saving ? 'Saving…' : '+ Log This Trip'}
              onPress={handleSubmit}
              loading={saving}
              style={{ marginTop: 4 }}
            />
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Text style={styles.histCount}>{trips.length} trips recorded</Text>
          {recentTrips.map((t) => {
            const c = tripCost(t, vehicle);
            const tc = totalCost(c) + (t.tolls || 0);
            const net = t.gross - tc;
            return (
              <TouchableOpacity
                key={t.id}
                activeOpacity={0.85}
                style={styles.tripRow}
                onLongPress={() => handleDelete(t.id)}
              >
                <View style={{ flex: 1 }}>
                  <Row style={{ gap: 8, marginBottom: 3 }}>
                    <Text style={styles.tripPlatform}>{t.platform}</Text>
                    <Text style={styles.tripDate}>{t.date}</Text>
                  </Row>
                  <Text style={styles.tripMiles}>{fmtMi(t.miles)} · {t.hours?.toFixed(1)}h</Text>
                  {t.note ? <Text style={styles.tripNote}>{t.note}</Text> : null}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.tripGross}>{fmt(t.gross)}</Text>
                  <Text style={[styles.tripNet, { color: profitColor(net) }]}>Net {fmt(net)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          <Text style={styles.deleteHint}>Long-press to delete a trip</Text>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Label({ children }) {
  return <Text style={styles.label}>{children}</Text>;
}

function StyledInput({ style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      style={[styles.input, focused && styles.inputFocused, style]}
      placeholderTextColor={colors.muted}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: colors.text },
  tabRow: { gap: 6 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surface2,
  },
  tabActive: { backgroundColor: colors.accent },
  tabText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  tabTextActive: { color: '#000' },
  scroll: { flex: 1 },
  content: { padding: spacing.md },
  label: { fontSize: 11, color: colors.muted, fontWeight: '600', marginBottom: 5, marginTop: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
    marginBottom: 2,
  },
  inputFocused: { borderColor: colors.accent },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 2,
  },
  pickerText: { color: colors.text, fontSize: 15 },
  dropdown: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: 8,
    overflow: 'hidden',
  },
  dropItem: { paddingHorizontal: 16, paddingVertical: 12 },
  dropItemActive: { backgroundColor: colors.surface3 },
  dropText: { color: colors.textSub, fontSize: 14 },
  previewVal: { fontSize: 17, fontWeight: '800' },
  previewLabel: { fontSize: 10, color: colors.muted, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.8 },
  expGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  expItem: { width: '30%', backgroundColor: colors.surface2, borderRadius: 8, padding: 8, alignItems: 'center' },
  expLabel: { fontSize: 10, color: colors.muted },
  expVal: { fontSize: 12, fontWeight: '700', color: colors.text, marginTop: 2 },
  tripRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripPlatform: { fontSize: 13, fontWeight: '700', color: colors.text },
  tripDate: { fontSize: 11, color: colors.muted },
  tripMiles: { fontSize: 11, color: colors.muted, marginTop: 2 },
  tripNote: { fontSize: 11, color: colors.accent3, marginTop: 2 },
  tripGross: { fontSize: 13, fontWeight: '700', color: colors.accent },
  tripNet: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  histCount: { fontSize: 12, color: colors.muted, marginBottom: 10 },
  deleteHint: { textAlign: 'center', color: colors.muted, fontSize: 11, marginTop: 10 },
});
