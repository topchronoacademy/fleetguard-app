import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../utils/theme';

// ============================================================
//  COMPOSANTS UI — FleetGuard
// ============================================================

// ── Conteneur écran ──────────────────────────────────────────
export const Screen = ({ children, style }) => (
  <View style={[styles.screen, style]}>{children}</View>
);

// ── Topbar ───────────────────────────────────────────────────
export const TopBar = ({ title, subtitle, onBack }) => (
  <View style={styles.topbar}>
    {onBack && (
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={{ color: Colors.textSecondary, fontSize: 20 }}>‹</Text>
      </TouchableOpacity>
    )}
    <View>
      <Text style={styles.topbarTitle}>{title}</Text>
      {subtitle && <Text style={styles.topbarSub}>{subtitle}</Text>}
    </View>
  </View>
);

// ── Champ de formulaire ──────────────────────────────────────
export const Field = ({ label, error, children }) => (
  <View style={styles.fieldWrap}>
    {label && <Text style={styles.fieldLabel}>{label}</Text>}
    {children}
    {error && <Text style={styles.fieldError}>{error}</Text>}
  </View>
);

export const Input = React.forwardRef(({ style, error, ...props }, ref) => (
  <TextInput
    ref={ref}
    placeholderTextColor={Colors.textDisabled}
    style={[styles.input, error && styles.inputError, style]}
    {...props}
  />
));

// ── Boutons ──────────────────────────────────────────────────
export const BtnPrimary = ({ label, onPress, loading, disabled, style }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    style={[styles.btnPrimary, (disabled || loading) && styles.btnDisabled, style]}
    activeOpacity={0.85}
  >
    {loading
      ? <ActivityIndicator color={Colors.textPrimary} size="small" />
      : <Text style={styles.btnPrimaryText}>{label}</Text>}
  </TouchableOpacity>
);

export const BtnSecondary = ({ label, onPress, style }) => (
  <TouchableOpacity onPress={onPress} style={[styles.btnSecondary, style]} activeOpacity={0.8}>
    <Text style={styles.btnSecondaryText}>{label}</Text>
  </TouchableOpacity>
);

export const BtnDanger = ({ label, onPress, style }) => (
  <TouchableOpacity onPress={onPress} style={[styles.btnDanger, style]} activeOpacity={0.8}>
    <Text style={styles.btnDangerText}>{label}</Text>
  </TouchableOpacity>
);

// ── Badge statut ─────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const map = {
    NEW:   Colors.statusNew,
    KNOWN: Colors.statusKnown,
    NONE:  Colors.statusNone,
  };
  const style = map[status] || map.NONE;
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.badgeText, { color: style.text }]}>{status}</Text>
    </View>
  );
};

// ── Card ─────────────────────────────────────────────────────
export const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

// ── Barre de progression ─────────────────────────────────────
export const ProgressBar = ({ current, total }) => (
  <View>
    <View style={styles.progressRow}>
      <Text style={styles.progressLabel}>Progression</Text>
      <Text style={styles.progressCount}>{current} / {total}</Text>
    </View>
    <View style={styles.progressBg}>
      <View style={[styles.progressFill, { width: `${(current / total) * 100}%` }]} />
    </View>
  </View>
);

// ── Loader plein écran ───────────────────────────────────────
export const FullScreenLoader = ({ message }) => (
  <View style={styles.loaderWrap}>
    <ActivityIndicator size="large" color={Colors.blue} />
    {message && <Text style={styles.loaderText}>{message}</Text>}
  </View>
);

// ── Message d'erreur ─────────────────────────────────────────
export const ErrorBanner = ({ message }) =>
  message ? (
    <View style={styles.errorBanner}>
      <Text style={styles.errorBannerText}>{message}</Text>
    </View>
  ) : null;

// ── Géolocalisation pill ─────────────────────────────────────
export const GeoPill = ({ label }) => (
  <View style={styles.geoPill}>
    <Text style={styles.geoPillText}>📍 {label || 'Localisation en cours...'}</Text>
  </View>
);

// ============================================================
//  STYLES
// ============================================================
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg0,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  backBtn: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  topbarTitle: {
    ...Typography.small,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  topbarSub: {
    ...Typography.label,
    marginTop: 2,
  },
  fieldWrap: { gap: Spacing.sm },
  fieldLabel: { ...Typography.label },
  fieldError: { fontSize: 11, color: Colors.red, marginTop: 2 },
  input: {
    backgroundColor: Colors.bg1,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 46,
  },
  inputError: { borderColor: Colors.red },
  btnPrimary: {
    backgroundColor: Colors.blue,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnPrimaryText: { ...Typography.body, fontWeight: '500', color: '#e8f3ff' },
  btnSecondary: {
    backgroundColor: Colors.bg1,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    minHeight: 46,
    justifyContent: 'center',
  },
  btnSecondaryText: { ...Typography.small, color: Colors.textSecondary },
  btnDanger: {
    backgroundColor: Colors.redBg,
    borderWidth: 0.5,
    borderColor: '#501313',
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    minHeight: 46,
    justifyContent: 'center',
  },
  btnDangerText: { ...Typography.small, color: '#F09595' },
  badge: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  card: {
    backgroundColor: Colors.bg1,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressLabel: { ...Typography.label },
  progressCount: { fontSize: 11, color: Colors.green, fontWeight: '500' },
  progressBg: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.sm,
    height: 6,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: Colors.green,
    height: '100%',
    borderRadius: Radius.sm,
  },
  loaderWrap: {
    flex: 1,
    backgroundColor: Colors.bg0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  loaderText: { ...Typography.small, color: Colors.textSecondary },
  errorBanner: {
    backgroundColor: Colors.redBg,
    borderWidth: 0.5,
    borderColor: '#501313',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
  },
  errorBannerText: { color: '#F09595', fontSize: 13 },
  geoPill: {
    backgroundColor: Colors.greenBg,
    borderWidth: 0.5,
    borderColor: Colors.greenDark,
    borderRadius: Radius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
  },
  geoPillText: { color: Colors.green, fontSize: 11 },
});
