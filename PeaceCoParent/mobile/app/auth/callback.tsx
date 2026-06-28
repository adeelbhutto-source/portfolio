import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { saveTokens } from '../../src/api/client';

export default function AuthCallback() {
  const params = useLocalSearchParams<{ at?: string; rt?: string }>();

  useEffect(() => {
    async function handleCallback() {
      const { at, rt } = params;
      if (at && rt) {
        await saveTokens(at, rt);
        // Check if user has a family
        try {
          const { apiFetch } = await import('../../src/api/client');
          const me = await apiFetch<{ family: unknown }>('/auth/me');
          if (me.family) router.replace('/(tabs)');
          else router.replace('/setup');
        } catch {
          router.replace('/setup');
        }
      } else {
        router.replace('/login');
      }
    }
    handleCallback();
  }, [params]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f4ee' }}>
      <ActivityIndicator size="large" color="#568960" />
      <Text style={{ marginTop: 16, fontSize: 14, color: '#7a7268' }}>Signing you in…</Text>
    </View>
  );
}
