// src/screens/IELTSScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal,
  Alert, StyleSheet, SafeAreaView
} from 'react-native';
import { useApp } from './AppContext';
import CircularProgress from './CircularProgress';
import {
  Card, CardTitle, StatCard, Badge, PrimaryButton, GhostButton,
  DangerButton, FormInput, EmptyState, TabBar, SectionHeader, Row
} from './UI';
import { colors, spacing, radius, font } from './theme';
import { generateId, todayStr, formatDate, calcStreak } from './helpers';

const MODULES = ['Listening', 'Reading', 'Writing', 'Speaking'];
const MODULE_BADGES = { Listening: 'blue', Reading: 'teal', Writing: 'purple', Speaking: 'amber' };
const BANDS = ['1.0','1.5','2.0','2.5','3.0','3.5','4.0','4.5','5.0','5.5','6.0','6.5','7.0','7.5','8.0','8.5','9.0'];

export default function IELTSScreen() {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState('log');
  const [module, setModule] = useState('');
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState('');
  const [testName, setTestName] = useState('');
  const [correct, setCorrect] = useState('');
  const [band, setBand] = useState('');
  const [bandModal, setBandModal] = useState(false);

  function logSession() {
    if (!date || !module) {
      Alert.alert('Missing Fields', 'Please select a date and module.');
      return;
    }
    dispatch({
      type: 'ADD_IELTS',
      payload: {
        id: generateId(),
        date,
        time,
        module,
        test: testName,
        correct: parseInt(correct) || 0,
        band: parseFloat(band) || 0,
      }
    });
    setTestName(''); setCorrect(''); setBand(''); setModule('');
    Alert.alert('✅ Session Logged!', 'Great work — keep it up!');
  }

  function deleteSession(id) {
    Alert.alert('Delete Session', 'Remove this session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_IELTS', payload: id }) },
    ]);
  }

  const sessions = state.ielts;
  const now = new Date();
  const mo = now.getMonth(), yr = now.getFullYear();
  const thisMonth = sessions.filter(s => {
    const d = new Date(s.date);
    return d.getMonth() === mo && d.getFullYear() === yr;
  });
  const streak = calcStreak(sessions.map(s => s.date));
  const bandsOnly = sessions.filter(s => s.band > 0);
  const avgBand = bandsOnly.length
    ? (bandsOnly.reduce((a, s) => a + s.band, 0) / bandsOnly.length).toFixed(1)
    : '–';
  const consistency = Math.min(100, Math.round((thisMonth.length / 20) * 100));
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <TabBar
          tabs={[{ key: 'log', label: '📝 Log' }, { key: 'analytics', label: '📊 Analytics' }, { key: 'history', label: '📋 History' }]}
          activeTab={tab}
          onSelect={setTab}
        />

        {/* ── LOG TAB ─────────────────────────────────────────── */}
        {tab === 'log' && (
          <Card>
            <CardTitle>Log IELTS Practice</CardTitle>

            <FormInput label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" keyboardType="numeric" />
            <FormInput label="Time (optional)" value={time} onChangeText={setTime} placeholder="HH:MM" />

            <Text style={styles.label}>Module</Text>
            <View style={styles.moduleGrid}>
              {MODULES.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.moduleBtn, module === m && styles.moduleBtnActive]}
                  onPress={() => setModule(m)}
                >
                  <Text style={[styles.moduleBtnText, module === m && styles.moduleBtnTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <FormInput label="Test Name" value={testName} onChangeText={setTestName} placeholder="e.g. Cambridge 15 Test 2" />
            <FormInput label="Correct Answers" value={correct} onChangeText={setCorrect} keyboardType="number-pad" placeholder="e.g. 32 (out of 40)" />

            <Text style={styles.label}>Band Score</Text>
            <TouchableOpacity style={styles.selectBtn} onPress={() => setBandModal(true)}>
              <Text style={band ? styles.selectValue : styles.selectPlaceholder}>
                {band ? `Band ${band}` : 'Select band score'}
              </Text>
            </TouchableOpacity>

            <PrimaryButton label="Log Session" onPress={logSession} style={{ marginTop: 8 }} />
          </Card>
        )}

        {/* ── ANALYTICS TAB ───────────────────────────────────── */}
        {tab === 'analytics' && (
          <>
            <View style={styles.statsRow}>
              <StatCard value={sessions.length} label="Total Sessions" />
              <StatCard value={thisMonth.length} label="This Month" color={colors.blue} />
              <StatCard value={streak} label="Day Streak" color={colors.amber} />
              <StatCard value={avgBand} label="Avg Band" color={colors.teal} />
            </View>

            <Card>
              <CardTitle>Practice Consistency</CardTitle>
              <View style={styles.centered}>
                <CircularProgress percentage={consistency} color={colors.blue} size={120}
                  label="This month" sublabel={`${thisMonth.length}/20 sessions`} />
              </View>
            </Card>

            <Card>
              <CardTitle>Module Breakdown</CardTitle>
              {MODULES.map(m => {
                const count = sessions.filter(s => s.module === m).length;
                const pct = sessions.length ? (count / sessions.length) * 100 : 0;
                const barColors = { Listening: colors.blue, Reading: colors.teal, Writing: colors.purple, Speaking: colors.amber };
                return (
                  <View key={m} style={styles.modRow}>
                    <Text style={styles.modLabel}>{m}</Text>
                    <View style={styles.modBarWrap}>
                      <View style={[styles.modBar, { width: `${pct}%`, backgroundColor: barColors[m] }]} />
                    </View>
                    <Text style={styles.modCount}>{count}</Text>
                  </View>
                );
              })}
            </Card>

            <Card>
              <CardTitle>Band Score History</CardTitle>
              {bandsOnly.length === 0
                ? <EmptyState message="Log sessions with band scores to see your progress" />
                : bandsOnly.slice(-8).reverse().map(s => (
                  <View key={s.id} style={styles.bandRow}>
                    <Text style={styles.bandDate}>{formatDate(s.date)}</Text>
                    <View style={styles.bandBarWrap}>
                      <View style={[styles.bandBar, { width: `${(s.band / 9) * 100}%` }]} />
                    </View>
                    <Text style={styles.bandScore}>{s.band}</Text>
                  </View>
                ))
              }
            </Card>

            <Card>
              <CardTitle>Study Streak</CardTitle>
              <Row style={{ justifyContent: 'space-around' }}>
                <View style={styles.streakBox}>
                  <Text style={[styles.streakNum, { color: colors.amber }]}>{streak}</Text>
                  <Text style={styles.streakLabel}>Current</Text>
                </View>
                <View style={styles.streakBox}>
                  <Text style={[styles.streakNum, { color: colors.blue }]}>{thisMonth.length}</Text>
                  <Text style={styles.streakLabel}>This Month</Text>
                </View>
                <View style={styles.streakBox}>
                  <Text style={[styles.streakNum, { color: colors.teal }]}>{sessions.length}</Text>
                  <Text style={styles.streakLabel}>All Time</Text>
                </View>
              </Row>
            </Card>
          </>
        )}

        {/* ── HISTORY TAB ─────────────────────────────────────── */}
        {tab === 'history' && (
          <>
            {sorted.length === 0
              ? <EmptyState message="No sessions logged yet. Start by logging a practice session!" icon="📝" />
              : sorted.map(s => (
                <View key={s.id} style={styles.logItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.logMain}>{s.test || `${s.module} Practice`}</Text>
                    <Text style={styles.logSub}>
                      {formatDate(s.date)}{s.time ? ` · ${s.time}` : ''} · {s.correct || 0} correct
                    </Text>
                    <View style={styles.badgeRow}>
                      <Badge label={s.module} variant={MODULE_BADGES[s.module] || 'blue'} />
                      {s.band > 0 && <Badge label={`Band ${s.band}`} variant="purple" />}
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => deleteSession(s.id)} style={styles.delBtn}>
                    <Text style={styles.delBtnText}>🗑</Text>
                  </TouchableOpacity>
                </View>
              ))
            }
          </>
        )}
      </ScrollView>

      {/* Band picker modal */}
      <Modal visible={bandModal} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>Select Band Score</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {BANDS.map(b => (
                <TouchableOpacity key={b} style={[styles.pickerItem, band === b && styles.pickerItemActive]}
                  onPress={() => { setBand(b); setBandModal(false); }}>
                  <Text style={[styles.pickerItemText, band === b && styles.pickerItemTextActive]}>
                    Band {b}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <GhostButton label="Cancel" onPress={() => setBandModal(false)} style={{ marginTop: 10 }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 40 },
  label: { fontSize: font.caption, color: colors.text2, fontWeight: '600', marginBottom: 6 },
  moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 },
  moduleBtn: {
    flex: 1, minWidth: '45%', padding: 10,
    backgroundColor: colors.bg3, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.sm, alignItems: 'center',
  },
  moduleBtnActive: { borderColor: colors.blue, backgroundColor: '#0d1a35' },
  moduleBtnText: { fontSize: font.body, color: colors.text2, fontWeight: '500' },
  moduleBtnTextActive: { color: colors.blue, fontWeight: '700' },
  selectBtn: {
    backgroundColor: colors.bg3, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.sm,
    padding: 11, marginBottom: 14,
  },
  selectValue: { fontSize: font.body, color: colors.text },
  selectPlaceholder: { fontSize: font.body, color: colors.text3 },
  statsRow: { flexDirection: 'row', marginBottom: 14, flexWrap: 'wrap' },
  centered: { alignItems: 'center', paddingVertical: 10 },
  modRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  modLabel: { width: 80, fontSize: font.caption, color: colors.text2 },
  modBarWrap: { flex: 1, height: 8, backgroundColor: colors.bg4, borderRadius: 4, marginHorizontal: 8 },
  modBar: { height: 8, borderRadius: 4 },
  modCount: { width: 24, fontSize: font.caption, color: colors.text2, textAlign: 'right' },
  bandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  bandDate: { width: 90, fontSize: font.small, color: colors.text2 },
  bandBarWrap: { flex: 1, height: 6, backgroundColor: colors.bg4, borderRadius: 3, marginHorizontal: 8 },
  bandBar: { height: 6, borderRadius: 3, backgroundColor: colors.blue },
  bandScore: { width: 28, fontSize: font.caption, color: colors.blue, fontWeight: '700', textAlign: 'right' },
  streakBox: { alignItems: 'center' },
  streakNum: { fontSize: 28, fontWeight: '800', lineHeight: 32 },
  streakLabel: { fontSize: font.small, color: colors.text2, marginTop: 4 },
  logItem: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: colors.bg3, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.sm, padding: 12, marginBottom: 8,
  },
  logMain: { fontSize: font.body, color: colors.text, fontWeight: '600', marginBottom: 3 },
  logSub: { fontSize: font.small, color: colors.text2, marginBottom: 6 },
  badgeRow: { flexDirection: 'row' },
  delBtn: {
    padding: 7, backgroundColor: colors.bg4, borderRadius: radius.sm,
    borderWidth: 1, borderColor: '#6b2a2a', marginLeft: 8,
  },
  delBtnText: { fontSize: 14 },
  pickerOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  pickerBox: {
    backgroundColor: colors.bg2, borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg, padding: 20,
    borderWidth: 1, borderColor: colors.border2,
  },
  pickerTitle: { fontSize: font.large, fontWeight: '700', color: colors.text, marginBottom: 14 },
  pickerItem: { padding: 14, borderRadius: radius.sm, marginBottom: 4 },
  pickerItemActive: { backgroundColor: '#0d1a35' },
  pickerItemText: { fontSize: font.body, color: colors.text2 },
  pickerItemTextActive: { color: colors.blue, fontWeight: '700' },
});