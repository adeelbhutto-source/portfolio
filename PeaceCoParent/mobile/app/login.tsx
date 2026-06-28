import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, StatusBar, Linking,
} from 'react-native';
import { router, Link } from 'expo-router';
import { apiFetch, saveTokens } from '../src/api/client';

const GOOGLE_URL = 'https://api.peacecoparent.com/api/auth/google?mobile=true';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) { Alert.alert('Error', 'Email and password are required'); return; }
    setLoading(true);
    try {
      const data = await apiFetch<{ tokens: { accessToken: string; refreshToken: string }; family: unknown }>('/auth/login', {
        method: 'POST', body: JSON.stringify({ email, password }),
      });
      await saveTokens(data.tokens.accessToken, data.tokens.refreshToken);
      if (!data.family) router.replace('/setup');
      else router.replace('/(tabs)');
    } catch (e: unknown) {
      Alert.alert('Login failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>P</Text>
          </View>
          <Text style={styles.logo}>PeaceCoParent</Text>
          <Text style={styles.sub}>Welcome back</Text>
        </View>

        <View style={styles.card}>
          {/* Google login */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={() => Linking.openURL(GOOGLE_URL)}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor="#9a9088"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Password"
            placeholderTextColor="#9a9088"
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.btnText}>{loading ? 'Signing in…' : 'Sign in'}</Text>
          </TouchableOpacity>
        </View>

        <Link href="/register" style={styles.link}>
          Don't have an account? <Text style={styles.linkBold}>Sign up free</Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f8f4ee' },
  hero: { backgroundColor: '#2d2820', paddingTop: 80, paddingBottom: 48, alignItems: 'center' },
  logoBox: { width: 64, height: 64, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  logoLetter: { fontSize: 32, fontWeight: '900', color: '#2d2820' },
  logo: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 6 },
  sub: { fontSize: 14, color: '#9a9088' },
  card: { backgroundColor: '#fff', borderRadius: 24, marginHorizontal: 20, marginTop: -20, padding: 24, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#4a4238', marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: '#e8e0d8', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 16, backgroundColor: '#f8f4ee', color: '#2d2820' },
  btn: { backgroundColor: '#2d2820', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  link: { marginTop: 24, textAlign: 'center', color: '#7a7268', fontSize: 14 },
  linkBold: { color: '#2d2820', fontWeight: '700' },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#e8e0d8', borderRadius: 12, paddingVertical: 13, marginBottom: 16, backgroundColor: '#f8f4ee', gap: 10 },
  googleIcon: { fontSize: 16, fontWeight: '900', color: '#4285F4' },
  googleText: { fontSize: 15, fontWeight: '600', color: '#2d2820' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e8e0d8' },
  dividerText: { fontSize: 12, color: '#9a9088', fontWeight: '600' },
});
