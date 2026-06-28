// src/components/CircularProgress.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, font } from './theme';

export default function CircularProgress({
  percentage = 0,
  color = colors.blue,
  size = 100,
  strokeWidth = 9,
  label = '',
  sublabel = '',
  showPercent = true,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference * (1 - pct / 100);
  const center = size / 2;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colors.bg4}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      {/* Center text */}
      <View style={[styles.center, { width: size, height: size }]}>
        {showPercent && (
          <Text style={[styles.pct, { color }]}>{Math.round(pct)}%</Text>
        )}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pct: {
    fontSize: font.medium,
    fontWeight: '700',
  },
  label: {
    fontSize: font.caption,
    color: colors.text2,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  sublabel: {
    fontSize: font.small,
    color: colors.text3,
    textAlign: 'center',
    marginTop: 2,
  },
});