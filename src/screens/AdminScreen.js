import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../utils/theme';
import { Card, SectionTitle, StatCard, Row, MiniBar, GhostButton } from '../components/UI';
import { fmt } from '../utils/calculations';
import { api } from '../services/api';

export default function AdminScreen() {
  const [tab, setTab] = useState('dashboard');
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState([]);

  async function load() {
    try {
      const [m, u, l, s] = await Promise.all([api.adminMetrics(), api.adminUsers(), api.adminAuditLogs(), api.adminSettings()]);
      setMetrics(m.metrics); setUsers(u.users); setLogs(l.logs); setSettings(s.settings);
    } catch (e) { Alert.alert('Admin load failed', e.message); }
  }
  useEffect(() => { load(); }, []);

  async function setStatus(user, status) {
    try { await api.adminUpdateUser(user.id, { status }); await load(); } catch (e) { Alert.alert('Update failed', e.message); }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}><Text style={styles.title}>Admin</Text></View>
      <ScrollView horizontal style={styles.tabs} showsHorizontalScrollIndicator={false}>
        {['dashboard', 'users', 'reports', 'audit', 'settings'].map((x) => <TouchableOpacity key={x} onPress={() => setTab(x)} style={[styles.tab, tab === x && styles.tabActive]}><Text style={[styles.tabText, tab === x && styles.tabTextActive]}>{x}</Text></TouchableOpacity>)}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'dashboard' && <Dashboard metrics={metrics} />}
        {tab === 'users' && <Users users={users} setStatus={setStatus} />}
        {tab === 'reports' && <Reports />}
        {tab === 'audit' && <Audit logs={logs} />}
        {tab === 'settings' && <Settings settings={settings} />}
      </ScrollView>
    </SafeAreaView>
  );
}

function Dashboard({ metrics }) {
  const platforms = metrics?.totalPlatformActivity || [];
  const max = Math.max(...platforms.map((p) => p._count?._all || 0), 1);
  return <>
    <Row style={{ gap: 8, marginBottom: 8 }}><StatCard label="Total Users" value={String(metrics?.totalUsers || 0)} /><StatCard label="Active" value={String(metrics?.activeUsers || 0)} accent={colors.accent} /></Row>
    <Row style={{ gap: 8, marginBottom: 8 }}><StatCard label="Suspended" value={String(metrics?.suspendedUsers || 0)} accent={colors.warn} /><StatCard label="Trips" value={String(metrics?.totalTrips || 0)} /></Row>
    <Card><SectionTitle>Revenue & Platform Activity</SectionTitle><Text style={styles.big}>{fmt(metrics?.totalRevenueTracked || 0)}</Text>{platforms.map((p) => <MiniBar key={p.platform} label={p.platform} value={p._count._all} max={max} right={`${p._count._all} trips`} color={colors.accent3} />)}</Card>
  </>;
}
function Users({ users, setStatus }) { return <Card><SectionTitle>User Management</SectionTitle>{users.map((u) => <View key={u.id} style={styles.row}><View style={{ flex: 1 }}><Text style={styles.name}>{u.firstName} {u.lastName}</Text><Text style={styles.muted}>{u.email} · {u.role} · {u.status}</Text></View><GhostButton label={u.status === 'SUSPENDED' ? 'Activate' : 'Suspend'} onPress={() => setStatus(u, u.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED')} /></View>)}</Card>; }
function Reports() { return <Card><SectionTitle>Reports Management</SectionTitle><Text style={styles.muted}>Admins can view/export all user reports through /api/admin/reports with date, type, and user filters.</Text></Card>; }
function Audit({ logs }) { return <Card><SectionTitle>Audit Logs</SectionTitle>{logs.slice(0, 50).map((l) => <View key={l.id} style={styles.row}><Text style={styles.name}>{l.action}</Text><Text style={styles.muted}>{l.entityType} · {new Date(l.timestamp).toLocaleString()}</Text></View>)}</Card>; }
function Settings({ settings }) { return <Card><SectionTitle>System Settings</SectionTitle>{settings.map((s) => <View key={s.key} style={styles.row}><Text style={styles.name}>{s.key}</Text><Text style={styles.muted}>{JSON.stringify(s.value)}</Text></View>)}</Card>; }

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.bg }, header: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }, title: { color: colors.text, fontSize: 22, fontWeight: '900' }, tabs: { maxHeight: 48, borderBottomWidth: 1, borderBottomColor: colors.border }, tab: { paddingHorizontal: 16, paddingVertical: 12 }, tabActive: { backgroundColor: colors.accent }, tabText: { color: colors.muted, fontWeight: '700', textTransform: 'capitalize' }, tabTextActive: { color: '#000' }, content: { padding: spacing.md }, row: { borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 12 }, name: { color: colors.text, fontWeight: '700' }, muted: { color: colors.muted, fontSize: 12, marginTop: 2 }, big: { color: colors.accent, fontSize: 26, fontWeight: '900', marginBottom: 12 } });
