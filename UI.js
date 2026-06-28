// src/components/UI.js
import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, radius, font, shadow } from './theme';

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function CardTitle({ children }) {
  return <Text style={styles.cardTitle}>{children}</Text>;
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
export function StatCard({ value, label, color }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statNum, color ? { color } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
const badgeColors = {
  blue:   { bg: '#1a2a4a', text: colors.blue },
  teal:   { bg: '#0d2a28', text: colors.teal },
  purple: { bg: '#1e1040', text: colors.purple },
  amber:  { bg: '#2a1d00', text: colors.amber },
  green:  { bg: '#0d2a1a', text: colors.green },
  coral:  { bg: '#2a1212', text: colors.coral },
  pink:   { bg: '#2a0d1a', text: colors.pink },
};

export function Badge({ label, variant = 'blue' }) {
  const c = badgeColors[variant] || badgeColors.blue;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{label}</Text>
    </View>
  );
}

// ─── Buttons ─────────────────────────────────────────────────────────────────
export function PrimaryButton({ label, onPress, style, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.btnPrimary, style, disabled && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.btnPrimaryText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function GhostButton({ label, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.btnGhost, style]} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.btnGhostText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function DangerButton({ label, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.btnDanger, style]} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.btnDangerText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function IconButton({ label, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.iconBtn, style]} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.iconBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────
export function FormInput({ label, ...props }) {
  return (
    <View style={styles.inputWrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.text3}
        {...props}
      />
    </View>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────
export function SectionHeader({ title, children }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ message, icon }) {
  return (
    <View style={styles.empty}>
      {icon ? <Text style={styles.emptyIcon}>{icon}</Text> : null}
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider() {
  return <View style={styles.divider} />;
}

// ─── Row ─────────────────────────────────────────────────────────────────────
export function Row({ children, style }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

// ─── Tab Bar ─────────────────────────────────────────────────────────────────
export function TabBar({ tabs, activeTab, onSelect }) {
  return (
    <View style={styles.tabBar}>
      {tabs.map(t => (
        <TouchableOpacity
          key={t.key}
          style={[styles.tab, activeTab === t.key && styles.tabActive]}
          onPress={() => onSelect(t.key)}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: font.caption,
    fontWeight: '700',
    color: colors.text2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
    minWidth: 70,
  },
  statNum: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 24,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 10,
    color: colors.text2,
    textAlign: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  btnPrimary: {
    backgroundColor: colors.blue,
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: font.body,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnGhost: {
    borderWidth: 1,
    borderColor: colors.border2,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  btnGhostText: {
    color: colors.text2,
    fontSize: font.body,
    fontWeight: '600',
  },
  btnDanger: {
    borderWidth: 1,
    borderColor: '#6b2a2a',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  btnDangerText: {
    color: colors.coral,
    fontSize: font.caption,
    fontWeight: '600',
  },
  iconBtn: {
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: radius.sm,
  },
  iconBtnText: {
    color: colors.text2,
    fontSize: font.caption,
  },
  inputWrap: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: font.caption,
    color: colors.text2,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    fontSize: font.body,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: font.large,
    fontWeight: '700',
    color: colors.text,
  },
  empty: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: font.body,
    color: colors.text3,
    textAlign: 'center',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.bg3,
    borderRadius: radius.sm,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: colors.bg2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text2,
  },
  tabTextActive: {
    color: colors.blue,
  },
});