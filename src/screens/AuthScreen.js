import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { colors, spacing, radius } from '../utils/theme';
import { Card, PrimaryButton, SectionTitle, Row } from '../components/UI';

export default function AuthScreen() {
  const { login, register } = useApp();
  const [mode, setMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  async function submit() {
    setBusy(true);
    try {
      if (mode === 'login') await login({ email: form.email, password: form.password });
      else {
        await register(form);
        Alert.alert('Account created', 'Check your email for verification, then sign in.');
        setMode('login');
      }
    } catch (e) {
      Alert.alert('Authentication failed', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>Gig<Text style={{ color: colors.accent }}>Profit</Text></Text>
        <Text style={styles.sub}>Multi-user profitability intelligence for gig drivers</Text>
        <Card>
          <SectionTitle>{mode === 'login' ? 'Sign In' : 'Create Account'}</SectionTitle>
          {mode === 'register' && (
            <Row style={{ gap: 8 }}>
              <Field placeholder="First name" value={form.firstName} onChangeText={(v) => setField('firstName', v)} />
              <Field placeholder="Last name" value={form.lastName} onChangeText={(v) => setField('lastName', v)} />
            </Row>
          )}
          <Field placeholder="Email" value={form.email} onChangeText={(v) => setField('email', v)} autoCapitalize="none" keyboardType="email-address" />
          {mode === 'register' && <Field placeholder="Phone" value={form.phone} onChangeText={(v) => setField('phone', v)} keyboardType="phone-pad" />}
          <Field placeholder="Password" value={form.password} onChangeText={(v) => setField('password', v)} secureTextEntry />
          {mode === 'register' && <Field placeholder="Confirm password" value={form.confirmPassword} onChangeText={(v) => setField('confirmPassword', v)} secureTextEntry />}
          <PrimaryButton label={mode === 'login' ? 'Sign In' : 'Register'} onPress={submit} loading={busy} />
          <TouchableOpacity style={styles.switch} onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
            <Text style={styles.switchText}>{mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field(props) {
  return <TextInput {...props} placeholderTextColor={colors.muted} style={[styles.input, props.style]} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, justifyContent: 'center', flexGrow: 1 },
  logo: { fontSize: 40, fontWeight: '900', color: colors.text, textAlign: 'center' },
  sub: { color: colors.muted, textAlign: 'center', marginBottom: 24 },
  input: { flex: 1, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 13, color: colors.text, marginBottom: 10 },
  switch: { padding: 14, alignItems: 'center' },
  switchText: { color: colors.accent, fontWeight: '700' },
});
