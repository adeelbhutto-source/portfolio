import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiFetch } from '../../src/api/client';

type Family = { id: string; name: string; inviteCode: string };
type Me = { id: string; name: string; email: string; family: Family | null; role: 'parent1' | 'parent2' };
type Message = { id: string; readAt?: string; senderId: string };
type Expense = { id: string; status: string; submittedBy: string };
type CalEvent = { id: string; title: string; startDate: string; type: string };

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function HomeScreen() {
  const [me, setMe] = useState<Me | null>(null);
  const [unread, setUnread] = useState(0);
  const [pending, setPending] = useState(0);
  const [todayEvents, setTodayEvents] = useState<CalEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<Me>('/auth/me');
      setMe(data);
    } catch {}

    try {
      const msgs = await apiFetch<Message[]>('/messages');
      const meData = await apiFetch<Me>('/auth/me');
      setUnread(Array.isArray(msgs) ? msgs.filter(m => !m.readAt && m.senderId !== meData.id).length : 0);
    } catch {}

    try {
      const exps = await apiFetch<Expense[]>('/expenses');
      const meData = await apiFetch<Me>('/auth/me');
      setpending(Array.isArray(exps) ? exps.filter(e => e.status === 'pending' && e.submittedBy !== meData.id).length : 0);
    } catch {}

    try {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59).toISOString();
      const evts = await apiFetch<CalEvent[]>(`/events?start=${start}&end=${end}`);
      if (Array.isArray(evts)) setTodayEvents(evts);
    } catch {}
  }, []);

  function setpending(n: number) { setPending(n); }

  useEffect(() => { load(); }, []);

  async function onRefresh() { setRefreshing(true); await load(); setRefreshing(false); }

  async function shareInvite() {
    if (!me?.family?.inviteCode) return;
    await Share.share({
      message: `Join me on PeaceCoParent — peacecoparent.com/join/${me.family.inviteCode}`,
      title: 'PeaceCoParent Invite',
    });
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = me?.name?.split(' ')[0] ?? '';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const peaceScore = Math.max(0, 100 - (unread * 10) - (pending * 15));

  return (
    <ScrollView style={s.bg} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#568960" />}>

      {/* Hero */}
      <View style={s.hero}>
        <View style={s.heroRow}>
          <View style={s.heroAvatar}>
            <Text style={s.heroAvatarText}>{firstName ? getInitials(me?.name ?? '') : '🌿'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.heroGreeting}>{greeting}{firstName ? `, ${firstName}` : ''}</Text>
            <Text style={s.heroDate}>{today}</Text>
          </View>
        </View>

        {/* Peace score */}
        <View style={s.peaceCard}>
          <View style={s.peaceLeft}>
            <Text style={s.peaceLabel}>Peace Score</Text>
            <Text style={s.peaceScore}>{peaceScore}%</Text>
            <Text style={s.peaceSub}>
              {peaceScore >= 90 ? 'All calm 🌿' : peaceScore >= 60 ? 'Some things need attention' : 'Time to act'}
            </Text>
          </View>
          <View style={s.peaceDots}>
            {[
              { icon: 'chatbubble', val: unread, label: 'unread', route: '/(tabs)/messages' },
              { icon: 'cash', val: pending, label: 'pending', route: '/(tabs)/expenses' },
              { icon: 'calendar', val: todayEvents.length, label: 'today', route: '/(tabs)/calendar' },
            ].map(item => (
              <TouchableOpacity key={item.label} style={s.peaceDot} onPress={() => router.push(item.route as any)}>
                <Text style={[s.peaceDotNum, item.val > 0 && s.peaceDotNumActive]}>{item.val}</Text>
                <Text style={s.peaceDotLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Today's events */}
      {todayEvents.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Today</Text>
          {todayEvents.map(e => (
            <TouchableOpacity key={e.id} style={s.eventCard} onPress={() => router.push('/(tabs)/calendar' as any)} activeOpacity={0.8}>
              <View style={s.eventDot} />
              <Text style={s.eventTitle}>{e.title}</Text>
              <Ionicons name="chevron-forward" size={14} color="#c8c0b8" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Main actions */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Actions</Text>
        <View style={s.actionGrid}>
          {[
            { label: 'Messages', icon: 'chatbubble' as const, color: '#568960', route: '/(tabs)/messages', badge: unread },
            { label: 'Calendar', icon: 'calendar' as const, color: '#2563eb', route: '/(tabs)/calendar', badge: todayEvents.length },
            { label: 'Expenses', icon: 'cash' as const, color: '#d97706', route: '/(tabs)/expenses', badge: pending },
            { label: 'Coach', icon: 'bulb' as const, color: '#7c3aed', route: '/(tabs)/coach', badge: 0 },
          ].map(f => (
            <TouchableOpacity key={f.label} style={s.actionTile} onPress={() => router.push(f.route as any)} activeOpacity={0.8}>
              <View style={[s.actionIcon, { backgroundColor: f.color + '18' }]}>
                <Ionicons name={f.icon} size={24} color={f.color} />
                {f.badge > 0 && (
                  <View style={[s.actionBadge, { backgroundColor: f.color }]}>
                    <Text style={s.actionBadgeText}>{f.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={s.actionLabel}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Invite co-parent */}
      {me?.role === 'parent1' && me.family && (
        <View style={s.section}>
          <TouchableOpacity style={s.inviteCard} onPress={shareInvite} activeOpacity={0.8}>
            <View style={s.inviteIcon}>
              <Ionicons name="person-add" size={22} color="#568960" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.inviteTitle}>Invite your co-parent</Text>
              <Text style={s.inviteCode}>{me.family.inviteCode}</Text>
            </View>
            <Ionicons name="share-outline" size={20} color="#568960" />
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#f8f4ee' },

  // Hero
  hero: { backgroundColor: '#2d2820', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  heroAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#568960', alignItems: 'center', justifyContent: 'center' },
  heroAvatarText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  heroGreeting: { fontSize: 18, fontWeight: '800', color: '#fff' },
  heroDate: { fontSize: 12, color: '#7a7268', marginTop: 2 },

  // Peace card
  peaceCard: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center' },
  peaceLeft: { flex: 1 },
  peaceLabel: { fontSize: 11, fontWeight: '700', color: '#568960', textTransform: 'uppercase', letterSpacing: 0.5 },
  peaceScore: { fontSize: 36, fontWeight: '900', color: '#fff', lineHeight: 42 },
  peaceSub: { fontSize: 12, color: '#7a7268', marginTop: 2 },
  peaceDots: { flexDirection: 'row', gap: 16 },
  peaceDot: { alignItems: 'center' },
  peaceDotNum: { fontSize: 22, fontWeight: '800', color: '#4a4238' },
  peaceDotNumActive: { color: '#fff' },
  peaceDotLabel: { fontSize: 10, color: '#7a7268', marginTop: 2 },

  // Section
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#9a9088', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },

  // Events
  eventCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, gap: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#568960' },
  eventTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: '#2d2820' },

  // Action grid
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionTile: { width: '46%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10, position: 'relative' },
  actionBadge: { position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  actionLabel: { fontSize: 13, fontWeight: '700', color: '#2d2820' },

  // Invite
  inviteCard: { backgroundColor: '#eaf2eb', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: '#c8deca' },
  inviteIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  inviteTitle: { fontSize: 14, fontWeight: '700', color: '#2d2820', marginBottom: 2 },
  inviteCode: { fontSize: 18, fontWeight: '900', color: '#568960', letterSpacing: 3 },
});
