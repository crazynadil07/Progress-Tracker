// src/utils/helpers.js
import { format, differenceInDays, parseISO, isToday, isYesterday } from 'date-fns';

export function todayStr() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDate(dateStr) {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  try {
    const [h, m] = timeStr.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
  } catch {
    return timeStr;
  }
}

export function calcStreak(dates) {
  if (!dates || dates.length === 0) return 0;
  const unique = [...new Set(dates)].sort().reverse();
  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (const d of unique) {
    const dd = parseISO(d);
    dd.setHours(0, 0, 0, 0);
    const diff = Math.round((current - dd) / 86400000);
    if (diff === 0 || diff === 1) {
      streak++;
      current = dd;
    } else {
      break;
    }
  }
  return streak;
}

export function calcLongestStreak(dates) {
  if (!dates || dates.length === 0) return 0;
  const unique = [...new Set(dates)].sort();
  let max = 1, cur = 1;
  for (let i = 1; i < unique.length; i++) {
    const a = parseISO(unique[i - 1]);
    const b = parseISO(unique[i]);
    const diff = Math.round((b - a) / 86400000);
    if (diff === 1) { cur++; max = Math.max(max, cur); }
    else cur = 1;
  }
  return max;
}

export function calcSleepDuration(sleepTime, wakeTime) {
  const [sh, sm] = sleepTime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  let sleepMins = sh * 60 + sm;
  let wakeMins = wh * 60 + wm;
  if (wakeMins <= sleepMins) wakeMins += 24 * 60;
  const dur = (wakeMins - sleepMins) / 60;
  return Math.round(dur * 10) / 10;
}

export function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(format(d, 'yyyy-MM-dd'));
  }
  return days;
}

export function getLast28Days() {
  const days = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(format(d, 'yyyy-MM-dd'));
  }
  return days;
}

export function getMonthDays(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function formatSeconds(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 5);
}