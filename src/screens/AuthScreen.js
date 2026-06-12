import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing, radius } from '../utils/theme';
import { Card, PrimaryButton, SectionTitle, Row } from '../components/UI';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function AuthScreen({ initialMode = 'login', onBackToLanding }) {
  const { login, loginWithGoogle, register } = useApp();
  const { t, isRTL } = useLanguage();
  const [mode, setMode] = useState(initialMode);
  const [authError, setAuthError] = useState('');

  useEffect(() => { setMode(initialMode); setAuthError(''); }, [initialMode]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = mode === 'register'
        ? 'Create Account — GigsProfit'
        : 'Sign In — GigsProfit';
    }
  }, [mode]);
  const [busy, setBusy] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const idToken = response.params?.id_token;
      if (idToken) {
        handleGoogleToken(idToken);
      } else {
        setGoogleLoading(false);
        setAuthError('Google sign-in failed: no ID token returned. Check your Google Client ID.');
      }
    } else if (response.type === 'error') {
      setGoogleLoading(false);
      setAuthError(response.error?.message || 'Google sign-in failed. Please try again.');
    } else {
      // cancelled / dismissed
      setGoogleLoading(false);
    }
  }, [response]);

  async function handleGoogleToken(idToken) {
    try {
      await loginWithGoogle(idToken);
    } catch (e) {
      setAuthError(e.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleGooglePress() {
    setAuthError('');
    setGoogleLoading(true);
    try {
      await promptAsync();
    } catch {
      setGoogleLoading(false);
    }
  }

  async function submit() {
    setAuthError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({ event: 'login', method: 'email' });
        }
      } else {
        await register(form);
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({ event: 'sign_up', method: 'email' });
        }
        setMode('login');
        setAuthError('');
      }
    } catch (e) {
      setAuthError(e.message || 'Authentication failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const googleDisabled = !GOOGLE_WEB_CLIENT_ID || !request || googleLoading;
  const rtl = isRTL ? { flexDirection: 'row-reverse' } : {};
  const textAlign = isRTL ? 'right' : 'left';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {onBackToLanding && (
        <TouchableOpacity style={styles.backBtn} onPress={onBackToLanding} activeOpacity={0.7}>
          <Text style={styles.backText}>{t('auth_back')}</Text>
        </TouchableOpacity>
      )}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>Gigs<Text style={{ color: colors.accent }}>Profit</Text></Text>
        <Text style={styles.sub}>{mode === 'register' ? t('auth_create_free') : t('auth_welcome_back')}</Text>

        <Card>
          <SectionTitle>{mode === 'login' ? t('auth_signin_title') : t('auth_register_title')}</SectionTitle>

          {mode === 'register' && (
            <Row style={[{ gap: 8 }, rtl]}>
              <Field placeholder={t('auth_first_name')} value={form.firstName} onChangeText={(v) => setField('firstName', v)} textAlign={textAlign} />
              <Field placeholder={t('auth_last_name')} value={form.lastName} onChangeText={(v) => setField('lastName', v)} textAlign={textAlign} />
            </Row>
          )}
          <Field placeholder={t('auth_email')} value={form.email} onChangeText={(v) => setField('email', v)} autoCapitalize="none" keyboardType="email-address" textAlign={textAlign} />
          {mode === 'register' && (
            <Field placeholder={t('auth_phone')} value={form.phone} onChangeText={(v) => setField('phone', v)} keyboardType="phone-pad" textAlign={textAlign} />
          )}
          <Field placeholder={t('auth_password')} value={form.password} onChangeText={(v) => setField('password', v)} secureTextEntry textAlign={textAlign} />
          {mode === 'register' && (
            <Field placeholder={t('auth_confirm_password')} value={form.confirmPassword} onChangeText={(v) => setField('confirmPassword', v)} secureTextEntry textAlign={textAlign} />
          )}

          <PrimaryButton label={mode === 'login' ? t('auth_btn_signin') : t('auth_btn_register')} onPress={submit} loading={busy} />

          {authError ? <Text style={styles.authError}>{authError}</Text> : null}

          <Row style={[styles.dividerRow, rtl]}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth_or')}</Text>
            <View style={styles.dividerLine} />
          </Row>

          <TouchableOpacity
            style={[styles.googleBtn, googleDisabled && { opacity: 0.45 }]}
            onPress={handleGooglePress}
            disabled={googleDisabled}
            activeOpacity={0.8}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Text style={styles.googleG}>G</Text>
            )}
            <Text style={styles.googleText}>
              {googleLoading ? t('auth_google_loading') : t('auth_google')}
            </Text>
          </TouchableOpacity>

          {!GOOGLE_WEB_CLIENT_ID && (
            <Text style={styles.configNote}>{t('auth_google_config_note')}</Text>
          )}

          <TouchableOpacity style={styles.switch} onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setAuthError(''); }}>
            <Text style={styles.switchText}>
              {mode === 'login' ? t('auth_no_account') : t('auth_have_account')}
            </Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ textAlign, ...props }) {
  return <TextInput {...props} placeholderTextColor={colors.muted} style={[styles.input, textAlign && { textAlign }, props.style]} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  backBtn: { paddingHorizontal: spacing.md, paddingVertical: 12 },
  backText: { color: colors.accent, fontWeight: '700', fontSize: 14 },
  content: { padding: spacing.md, justifyContent: 'center', flexGrow: 1 },
  logo: { fontSize: 40, fontWeight: '900', color: colors.text, textAlign: 'center' },
  sub: { color: colors.muted, textAlign: 'center', marginBottom: 24, fontSize: 13, lineHeight: 19 },
  input: {
    flex: 1,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 13,
    color: colors.text,
    marginBottom: 10,
  },
  authError: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 2,
  },
  dividerRow: { alignItems: 'center', gap: 10, marginVertical: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  googleG: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4285F4',
    lineHeight: 22,
  },
  googleText: { color: colors.text, fontWeight: '700', fontSize: 14 },
  configNote: { fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 6, marginBottom: 4 },
  switch: { padding: 14, alignItems: 'center' },
  switchText: { color: colors.accent, fontWeight: '700', fontSize: 13 },
});
