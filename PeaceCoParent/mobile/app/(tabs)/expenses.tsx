import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, StyleSheet, Alert, RefreshControl, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { apiFetch } from '../../src/api/client';
import ErrorBoundary from '../../src/ErrorBoundary';

type Expense = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  splitPercent: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  createdByRole: 'parent1' | 'parent2';
  createdByName: string;
  createdAt: string;
};

type Me = { id: string; role: 'parent1' | 'parent2' };

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  pending:  { color: '#f59e0b', icon: 'time-outline',      label: 'Pending'  },
  approved: { color: '#568960', icon: 'checkmark-circle',  label: 'Approved' },
  rejected: { color: '#ef4444', icon: 'close-circle',      label: 'Rejected' },
  paid:     { color: '#568960', icon: 'card-outline',      label: 'Paid'     },
};

const CATEGORIES = ['childcare','medical','education','clothing','activities','food','travel','other'];

const CATEGORY_ICONS: Record<string, string> = {
  childcare: 'heart', medical: 'medkit', education: 'school',
  clothing: 'shirt', activities: 'bicycle', food: 'fast-food',
  travel: 'airplane', other: 'ellipse',
};

function ExpensesContent() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [split, setSplit] = useState('50');

  const load = useCallback(async () => {
    try {
      const [data, meData] = await Promise.all([
        apiFetch<unknown>('/expenses'),
        apiFetch<Me>('/auth/me'),
      ]);
      setExpenses(Array.isArray(data) ? data : []);
      if (meData && typeof meData === 'object' && 'id' in meData) setMe(meData as Me);
    } catch {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  async function addExpense() {
    if (!desc.trim() || !amount.trim()) { Alert.alert('Error', 'Description and amount required'); return; }
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) { Alert.alert('Error', 'Enter a valid amount'); return; }
    try {
      await apiFetch('/expenses', {
        method: 'POST',
        body: JSON.stringify({ title: desc.trim(), amount: Math.round(parsed * 100), currency: 'usd', category, splitPercent: parseInt(split) }),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAdd(false); setDesc(''); setAmount(''); setCategory('other'); setSplit('50');
      load();
    } catch (e: unknown) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); }
  }

  async function respond(id: string, action: 'approve' | 'reject') {
    try {
      await apiFetch(`/expenses/${id}/respond`, { method: 'PATCH', body: JSON.stringify({ action }) });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      load();
    } catch (e: unknown) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); }
  }

  const myOwed = expenses
    .filter(e => e && e.status === 'approved' && e.createdByRole !== me?.role)
    .reduce((s, e) => s + (Number(e.amount) || 0) * ((Number(e.splitPercent) || 50) / 100), 0);

  const owedToMe = expenses
    .filter(e => e && e.status === 'approved' && e.createdByRole === me?.role)
    .reduce((s, e) => s + (Number(e.amount) || 0) * ((Number(e.splitPercent) || 50) / 100), 0);

  const pending = expenses.filter(e => e && e.status === 'pending');
  const rest = expenses.filter(e => e && e.status !== 'pending');

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f4ee' }}>
      <StatusBar barStyle="light-content" />

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Expenses</Text>
        <View style={styles.balanceRow}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>You owe</Text>
            <Text style={[styles.balanceAmount, { color: myOwed > 0 ? '#ef4444' : '#9a9088' }]}>
              ${myOwed.toFixed(2)}
            </Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Owed to you</Text>
            <Text style={[styles.balanceAmount, { color: owedToMe > 0 ? '#568960' : '#9a9088' }]}>
              ${owedToMe.toFixed(2)}
            </Text>
          </View>
        </View>
        {pending.length > 0 && (
          <View style={styles.pendingBadge}>
            <Ionicons name="alert-circle" size={14} color="#f59e0b" />
            <Text style={styles.pendingText}>{pending.length} expense{pending.length > 1 ? 's' : ''} waiting for your approval</Text>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#568960" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        >
          {expenses.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={48} color="#3d3830" />
              <Text style={styles.emptyTitle}>No expenses yet</Text>
              <Text style={styles.emptyText}>Tap + to log your first shared expense</Text>
            </View>
          ) : (
            <>
              {pending.length > 0 && <Text style={styles.groupLabel}>Needs action</Text>}
              {pending.map(e => <ExpenseCard key={e.id} e={e} me={me} respond={respond} />)}
              {rest.length > 0 && <Text style={styles.groupLabel}>History</Text>}
              {rest.map(e => <ExpenseCard key={e.id} e={e} me={me} respond={respond} />)}
            </>
          )}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => { setShowAdd(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showAdd} animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Log Expense</Text>
            <TouchableOpacity onPress={() => setShowAdd(false)}>
              <Ionicons name="close" size={24} color="#7a7268" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.input} value={desc} onChangeText={setDesc} placeholder="e.g. Soccer registration" placeholderTextColor="#9a9088" />
            <Text style={styles.label}>Amount (USD)</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput style={[styles.input, { flex: 1, marginBottom: 0, borderLeftWidth: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
                value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#9a9088" />
            </View>
            <View style={{ height: 20 }} />
            <Text style={styles.label}>Category</Text>
            <View style={styles.catGrid}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c} onPress={() => setCategory(c)}
                  style={[styles.catPill, category === c && styles.catPillActive]}>
                  <Ionicons name={(CATEGORY_ICONS[c] ?? 'ellipse') as any} size={14} color={category === c ? '#fff' : '#7a7268'} />
                  <Text style={[styles.catText, category === c && styles.catTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Other parent pays</Text>
            <View style={styles.splitRow}>
              {[25, 33, 50, 67, 75].map(v => (
                <TouchableOpacity key={v} onPress={() => setSplit(String(v))}
                  style={[styles.splitBtn, split === String(v) && styles.splitBtnActive]}>
                  <Text style={[styles.splitText, split === String(v) && styles.splitTextActive]}>{v}%</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.btn} onPress={addExpense}>
              <Text style={styles.btnText}>Log Expense</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function ExpenseCard({ e, me, respond }: { e: Expense; me: Me | null; respond: (id: string, action: 'approve' | 'reject') => void }) {
  const cfg = STATUS_CONFIG[e.status] ?? STATUS_CONFIG.other;
  const canRespond = me && e.createdByRole !== me.role && e.status === 'pending';
  const myShare = (Number(e.amount) || 0) * ((Number(e.splitPercent) || 50) / 100);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.catIcon, { backgroundColor: '#f0ebe4' }]}>
          <Ionicons name={(CATEGORY_ICONS[e.category] ?? 'ellipse') as any} size={18} color="#7a7268" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle}>{e.description ?? ''}</Text>
          <Text style={styles.cardSub}>{e.category} · by {e.createdByName ?? ''}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.cardAmount}>${(Number(e.amount) || 0).toFixed(2)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: cfg.color + '18' }]}>
            <Ionicons name={cfg.icon as any} size={10} color={cfg.color} />
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
      </View>
      <View style={styles.cardSplit}>
        <Text style={styles.splitInfo}>Your share: <Text style={{ color: '#2d2820', fontWeight: '700' }}>${myShare.toFixed(2)}</Text> ({e.splitPercent ?? 50}%)</Text>
      </View>
      {canRespond && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => respond(e.id, 'approve')}>
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => respond(e.id, 'reject')}>
            <Ionicons name="close" size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function ExpensesScreen() {
  return <ErrorBoundary><ExpensesContent /></ErrorBoundary>;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: '#2d2820', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 16 },
  balanceRow: { flexDirection: 'row', backgroundColor: '#2d2820', borderRadius: 16, padding: 16 },
  balanceCard: { flex: 1, alignItems: 'center' },
  balanceDivider: { width: 1, backgroundColor: '#3d3830', alignSelf: 'stretch' },
  balanceLabel: { fontSize: 12, color: '#7a7268', fontWeight: '500', marginBottom: 6 },
  balanceAmount: { fontSize: 24, fontWeight: '800' },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f59e0b18', borderRadius: 10, padding: 10, marginTop: 12 },
  pendingText: { fontSize: 12, color: '#f59e0b', fontWeight: '600', marginLeft: 6 },
  groupLabel: { fontSize: 11, fontWeight: '700', color: '#9a9088', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  catIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#2d2820' },
  cardSub: { fontSize: 12, color: '#9a9088', marginTop: 2 },
  cardAmount: { fontSize: 18, fontWeight: '800', color: '#2d2820' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginTop: 4 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginLeft: 3 },
  cardSplit: { borderTopWidth: 1, borderTopColor: '#f0ebe4', marginTop: 12, paddingTop: 10 },
  splitInfo: { fontSize: 12, color: '#7a7268' },
  actionRow: { flexDirection: 'row', marginTop: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, marginRight: 8 },
  approveBtn: { backgroundColor: '#568960' },
  rejectBtn: { backgroundColor: '#ef4444', marginRight: 0 },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '700', marginLeft: 5 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#2d2820', marginTop: 16 },
  emptyText: { fontSize: 13, color: '#9a9088', marginTop: 6, textAlign: 'center' },
  fab: { position: 'absolute', right: 20, bottom: 24, backgroundColor: '#568960', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#568960', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  modal: { flex: 1, backgroundColor: '#f8f4ee' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0ebe4' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#2d2820' },
  label: { fontSize: 13, fontWeight: '600', color: '#4a4238', marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: '#e8e0d8', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 20, backgroundColor: '#fff', color: '#2d2820' },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  currencySymbol: { fontSize: 18, fontWeight: '700', color: '#2d2820', backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e8e0d8', borderRightWidth: 0, borderTopLeftRadius: 12, borderBottomLeftRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  catPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#e8e0d8', margin: 4, backgroundColor: '#fff' },
  catPillActive: { backgroundColor: '#2d2820', borderColor: '#2d2820' },
  catText: { fontSize: 12, color: '#7a7268', fontWeight: '600', marginLeft: 5 },
  catTextActive: { color: '#fff' },
  splitRow: { flexDirection: 'row', marginBottom: 24 },
  splitBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#e8e0d8', alignItems: 'center', backgroundColor: '#fff', marginRight: 8 },
  splitBtnActive: { backgroundColor: '#2d2820', borderColor: '#2d2820' },
  splitText: { fontSize: 13, color: '#7a7268', fontWeight: '600' },
  splitTextActive: { color: '#fff', fontWeight: '700' },
  btn: { backgroundColor: '#2d2820', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
