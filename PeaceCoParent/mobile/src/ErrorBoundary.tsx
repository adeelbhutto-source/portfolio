import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface State { error: string | null; info: string | null; }

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): State {
    return { error: error.message, info: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error: error.message, info: info.componentStack ?? null });
  }

  render() {
    if (this.state.error) {
      return (
        <ScrollView style={styles.container}>
          <Text style={styles.title}>Crash Report</Text>
          <Text style={styles.label}>Error:</Text>
          <Text style={styles.error}>{this.state.error}</Text>
          {this.state.info && (
            <>
              <Text style={styles.label}>Stack:</Text>
              <Text style={styles.stack}>{this.state.info}</Text>
            </>
          )}
          <TouchableOpacity style={styles.btn} onPress={() => this.setState({ error: null, info: null })}>
            <Text style={styles.btnText}>Try again</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20, paddingTop: 60 },
  title: { fontSize: 20, fontWeight: '800', color: '#ef4444', marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', color: '#94a3b8', marginBottom: 4, marginTop: 12 },
  error: { fontSize: 14, color: '#fca5a5', fontFamily: 'monospace' },
  stack: { fontSize: 10, color: '#475569', fontFamily: 'monospace' },
  btn: { backgroundColor: '#1e293b', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontWeight: '700' },
});
