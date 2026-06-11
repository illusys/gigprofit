import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../utils/theme';
import { Card, SectionTitle, Row, GhostButton } from '../components/UI';
import { fmt } from '../utils/calculations';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

const TABS = [
  { key: 'dashboard', label: 'Overview', icon: 'grid-outline' },
  { key: 'users', label: 'Users', icon: 'people-outline' },
  { key: 'audit', label: 'Audit', icon: 'list-outline' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline' },
];

export default function AdminScreen() {
  const { user } = useApp();
  const [tab, setTab] = useState('dashboard');
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [m, u, l, s] = await Promise.all([
        api.adminMetrics(),
        api.adminUsers(),
        api.adminAuditLogs(),
        api.adminSettings(),
      ]);
      setMetrics(m.metrics);
      setUsers(u.users || []);
      setLogs(l.logs || []);
      setSettings(s.settings || []);
    } catch (e) {
      Alert.alert('Admin load failed', e.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  async function setUserStatus(target, status) {
    try {
      await api.adminUpdateUser(target.id, { status });
      await load();
    } catch (e) {
      Alert.alert('Update failed', e.message);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>{user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'} · {user?.email}</Text>
        </View>
        <View style={[styles.roleBadge, user?.role === 'SUPER_ADMIN' && { borderColor: colors.accent }]}>
          <Ionicons name="shield-checkmark" size={14} color={user?.role === 'SUPER_ADMIN' ? colors.accent : colors.accent2} />
          <Text style={[styles.roleText, user?.role === 'SUPER_ADMIN' && { color: colors.accent }]}>
            {user?.role === 'SUPER_ADMIN' ? 'Super' : 'Admin'}
          </Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabItem, tab === t.key && styles.tabItemActive]}
            onPress={() => setTab(t.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={t.icon}
              size={18}
              color={tab === t.key ? '#000' : colors.muted}
            />
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {tab === 'dashboard' && <OverviewTab metrics={metrics} />}
        {tab === 'users' && <UsersTab users={users} setStatus={setUserStatus} />}
        {tab === 'audit' && <AuditTab logs={logs} />}
        {tab === 'settings' && <SettingsTab settings={settings} />}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ label, value, icon, color }) {
  return (
    <View style={[metricStyles.card, { borderColor: color || colors.border }]}>
      <Ionicons name={icon} size={20} color={color || colors.muted} style={{ marginBottom: 6 }} />
      <Text style={[metricStyles.value, { color: color || colors.text }]}>{value}</Text>
      <Text style={metricStyles.label}>{label}</Text>
    </View>
  );
}

const metricStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 14,
    alignItems: 'center',
    minHeight: 88,
    justifyContent: 'center',
  },
  value: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  label: { fontSize: 10, color: colors.muted, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' },
});

function OverviewTab({ metrics }) {
  const platforms = metrics?.totalPlatformActivity || [];
  const maxTrips = Math.max(...platforms.map((p) => p._count?._all || 0), 1);

  return (
    <>
      <Text style={styles.sectionLabel}>Platform Summary</Text>
      <Row style={{ gap: 8, marginBottom: 8 }}>
        <MetricCard label="Total Users" value={String(metrics?.totalUsers ?? '—')} icon="people" color={colors.accent} />
        <MetricCard label="Active Users" value={String(metrics?.activeUsers ?? '—')} icon="checkmark-circle" color="#22d3a5" />
      </Row>
      <Row style={{ gap: 8, marginBottom: 16 }}>
        <MetricCard label="Suspended" value={String(metrics?.suspendedUsers ?? '—')} icon="ban" color={colors.warn} />
        <MetricCard label="Total Trips" value={String(metrics?.totalTrips ?? '—')} icon="car" color={colors.accent3} />
      </Row>

      <Card style={{ marginBottom: 8 }}>
        <SectionTitle>Revenue Tracked</SectionTitle>
        <Text style={styles.revenueTotal}>{fmt(metrics?.totalRevenueTracked || 0)}</Text>
        {platforms.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>By Platform</Text>
            {platforms.map((p) => {
              const pct = ((p._count._all / maxTrips) * 100).toFixed(0);
              return (
                <View key={p.platform} style={{ marginBottom: 10 }}>
                  <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={styles.platformName}>{p.platform}</Text>
                    <Text style={styles.platformStats}>{p._count._all} trips · {fmt(p._sum.gross || 0)}</Text>
                  </Row>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%` }]} />
                  </View>
                </View>
              );
            })}
          </>
        )}
      </Card>
    </>
  );
}

function UsersTab({ users, setStatus }) {
  const statusColor = (s) => ({ ACTIVE: colors.accent, SUSPENDED: colors.warn, PENDING_VERIFICATION: colors.accent3, DELETED: colors.danger }[s] || colors.muted);
  const roleColor = (r) => ({ SUPER_ADMIN: colors.accent, ADMIN: colors.accent2 }[r] || colors.muted);

  if (!users.length) {
    return <Card><Text style={styles.emptyText}>No users found.</Text></Card>;
  }

  return (
    <>
      <Text style={styles.sectionLabel}>{users.length} user{users.length !== 1 ? 's' : ''}</Text>
      {users.map((u) => (
        <Card key={u.id} style={{ marginBottom: 8 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.userName}>{u.firstName} {u.lastName}</Text>
              <Text style={styles.userEmail}>{u.email}</Text>
              <Row style={{ gap: 6, marginTop: 6 }}>
                <View style={[styles.pill, { borderColor: roleColor(u.role) }]}>
                  <Text style={[styles.pillText, { color: roleColor(u.role) }]}>{u.role.replace('_', ' ')}</Text>
                </View>
                <View style={[styles.pill, { borderColor: statusColor(u.status) }]}>
                  <Text style={[styles.pillText, { color: statusColor(u.status) }]}>{u.status.replace('_', ' ')}</Text>
                </View>
              </Row>
              {u.lastLogin && (
                <Text style={styles.lastLogin}>Last login: {new Date(u.lastLogin).toLocaleDateString()}</Text>
              )}
            </View>
            {u.role !== 'SUPER_ADMIN' && (
              <TouchableOpacity
                style={[styles.actionBtn, u.status === 'SUSPENDED' ? styles.actionBtnActivate : styles.actionBtnSuspend]}
                onPress={() => setStatus(u, u.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED')}
                activeOpacity={0.8}
              >
                <Text style={styles.actionBtnText}>
                  {u.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                </Text>
              </TouchableOpacity>
            )}
          </Row>
        </Card>
      ))}
    </>
  );
}

function AuditTab({ logs }) {
  const actionColor = (a) => {
    if (a.includes('LOGIN')) return colors.accent;
    if (a.includes('DELETE') || a.includes('SUSPEND')) return colors.danger;
    if (a.includes('CREATE')) return '#22d3a5';
    return colors.muted;
  };

  if (!logs.length) {
    return <Card><Text style={styles.emptyText}>No audit logs yet.</Text></Card>;
  }

  return (
    <>
      <Text style={styles.sectionLabel}>Recent Activity</Text>
      {logs.slice(0, 60).map((l) => (
        <View key={l.id} style={styles.logRow}>
          <View style={[styles.logDot, { backgroundColor: actionColor(l.action) }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.logAction}>{l.action.replace(/_/g, ' ')}</Text>
            <Text style={styles.logMeta}>{l.entityType} · {new Date(l.timestamp).toLocaleString()}</Text>
          </View>
        </View>
      ))}
    </>
  );
}

function SettingsTab({ settings }) {
  if (!settings.length) {
    return <Card><Text style={styles.emptyText}>No system settings found.</Text></Card>;
  }

  return (
    <>
      <Text style={styles.sectionLabel}>System Configuration</Text>
      {settings.map((s) => (
        <Card key={s.key} style={{ marginBottom: 8 }}>
          <Text style={styles.settingKey}>{s.key}</Text>
          <Text style={styles.settingValue}>{JSON.stringify(s.value, null, 2)}</Text>
          <Text style={styles.settingMeta}>Updated: {new Date(s.updatedAt).toLocaleString()}</Text>
        </Card>
      ))}
    </>
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
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 2 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.accent2,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  roleText: { color: colors.accent2, fontSize: 11, fontWeight: '700' },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  tabItemActive: { backgroundColor: colors.accent },
  tabLabel: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  tabLabelActive: { color: '#000' },
  content: { padding: spacing.md },
  sectionLabel: { fontSize: 11, color: colors.muted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 4 },
  revenueTotal: { fontSize: 32, fontWeight: '900', color: colors.accent, letterSpacing: -1, marginBottom: 12 },
  platformName: { color: colors.text, fontWeight: '700', fontSize: 13 },
  platformStats: { color: colors.muted, fontSize: 12 },
  barTrack: { height: 6, backgroundColor: colors.surface2, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.accent3, borderRadius: 3 },
  userName: { color: colors.text, fontWeight: '800', fontSize: 15 },
  userEmail: { color: colors.muted, fontSize: 12, marginTop: 2 },
  pill: { borderWidth: 1, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  pillText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  lastLogin: { color: colors.muted, fontSize: 11, marginTop: 5 },
  actionBtn: { borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' },
  actionBtnSuspend: { backgroundColor: colors.warn + '22', borderWidth: 1, borderColor: colors.warn },
  actionBtnActivate: { backgroundColor: colors.accent + '22', borderWidth: 1, borderColor: colors.accent },
  actionBtnText: { fontSize: 12, fontWeight: '700', color: colors.text },
  logRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  logDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  logAction: { color: colors.text, fontWeight: '700', fontSize: 13, textTransform: 'capitalize' },
  logMeta: { color: colors.muted, fontSize: 11, marginTop: 2 },
  settingKey: { color: colors.accent, fontWeight: '800', fontSize: 14, marginBottom: 6 },
  settingValue: { color: colors.muted, fontSize: 11, fontFamily: 'monospace', lineHeight: 18 },
  settingMeta: { color: colors.muted, fontSize: 10, marginTop: 6 },
  emptyText: { color: colors.muted, fontSize: 13, textAlign: 'center', padding: 12 },
});
