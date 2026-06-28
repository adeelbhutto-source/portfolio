import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { apiFetch } from '../src/api/client';

type Tab = 'create' | 'join';

export default function SetupScreen() {
  const [tab, setTab] = useState<Tab>('create');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!familyName.trim()) { Alert.alert('Error', 'Family name is required'); return; }
    setLoading(true);
    try {
      await apiFetch('/family/create', { method: 'POST', body: JSON.stringify({ familyName }) });
      router.replace('/(tabs)');
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    } finally { setLoading(false); }
  }

  async function handleJoin() {
    if (!inviteCode.trim()) { Alert.alert('Error', 'Invite code is required'); return; }
    setLoading(true);
    try {
      await apiFetch('/family/join', { method: 'POST', body: JSON.stringify({ inviteCode: inviteCode.toUpperCase() }) });
      router.replace('/(tabs)');
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    } finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>P</Text>
          </View>
          <Text style={styles.title}>Set up your family</Text>
          <Text style={styles.subtitle}>Create a new family or join an existing one</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabs}>
            {(['create', 'join'] as Tab[]).map((t) => (
              <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t === 'create' ? 'Create family' : 'Join family'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === 'create' ? (
            <>
              <Text style={styles.desc}>Create a family and share the invite code with the other parent.</Text>
              <Text style={styles.label}>Family name</Text>
              <TextInput
                style={styles.input}
                value={familyName}
                onChangeText={setFamilyName}
                placeholder="e.g. Smith Family"
                placeholderTextColor="#9a9088"
              />
              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleCreate} disabled={loading}>
                <Text style={styles.btnText}>{loading ? 'Creating…' : 'Create family'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.desc}>Enter the 8-character invite code from the other parent.</Text>
              <Text style={styles.label}>Invite code</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={inviteCode}
                onChangeText={(t) => setInviteCode(t.toUpperCase())}
                placeholder="A3F7C2B1"
                placeholderTextColor="#9a9088"
                maxLength={8}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#568960' }, loading && styles.btnDisabled]} onPress={handleJoin} disabled={loading}>
                <Text style={styles.btnText}>{loading ? 'Joining…' : 'Join family'}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f8f4ee' },
  hero: { backgroundColor: '#2d2820', paddingTop: 80, paddingBottom: 48, alignItems: 'center' },
  logoBox: { width: 64, height: 64, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  logoLetter: { fontSize: 32, fontWeight: '900', color: '#2d2820' },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#9a9088' },
  card: { backgroundColor: '#fff', borderRadius: 24, marginHorizontal: 20, marginTop: -20, padding: 24, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  tabs: { flexDirection: 'row', backgroundColor: '#f0ebe4', borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#2d2820' },
  tabText: { fontSize: 13, color: '#7a7268', fontWeight: '600' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  desc: { fontSize: 13, color: '#7a7268', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#4a4238', marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: '#e8e0d8', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 16, backgroundColor: '#f8f4ee', color: '#2d2820' },
  codeInput: { fontFamily: 'monospace', letterSpacing: 4, fontSize: 20, textAlign: 'center' },
  btn: { backgroundColor: '#2d2820', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
