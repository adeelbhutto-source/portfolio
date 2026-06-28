'use client';
import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar,
  ActivityIndicator, Clipboard, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '../../src/api/client';

type Msg = { role: 'user' | 'assistant'; content: string };

const MODES = [
  { label: 'Calm Rewrite', icon: 'pencil', prompt: 'Please rewrite the following message to sound calmer and child-focused:\n\n' },
  { label: 'Court-Safe', icon: 'shield-checkmark', prompt: 'Rewrite this message to be clear, factual and appropriate for documentation:\n\n' },
  { label: 'Boundary', icon: 'hand-left', prompt: 'Help me communicate a firm but calm boundary around this situation:\n\n' },
  { label: 'Free Chat', icon: 'chatbubble', prompt: '' },
];

export default function CoachScreen() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  async function send() {
    if (!input.trim() || loading) return;
    const content = MODES[mode].prompt + input.trim();
    const userMsg: Msg = { role: 'user', content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    try {
      const apiMessages = [...newMsgs.slice(-19)];
      if (MODES[mode].prompt && apiMessages.length === 1) {
        apiMessages[0] = { role: 'user', content };
      }
      const { reply } = await apiFetch<{ reply: string }>('/coaching/message', {
        method: 'POST',
        body: JSON.stringify({ messages: apiMessages }),
      });
      const botMsg: Msg = { role: 'assistant', content: reply };
      setMessages(prev => [...prev, botMsg]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Coach unavailable. Upgrade to Personal plan.');
    } finally {
      setLoading(false);
    }
  }

  function copyMsg(text: string) {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Message copied to clipboard.');
  }

  function clearChat() {
    Alert.alert('Clear chat', 'Start a new conversation?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => setMessages([]) },
    ]);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Coach</Text>
          <Text style={s.headerSub}>Calm co-parenting guidance</Text>
        </View>
        {messages.length > 0 && (
          <TouchableOpacity onPress={clearChat} style={s.clearBtn}>
            <Ionicons name="refresh-outline" size={20} color="#9a9088" />
          </TouchableOpacity>
        )}
      </View>

      {/* Mode selector */}
      <View style={s.modeRow}>
        {MODES.map((m, i) => (
          <TouchableOpacity
            key={m.label}
            style={[s.modeBtn, mode === i && s.modeBtnActive]}
            onPress={() => setMode(i)}
          >
            <Ionicons name={m.icon as any} size={13} color={mode === i ? '#fff' : '#7a7268'} />
            <Text style={[s.modeTxt, mode === i && s.modeTxtActive]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={s.messages}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
      >
        {messages.length === 0 && (
          <View style={s.empty}>
            <View style={s.emptyIcon}>
              <Ionicons name="bulb-outline" size={32} color="#568960" />
            </View>
            <Text style={s.emptyTitle}>Your co-parenting coach</Text>
            <Text style={s.emptySub}>Choose a mode above and type your message. The coach helps you communicate calmly and keep the focus on your children.</Text>
          </View>
        )}

        {messages.map((msg, i) => (
          <View key={i} style={[s.bubble, msg.role === 'user' ? s.bubbleUser : s.bubbleBot]}>
            {msg.role === 'assistant' && (
              <Text style={s.botLabel}>PeaceCoach</Text>
            )}
            <Text style={[s.bubbleText, msg.role === 'user' ? s.bubbleTextUser : s.bubbleTextBot]}>
              {msg.content}
            </Text>
            {msg.role === 'assistant' && (
              <TouchableOpacity onPress={() => copyMsg(msg.content)} style={s.copyBtn}>
                <Ionicons name="copy-outline" size={14} color="#9a9088" />
                <Text style={s.copyTxt}>Copy</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {loading && (
          <View style={[s.bubble, s.bubbleBot]}>
            <Text style={s.botLabel}>PeaceCoach</Text>
            <ActivityIndicator size="small" color="#568960" style={{ marginVertical: 4 }} />
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder={MODES[mode].prompt ? 'Paste your message or describe the situation…' : 'Ask the coach anything…'}
          placeholderTextColor="#9a9088"
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnDisabled]}
          onPress={send}
          disabled={!input.trim() || loading}
        >
          <Ionicons name="arrow-up" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: '#2d2820', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: '#7a7268', marginTop: 2 },
  clearBtn: { padding: 8 },
  modeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f8f4ee', borderBottomWidth: 1, borderBottomColor: '#e8e0d8' },
  modeBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: '#e8e0d8', backgroundColor: '#fff' },
  modeBtnActive: { backgroundColor: '#568960', borderColor: '#568960' },
  modeTxt: { fontSize: 11, fontWeight: '600', color: '#7a7268' },
  modeTxtActive: { color: '#fff' },
  messages: { flex: 1, backgroundColor: '#f8f4ee' },
  empty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#eaf2eb', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#2d2820', marginBottom: 10, textAlign: 'center' },
  emptySub: { fontSize: 14, color: '#7a7268', textAlign: 'center', lineHeight: 21 },
  bubble: { marginBottom: 12, maxWidth: '88%' },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: '#2d2820', borderRadius: 18, borderBottomRightRadius: 4, padding: 12 },
  bubbleBot: { alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: 18, borderBottomLeftRadius: 4, padding: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  botLabel: { fontSize: 10, fontWeight: '700', color: '#568960', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  bubbleTextUser: { color: '#fff' },
  bubbleTextBot: { color: '#2d2820' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  copyTxt: { fontSize: 12, color: '#9a9088' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e8e0d8' },
  input: { flex: 1, borderWidth: 1.5, borderColor: '#e8e0d8', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, backgroundColor: '#f8f4ee', color: '#2d2820', maxHeight: 120 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#568960', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
});
