// src/screens/BooksScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal,
  Alert, StyleSheet, SafeAreaView
} from 'react-native';
import { useApp } from './AppContext';
import CircularProgress from './CircularProgress';
import {
  Card, CardTitle, StatCard, PrimaryButton, GhostButton, FormInput, EmptyState, SectionHeader, Row
} from './UI';
import { colors, spacing, radius, font } from './theme';
import { generateId, todayStr, formatDate, calcStreak } from './helpers';

export default function BooksScreen() {
  const { state, dispatch } = useApp();
  const [bookModal, setBookModal] = useState(false);
  const [pagesModal, setPagesModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [activeBookId, setActiveBookId] = useState(null);

  // Form state
  const [bookName, setBookName] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [pagesRead, setPagesRead] = useState('');

  const books = state.books;
  const done = books.filter(b => b.done).length;
  const totalPagesRead = books.reduce((a, b) => a + b.read, 0);
  const allReadDates = books.flatMap(b => b.history.map(h => h.date));
  const streak = calcStreak(allReadDates);

  const avgPagesPerDay = (() => {
    const booksWithHistory = books.filter(b => b.history.length > 0);
    if (!booksWithHistory.length) return 0;
    const total = booksWithHistory.reduce((sum, b) => {
      const pgs = b.history.reduce((a, h) => a + h.pages, 0);
      return sum + pgs / b.history.length;
    }, 0);
    return Math.round(total / booksWithHistory.length);
  })();

  const completionPct = books.length ? Math.round((done / books.length) * 100) : 0;

  function openAdd() {
    setEditingBook(null);
    setBookName(''); setAuthor(''); setTotalPages('');
    setBookModal(true);
  }
  function openEdit(b) {
    setEditingBook(b);
    setBookName(b.name); setAuthor(b.author); setTotalPages(String(b.total));
    setBookModal(true);
  }
  function saveBook() {
    if (!bookName.trim() || !totalPages) {
      Alert.alert('Missing Fields', 'Please enter book name and total pages.');
      return;
    }
    if (editingBook) {
      dispatch({ type: 'UPDATE_BOOK', payload: { ...editingBook, name: bookName.trim(), author: author.trim(), total: parseInt(totalPages) } });
    } else {
      dispatch({
        type: 'ADD_BOOK',
        payload: {
          id: generateId(),
          name: bookName.trim(),
          author: author.trim(),
          total: parseInt(totalPages),
          read: 0,
          history: [],
          done: false,
          startDate: todayStr(),
        }
      });
    }
    setBookModal(false);
  }
  function openLogPages(id) {
    setActiveBookId(id);
    setPagesRead('');
    setPagesModal(true);
  }
  function logPages() {
    const pages = parseInt(pagesRead) || 0;
    if (!pages) { Alert.alert('Error', 'Enter pages read.'); return; }
    const book = books.find(b => b.id === activeBookId);
    if (!book) return;
    const newRead = Math.min(book.total, book.read + pages);
    const done = newRead >= book.total;
    dispatch({
      type: 'UPDATE_BOOK',
      payload: {
        ...book,
        read: newRead,
        done,
        history: [...book.history, { date: todayStr(), pages }],
      }
    });
    setPagesModal(false);
  }
  function deleteBook(id) {
    Alert.alert('Delete Book', 'Remove this book?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_BOOK', payload: id }) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard value={books.length} label="Total Books" />
          <StatCard value={done} label="Completed" color={colors.teal} />
          <StatCard value={totalPagesRead.toLocaleString()} label="Pages Read" color={colors.blue} />
          <StatCard value={streak} label="Day Streak" color={colors.amber} />
        </View>

        {/* Ring */}
        <Card>
          <CardTitle>Reading Consistency</CardTitle>
          <View style={styles.ringRow}>
            <CircularProgress percentage={completionPct} color={colors.teal} size={110}
              label="Completion" sublabel={`${done} of ${books.length} books`} />
            <View style={styles.ringStats}>
              <View style={styles.miniStat}>
                <Text style={[styles.miniNum, { color: colors.blue }]}>{avgPagesPerDay}</Text>
                <Text style={styles.miniLabel}>avg pages/day</Text>
              </View>
              <View style={styles.miniStat}>
                <Text style={[styles.miniNum, { color: colors.green }]}>{streak}</Text>
                <Text style={styles.miniLabel}>day streak</Text>
              </View>
              <View style={styles.miniStat}>
                <Text style={[styles.miniNum, { color: colors.purple }]}>{done}</Text>
                <Text style={styles.miniLabel}>finished</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Book list */}
        <SectionHeader title="My Books">
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Text style={styles.addBtnText}>+ Add Book</Text>
          </TouchableOpacity>
        </SectionHeader>

        {books.length === 0
          ? <EmptyState message="No books yet. Add your first book!" icon="📚" />
          : books.map(b => {
            const pct = Math.round((b.read / b.total) * 100);
            const rem = b.total - b.read;
            const avgPg = b.history.length
              ? Math.round(b.history.reduce((a, h) => a + h.pages, 0) / b.history.length)
              : 0;
            return (
              <View key={b.id} style={styles.bookCard}>
                <View style={styles.bookHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookName}>{b.name} {b.done ? '✅' : ''}</Text>
                    <Text style={styles.bookAuthor}>by {b.author || 'Unknown'}</Text>
                  </View>
                  <View style={styles.bookActions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => openLogPages(b.id)}>
                      <Text style={styles.actionBtnText}>+ Pages</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => openEdit(b)}>
                      <Text style={styles.actionBtnText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.delBtn]} onPress={() => deleteBook(b.id)}>
                      <Text style={styles.actionBtnText}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.progressBarWrap}>
                  <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
                </View>
                <View style={styles.bookStats}>
                  <Text style={styles.bookStat}>{b.read}/{b.total} pg</Text>
                  <Text style={styles.bookStat}>{pct}% done</Text>
                  <Text style={styles.bookStat}>{rem} left</Text>
                  <Text style={styles.bookStat}>~{avgPg} pg/day</Text>
                </View>
              </View>
            );
          })
        }
      </ScrollView>

      {/* Add/Edit Book Modal */}
      <Modal visible={bookModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editingBook ? 'Edit Book' : 'Add Book'}</Text>
            <FormInput label="Book Name" value={bookName} onChangeText={setBookName} placeholder="e.g. Atomic Habits" />
            <FormInput label="Author" value={author} onChangeText={setAuthor} placeholder="Author name" />
            <FormInput label="Total Pages" value={totalPages} onChangeText={setTotalPages} keyboardType="number-pad" placeholder="e.g. 320" />
            <View style={styles.modalBtns}>
              <PrimaryButton label="Save" onPress={saveBook} style={{ flex: 1 }} />
              <GhostButton label="Cancel" onPress={() => setBookModal(false)} style={{ flex: 1, marginLeft: 8 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Log Pages Modal */}
      <Modal visible={pagesModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Log Pages Read</Text>
            <Text style={styles.modalSub}>
              {books.find(b => b.id === activeBookId)?.name}
            </Text>
            <FormInput label="Pages Read" value={pagesRead} onChangeText={setPagesRead} keyboardType="number-pad" placeholder="e.g. 20" autoFocus />
            <View style={styles.modalBtns}>
              <PrimaryButton label="Update" onPress={logPages} style={{ flex: 1 }} />
              <GhostButton label="Cancel" onPress={() => setPagesModal(false)} style={{ flex: 1, marginLeft: 8 }} />
            </View>
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
  statsRow: { flexDirection: 'row', marginBottom: 14, flexWrap: 'wrap' },
  ringRow: { flexDirection: 'row', alignItems: 'center' },
  ringStats: { flex: 1 },
  miniStat: { marginBottom: 12 },
  miniNum: { fontSize: 22, fontWeight: '800' },
  miniLabel: { fontSize: font.small, color: colors.text2, marginTop: 2 },
  addBtn: { backgroundColor: colors.blue, paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.sm },
  addBtnText: { color: '#fff', fontSize: font.caption, fontWeight: '700' },
  bookCard: {
    backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: 12, marginBottom: 10,
  },
  bookHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  bookName: { fontSize: font.body, fontWeight: '700', color: colors.text },
  bookAuthor: { fontSize: font.caption, color: colors.text2, marginTop: 2 },
  bookActions: { flexDirection: 'row', marginLeft: 8 },
  actionBtn: {
    paddingVertical: 5, paddingHorizontal: 8,
    backgroundColor: colors.bg3, borderRadius: radius.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  editBtn: {},
  delBtn: { borderColor: '#6b2a2a' },
  actionBtnText: { fontSize: 11, color: colors.text2, fontWeight: '600' },
  progressBarWrap: { height: 6, backgroundColor: colors.bg4, borderRadius: 3, marginBottom: 8 },
  progressBarFill: { height: 6, backgroundColor: colors.teal, borderRadius: 3 },
  bookStats: { flexDirection: 'row', flexWrap: 'wrap' },
  bookStat: { fontSize: font.small, color: colors.text2 },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  modal: {
    backgroundColor: colors.bg2, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border2, padding: 20, width: '100%',
  },
  modalTitle: { fontSize: font.large, fontWeight: '700', color: colors.text, marginBottom: 4 },
  modalSub: { fontSize: font.caption, color: colors.text2, marginBottom: 14 },
  modalBtns: { flexDirection: 'row', marginTop: 6 },
});