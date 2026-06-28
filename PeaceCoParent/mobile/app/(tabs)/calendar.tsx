import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, StyleSheet, Alert, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { apiFetch } from '../../src/api/client';
import ErrorBoundary from '../../src/ErrorBoundary';

type CalEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  eventType: string;
  notes?: string;
};

const TYPE_COLORS: Record<string, string> = {
  custody_transfer: '#568960',
  medical: '#ef4444',
  school: '#f59e0b',
  activity: '#568960',
  holiday: '#0ea5e9',
  other: '#9a9088',
};

const TYPE_LABELS: Record<string, string> = {
  custody_transfer: 'Custody',
  medical: 'Medical',
  school: 'School',
  activity: 'Activity',
  holiday: 'Holiday',
  other: 'Other',
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function CalendarContent() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [selected, setSelected] = useState(today.getDate());
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('other');
  const [newDate, setNewDate] = useState(
    `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const start = new Date(year, month, 1).toISOString();
      const end = new Date(year, month + 1, 0, 23, 59).toISOString();
      const data = await apiFetch<unknown>(`/events?start=${start}&end=${end}`);
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  function prevMonth() {
    Haptics.selectionAsync();
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    Haptics.selectionAsync();
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const eventsForDay = (day: number) => events.filter(e => {
    try {
      const d = new Date(e.startTime);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    } catch { return false; }
  });

  const selectedEvents = eventsForDay(selected);

  async function addEvent() {
    if (!newTitle.trim() || !newDate.trim()) { Alert.alert('Error', 'Title and date required'); return; }
    try {
      const parts = newDate.split('-').map(Number);
      const start = new Date(parts[0], parts[1] - 1, parts[2], 9, 0).toISOString();
      const end = new Date(parts[0], parts[1] - 1, parts[2], 10, 0).toISOString();
      await apiFetch('/events', { method: 'POST', body: JSON.stringify({ title: newTitle, startDate: start, endDate: end, type: newType, allDay: true }) });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAdd(false); setNewTitle(''); setNewType('other');
      load();
    } catch (e: unknown) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f4ee' }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.hero}>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.monthTitle}>{MONTHS[month]}</Text>
            <Text style={styles.yearText}>{year}</Text>
          </View>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={styles.dayRow}>
          {DAYS.map((d, i) => <Text key={i} style={styles.dayHeader}>{d}</Text>)}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {Array.from({ length: firstDay }, (_, i) => (
            <View key={`empty-${i}`} style={styles.cell} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayEvts = eventsForDay(day);
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            const isSel = selected === day;
            return (
              <TouchableOpacity
                key={day}
                style={styles.cell}
                onPress={() => { setSelected(day); Haptics.selectionAsync(); }}
              >
                <View style={[
                  styles.dayCircle,
                  isToday && styles.todayCircle,
                  isSel && !isToday && styles.selectedCircle,
                ]}>
                  <Text style={[styles.dayText, (isToday || isSel) && styles.dayTextActive]}>{day}</Text>
                </View>
                <View style={styles.dotsRow}>
                  {dayEvts.slice(0, 3).map((e, idx) => (
                    <View
                      key={e.id}
                      style={[styles.dot, {
                        backgroundColor: TYPE_COLORS[e.eventType] ?? '#9a9088',
                        marginRight: idx < 2 ? 2 : 0,
                      }]}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Events for selected day */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text style={styles.selectedTitle}>{MONTHS[month]} {selected}</Text>

        {loading ? (
          <ActivityIndicator color="#568960" style={{ marginTop: 20 }} />
        ) : selectedEvents.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={36} color="#3d3830" />
            <Text style={styles.emptyTitle}>No events</Text>
            <Text style={styles.emptyText}>Tap + to add an event for this day</Text>
          </View>
        ) : (
          selectedEvents.map(e => (
            <View key={e.id} style={[styles.eventCard, { borderLeftColor: TYPE_COLORS[e.eventType] ?? '#9a9088' }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle}>{e.title ?? ''}</Text>
                <View style={styles.eventMeta}>
                  <View style={[styles.typeBadge, { backgroundColor: (TYPE_COLORS[e.eventType] ?? '#9a9088') + '22' }]}>
                    <Text style={[styles.typeText, { color: TYPE_COLORS[e.eventType] ?? '#9a9088' }]}>
                      {TYPE_LABELS[e.eventType] ?? (e.eventType ?? '')}
                    </Text>
                  </View>
                  <Text style={styles.eventTime}>
                    {new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => { setShowAdd(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showAdd} animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Event</Text>
            <TouchableOpacity onPress={() => setShowAdd(false)}>
              <Ionicons name="close" size={24} color="#7a7268" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} value={newTitle} onChangeText={setNewTitle} placeholder="Event title" placeholderTextColor="#9a9088" />
            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={newDate} onChangeText={setNewDate} placeholder="2026-04-28" placeholderTextColor="#9a9088" />
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeGrid}>
              {Object.keys(TYPE_COLORS).map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setNewType(t)}
                  style={[styles.typePill, { borderColor: TYPE_COLORS[t] }, newType === t && { backgroundColor: TYPE_COLORS[t] }]}
                >
                  <Text style={[styles.typePillText, newType === t && { color: '#fff' }]}>
                    {TYPE_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.btn} onPress={addEvent}>
              <Text style={styles.btnText}>Add Event</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

export default function CalendarScreen() {
  return <ErrorBoundary><CalendarContent /></ErrorBoundary>;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: '#2d2820', paddingTop: 60, paddingHorizontal: 12, paddingBottom: 12 },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 8 },
  navBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#2d2820', alignItems: 'center', justifyContent: 'center' },
  monthTitle: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center' },
  yearText: { fontSize: 12, color: '#4a4238', textAlign: 'center' },
  dayRow: { flexDirection: 'row', marginBottom: 4 },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: '#4a4238' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', alignItems: 'center', paddingVertical: 4 },
  dayCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  todayCircle: { backgroundColor: '#568960' },
  selectedCircle: { backgroundColor: '#3d3830' },
  dayText: { fontSize: 13, color: '#7a7268', fontWeight: '500' },
  dayTextActive: { color: '#fff', fontWeight: '700' },
  dotsRow: { flexDirection: 'row', height: 6, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 4, height: 4, borderRadius: 2 },
  selectedTitle: { fontSize: 16, fontWeight: '800', color: '#2d2820', marginBottom: 12 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#2d2820', marginTop: 12 },
  emptyText: { fontSize: 13, color: '#9a9088', marginTop: 4, textAlign: 'center' },
  eventCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  eventTitle: { fontSize: 15, fontWeight: '700', color: '#2d2820', marginBottom: 8 },
  eventMeta: { flexDirection: 'row', alignItems: 'center' },
  typeBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginRight: 8 },
  typeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  eventTime: { fontSize: 12, color: '#7a7268' },
  fab: { position: 'absolute', right: 20, bottom: 24, backgroundColor: '#568960', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#568960', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  modal: { flex: 1, backgroundColor: '#f8f4ee' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0ebe4' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#2d2820' },
  label: { fontSize: 13, fontWeight: '600', color: '#4a4238', marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: '#e8e0d8', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 20, backgroundColor: '#fff', color: '#2d2820' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  typePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, margin: 4 },
  typePillText: { fontSize: 12, color: '#4a4238', fontWeight: '600' },
  btn: { backgroundColor: '#2d2820', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
