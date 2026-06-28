// src/screens/HomeScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal,
  TextInput, Alert, StyleSheet, SafeAreaView
} from 'react-native';
import { useApp } from './AppContext';
import CircularProgress from './CircularProgress';
import { Card, CardTitle, PrimaryButton, GhostButton, DangerButton, EmptyState, SectionHeader } from './UI';
import { colors, spacing, radius, font } from './theme';
import { generateId, calcStreak, getLast28Days } from './helpers';

export default function HomeScreen() {
  const { state, dispatch } = useApp();
  const [noteModal, setNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [infoModal, setInfoModal] = useState(null);

  function openAddNote() {
    setEditingNote(null);
    setNoteText('');
    setNoteModal(true);
  }
  function openEditNote(note) {
    setEditingNote(note);
    setNoteText(note.text);
    setNoteModal(true);
  }
  function saveNote() {
    if (!noteText.trim()) return;
    if (editingNote) {
      dispatch({ type: 'UPDATE_NOTE', payload: { ...editingNote, text: noteText.trim(), updatedAt: Date.now() } });
    } else {
      dispatch({ type: 'ADD_NOTE', payload: { id: generateId(), text: noteText.trim(), createdAt: Date.now() } });
    }
    setNoteModal(false);
  }
  function deleteNote(id) {
    Alert.alert('Delete Note', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_NOTE', payload: id }) },
    ]);
  }

  // ── Progress calculations ──────────────────────────────────────────────────
  function ieltsProgress() {
    const now = new Date();
    const mo = now.getMonth(), yr = now.getFullYear();
    const thisMonth = state.ielts.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === mo && d.getFullYear() === yr;
    });
    return Math.min(100, Math.round((thisMonth.length / 20) * 100));
  }

  function booksProgress() {
    if (!state.books.length) return 0;
    const done = state.books.filter(b => b.done).length;
    return Math.round((done / state.books.length) * 100);
  }

  function sleepProgress() {
    const now = new Date();
    const mo = now.getMonth(), yr = now.getFullYear();
    const thisMonth = state.sleep.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === mo && d.getFullYear() === yr;
    });
    if (!thisMonth.length) return 0;
    const good = thisMonth.filter(s => s.duration >= 6 && s.duration <= 9).length;
    return Math.round((good / thisMonth.length) * 100);
  }

  function workoutProgress() {
    if (!state.workouts.length) return 0;
    const days28 = getLast28Days();
    const active = new Set(state.workouts.map(w => w.date).filter(d => days28.includes(d)));
    return Math.round((active.size / 28) * 100);
  }

  const rings = [
    { key: 'ielts', label: 'IELTS', color: colors.blue, pct: ieltsProgress(),
      info: 'Tracks how many IELTS practice sessions you have completed this month (target: 20 sessions = 100%).' },
    { key: 'books', label: 'Books', color: colors.teal, pct: booksProgress(),
      info: 'Shows the percentage of books in your library that you have fully completed.' },
    { key: 'sleep', label: 'Sleep', color: colors.purple, pct: sleepProgress(),
      info: 'Shows what percentage of nights this month you achieved 6–9 hours of quality sleep.' },
    { key: 'workout', label: 'Workout', color: colors.amber, pct: workoutProgress(),
      info: 'Tracks how many of the last 28 days you completed a workout (daily = 100%).' },
  ];

  const sortedNotes = [...state.notes].sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good {getTimeOfDay()} 👋</Text>
          <Text style={styles.subtitle}>Here's your progress overview</Text>
        </View>

        {/* Notes */}
        <Card>
          <SectionHeader title="Notes">
            <TouchableOpacity style={styles.addBtn} onPress={openAddNote}>
              <Text style={styles.addBtnText}>+ Add Note</Text>
            </TouchableOpacity>
          </SectionHeader>
          {sortedNotes.length === 0
            ? <EmptyState message="No notes yet. Tap '+ Add Note' to get started." icon="📝" />
            : sortedNotes.map(note => (
              <View key={note.id} style={styles.noteItem}>
                <View style={styles.noteBody}>
                  <Text style={styles.noteText}>{note.text}</Text>
                  <Text style={styles.noteTime}>
                    {new Date(note.updatedAt || note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.noteActions}>
                  <TouchableOpacity style={styles.noteBtn} onPress={() => openEditNote(note)}>
                    <Text style={styles.noteBtnText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.noteBtn, styles.noteBtnDanger]} onPress={() => deleteNote(note.id)}>
                    <Text style={styles.noteBtnText}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          }
        </Card>

        {/* Progress rings */}
        <Card>
          <CardTitle>Overall Progress</CardTitle>
          <View style={styles.ringsGrid}>
            {rings.map(r => (
              <TouchableOpacity key={r.key} onPress={() => setInfoModal(r)} style={styles.ringWrap}>
                <CircularProgress percentage={r.pct} color={r.color} size={90} />
                <Text style={styles.ringLabel}>{r.label}</Text>
                <Text style={styles.ringHint}>Tap for info</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </ScrollView>

      {/* Add/Edit Note Modal */}
      <Modal visible={noteModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editingNote ? 'Edit Note' : 'Add Note'}</Text>
            <TextInput
              style={styles.noteInput}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Write a reminder or thought..."
              placeholderTextColor={colors.text3}
              multiline
              numberOfLines={4}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <PrimaryButton label="Save" onPress={saveNote} style={{ flex: 1 }} />
              <GhostButton label="Cancel" onPress={() => setNoteModal(false)} style={{ flex: 1, marginLeft: 8 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Info Modal */}
      <Modal visible={!!infoModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setInfoModal(null)} activeOpacity={1}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{infoModal?.label} Progress</Text>
            <Text style={styles.modalBody}>{infoModal?.info}</Text>
            <View style={{ alignItems: 'center', marginTop: 14 }}>
              <CircularProgress percentage={infoModal?.pct || 0} color={infoModal?.color || colors.blue} size={110} />
            </View>
            <GhostButton label="Close" onPress={() => setInfoModal(null)} style={{ marginTop: 16 }} />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 40 },
  header: { marginBottom: 20 },
  greeting: { fontSize: font.xl, fontWeight: '800', color: colors.text, marginBottom: 3 },
  subtitle: { fontSize: font.body, color: colors.text2 },
  addBtn: {
    backgroundColor: colors.blue,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
  },
  addBtnText: { color: '#fff', fontSize: font.caption, fontWeight: '700' },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: 8,
  },
  noteBody: { flex: 1 },
  noteText: { fontSize: font.body, color: colors.text, lineHeight: 20 },
  noteTime: { fontSize: font.small, color: colors.text3, marginTop: 4 },
  noteActions: { flexDirection: 'row', marginLeft: 8 },
  noteBtn: {
    padding: 6,
    backgroundColor: colors.bg4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteBtnDanger: { borderColor: '#6b2a2a' },
  noteBtnText: { fontSize: 14 },
  ringsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  ringWrap: { alignItems: 'center', width: '45%', marginBottom: 8 },
  ringLabel: { fontSize: font.caption, color: colors.text2, fontWeight: '600', marginTop: 6 },
  ringHint: { fontSize: 10, color: colors.text3, marginTop: 2 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  modalBox: {
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: radius.lg,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: { fontSize: font.large, fontWeight: '700', color: colors.text, marginBottom: 14 },
  modalBody: { fontSize: font.body, color: colors.text2, lineHeight: 22 },
  noteInput: {
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    fontSize: font.body,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  modalBtns: { flexDirection: 'row' },
});