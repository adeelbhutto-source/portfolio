import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '../../src/api/client';

type Message = {
  id: string;
  content: string;
  senderId: string;
  senderRole: 'parent1' | 'parent2';
  senderName: string;
  createdAt: string;
  readAt?: string;
  aiFlag?: 'ok' | 'warning' | 'blocked';
  aiSuggestion?: string;
};

type AiReview = { flag: 'ok' | 'warning' | 'blocked'; reason?: string; suggestion?: string };

export default function MessagesScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [myId, setMyId] = useState('');
  const [text, setText] = useState('');
  const [aiReview, setAiReview] = useState<AiReview | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<FlatList>(null);

  async function load() {
    try {
      const [msgs, me] = await Promise.all([
        apiFetch<Message[]>('/messages'),
        apiFetch<{ id: string }>('/auth/me'),
      ]);
      setMessages(msgs.reverse());
      setMyId(me.id);
    } catch {}
  }

  useEffect(() => {
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  function onChangeText(t: string) {
    setText(t);
    setAiReview(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (t.trim().length < 5) return;
    debounceRef.current = setTimeout(async () => {
      setReviewing(true);
      try {
        const r = await apiFetch<AiReview>('/messages/review', { method: 'POST', body: JSON.stringify({ content: t }) });
        setAiReview(r);
      } catch {} finally { setReviewing(false); }
    }, 800);
  }

  async function send() {
    if (!text.trim() || aiReview?.flag === 'blocked') return;
    setSending(true);
    try {
      await apiFetch('/messages', { method: 'POST', body: JSON.stringify({ content: text }) });
      setText(''); setAiReview(null);
      await load();
      listRef.current?.scrollToEnd({ animated: true });
    } catch {} finally { setSending(false); }
  }

  const roleColor = (role: 'parent1' | 'parent2') => role === 'parent1' ? '#568960' : '#ec4899';

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#f8f4ee' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSub}>Tamper-proof communication</Text>
      </View>

      {messages.length === 0 && !sending && (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color="#3d3830" />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptyText}>Invite your co-parent to start communicating. Share your invite code from the Home screen.</Text>
        </View>
      )}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 8 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item: m }) => {
          const mine = m.senderId === myId;
          return (
            <View style={[styles.bubbleRow, mine && styles.bubbleRowRight]}>
              <View style={[styles.bubble, { backgroundColor: mine ? roleColor(m.senderRole) : '#fff', borderColor: mine ? roleColor(m.senderRole) : '#e8e0d8' }]}>
                {!mine && <Text style={[styles.senderName, { color: roleColor(m.senderRole) }]}>{m.senderName}</Text>}
                <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{m.content}</Text>
                <View style={styles.bubbleMeta}>
                  <Text style={[styles.time, mine && styles.timeMine]}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  {mine && m.readAt && <Ionicons name="checkmark-done" size={12} color="rgba(255,255,255,0.8)" style={{ marginLeft: 4 }} />}
                </View>
              </View>
            </View>
          );
        }}
      />

      {aiReview && aiReview.flag !== 'ok' && (
        <View style={[styles.aiBanner, aiReview.flag === 'blocked' ? styles.aiBlocked : styles.aiWarning]}>
          <Ionicons name={aiReview.flag === 'blocked' ? 'close-circle' : 'alert-circle'} size={14} color={aiReview.flag === 'blocked' ? '#ef4444' : '#f59e0b'} />
          <Text style={[styles.aiText, aiReview.flag === 'blocked' ? { color: '#ef4444' } : { color: '#b45309' }]}>
            {' '}{aiReview.flag === 'blocked' ? 'Blocked: ' : 'Warning: '}{aiReview.reason}
          </Text>
        </View>
      )}
      {aiReview?.suggestion && (
        <View style={styles.suggestionBanner}>
          <Text style={styles.suggestionText}>Suggestion: {aiReview.suggestion}</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, aiReview?.flag === 'blocked' && styles.inputBlocked]}
          value={text}
          onChangeText={onChangeText}
          placeholder="Type a message…"
          placeholderTextColor="#9a9088"
          multiline
          maxLength={1000}
        />
        {reviewing && <ActivityIndicator size="small" color="#2d2820" style={{ marginHorizontal: 6 }} />}
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || aiReview?.flag === 'blocked' || sending) && styles.sendBtnDisabled]}
          onPress={send}
          disabled={!text.trim() || aiReview?.flag === 'blocked' || sending}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#2d2820', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: '#4a4238', marginTop: 2 },
  bubbleRow: { flexDirection: 'row', marginBottom: 8 },
  bubbleRowRight: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', borderRadius: 18, padding: 12, borderWidth: 1 },
  senderName: { fontSize: 11, fontWeight: '700', marginBottom: 3 },
  bubbleText: { fontSize: 14, color: '#2d2820' },
  bubbleTextMine: { color: '#fff' },
  bubbleMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, justifyContent: 'flex-end' },
  time: { fontSize: 10, color: '#9a9088' },
  timeMine: { color: 'rgba(255,255,255,0.7)' },
  aiBanner: { flexDirection: 'row', alignItems: 'center', padding: 10, marginHorizontal: 12, borderRadius: 10, marginBottom: 4 },
  aiBlocked: { backgroundColor: '#fee2e2' },
  aiWarning: { backgroundColor: '#fef3c7' },
  aiText: { fontSize: 12, flex: 1 },
  suggestionBanner: { backgroundColor: '#e0f2fe', padding: 10, marginHorizontal: 12, borderRadius: 10, marginBottom: 4 },
  suggestionText: { fontSize: 12, color: '#0369a1' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0ebe4' },
  input: { flex: 1, borderWidth: 1.5, borderColor: '#e8e0d8', borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, maxHeight: 100, backgroundColor: '#f8f4ee', color: '#2d2820' },
  inputBlocked: { borderColor: '#fca5a5', backgroundColor: '#fff1f2' },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#2d2820', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  sendBtnDisabled: { opacity: 0.4 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#2d2820', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#7a7268', textAlign: 'center', lineHeight: 22 },
});
