import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { getAccessToken, apiFetch } from '../src/api/client';

export default function SplashRedirect() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getAccessToken();
      if (!token) { router.replace('/login'); return; }
      try {
        const data = await apiFetch<{ family: unknown }>('/auth/me');
        if (!data.family) router.replace('/setup');
        else router.replace('/(tabs)');
      } catch {
        router.replace('/login');
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>PeaceCoParent</Text>
      {checking && <ActivityIndicator color="#568960" style={{ marginTop: 16 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f4ee' },
  logo: { fontSize: 28, fontWeight: '700', color: '#568960' },
});
