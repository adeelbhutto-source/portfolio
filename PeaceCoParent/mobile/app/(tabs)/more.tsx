import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, StatusBar, Linking, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { clearTokens } from '../../src/api/client';

type Item = { label: string; icon: string; color: string; onPress: () => void };

export default function MoreScreen() {
  async function logout() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out', style: 'destructive', onPress: async () => {
          await clearTokens();
          router.replace('/login');
        },
      },
    ]);
  }

  function openUrl(url: string) {
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open link'));
  }

  async function shareApp() {
    try {
      await Share.share({
        message: 'Co-parent without the conflict — try PeaceCoParent: https://peacecoparent.com',
        title: 'PeaceCoParent',
      });
    } catch {}
  }

  const sections: { title: string; items: Item[] }[] = [
    {
      title: 'Tools',
      items: [
        { label: 'Court Report PDF', icon: 'document-text',   color: '#568960', onPress: () => openUrl('https://peacecoparent.com/court-report') },
        { label: 'Documents',        icon: 'folder',          color: '#f59e0b', onPress: () => openUrl('https://peacecoparent.com/documents') },
        { label: 'Children Profiles',icon: 'people',          color: '#568960', onPress: () => openUrl('https://peacecoparent.com/children') },
        { label: 'Attorney Access',  icon: 'briefcase-outline',color: '#7a7268', onPress: () => openUrl('https://peacecoparent.com/attorney') },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Upgrade plan', icon: 'star', color: '#f59e0b', onPress: () => openUrl('https://peacecoparent.com/pricing') },
        { label: 'Account settings', icon: 'settings-outline', color: '#568960', onPress: () => openUrl('https://peacecoparent.com/account') },
        { label: 'Sign out', icon: 'log-out', color: '#ef4444', onPress: logout },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Visit peacecoparent.com', icon: 'globe-outline', color: '#0ea5e9', onPress: () => openUrl('https://peacecoparent.com') },
        { label: 'Contact support', icon: 'mail-outline', color: '#568960', onPress: () => openUrl('mailto:hello@peacecoparent.com') },
        { label: 'Share the app', icon: 'share-outline', color: '#568960', onPress: shareApp },
        { label: 'Privacy Policy', icon: 'shield-checkmark-outline', color: '#9a9088', onPress: () => openUrl('https://peacecoparent.com/privacy') },
        { label: 'Terms of Service', icon: 'document-outline', color: '#9a9088', onPress: () => openUrl('https://peacecoparent.com/terms') },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f4ee' }}>
      <StatusBar barStyle="light-content" />
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>More</Text>
        <Text style={styles.heroSub}>PeaceCoParent</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.row, idx < section.items.length - 1 && styles.rowBorder]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconWrap, { backgroundColor: item.color + '18' }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#c8c0b8" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>P</Text>
          </View>
          <Text style={styles.footerApp}>PeaceCoParent</Text>
          <Text style={styles.footerText}>Helping families co-parent peacefully</Text>
          <TouchableOpacity onPress={() => openUrl('https://peacecoparent.com')}>
            <Text style={styles.footerLink}>peacecoparent.com</Text>
          </TouchableOpacity>
          <Text style={styles.footerVersion}>v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: '#2d2820', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 24 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 13, color: '#4a4238', marginTop: 2 },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#9a9088', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#f8f4ee' },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  rowLabel: { flex: 1, fontSize: 15, color: '#2d2820', fontWeight: '600' },
  footer: { alignItems: 'center', paddingTop: 24, paddingBottom: 8 },
  logoBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#2d2820', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  logoLetter: { fontSize: 24, fontWeight: '900', color: '#fff' },
  footerApp: { fontSize: 14, fontWeight: '800', color: '#2d2820', marginBottom: 4 },
  footerText: { fontSize: 12, color: '#9a9088', marginBottom: 4 },
  footerLink: { fontSize: 12, color: '#568960', fontWeight: '600', marginBottom: 4 },
  footerVersion: { fontSize: 11, color: '#c8c0b8', marginTop: 2 },
});
