// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  NOTES: 'tracker_notes',
  IELTS: 'tracker_ielts',
  BOOKS: 'tracker_books',
  SLEEP: 'tracker_sleep',
  WORKOUTS: 'tracker_workouts',
  EVENTS: 'tracker_events',
  SONGS: 'tracker_songs_meta',
};

export async function loadData(key) {
  try {
    const val = await AsyncStorage.getItem(KEYS[key]);
    return val ? JSON.parse(val) : [];
  } catch (e) {
    console.error('Load error', e);
    return [];
  }
}

export async function saveData(key, data) {
  try {
    await AsyncStorage.setItem(KEYS[key], JSON.stringify(data));
  } catch (e) {
    console.error('Save error', e);
  }
}

export async function loadAllData() {
  const [notes, ielts, books, sleep, workouts, events] = await Promise.all([
    loadData('NOTES'),
    loadData('IELTS'),
    loadData('BOOKS'),
    loadData('SLEEP'),
    loadData('WORKOUTS'),
    loadData('EVENTS'),
  ]);
  return { notes, ielts, books, sleep, workouts, events };
}