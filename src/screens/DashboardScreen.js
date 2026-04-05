import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
} from 'react-native';
import { dashboardAPI } from '../services/api';
import {
  Screen, TopBar, Card, StatusBadge, FullScreenLoader,
} from '../components/UI';
import { Colors, Typography, Spacing, Radius } from '../utils/theme';

export default function DashboardScreen() {
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await dashboardAPI.stats();
      setStats(res.stats);
    } catch { /* silencieux */ } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <FullScreenLoader message="Chargement du dashboard…" />;

  const maxBarCount = stats
    ? Math.max(...(stats.anomalies_by_type.map(a => parseInt(a.count)) || [1]))
    : 1;

  return (
    <Screen>
      <TopBar title="FLEETGUARD — Dashboard" subtitle="Vue flotte" />
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)}
            tintColor={Colors.blue} />
        }
      >
        <View>
          <Text style={Typography.h2}>Vue flotte</Text>
          <Text style={styles.sub}>Tirez vers le bas pour actualiser</Text>
        </View>

        {/* Stats */}
        <View style={styles.statGrid}>
          <StatCard value={stats?.total_inspections ?? 0}    label="Inspections ce mois" />
          <StatCard value={stats?.new_anomalies ?? 0}        label="Nouvelles anomalies" alert />
          <StatCard value={`${stats?.conformity_rate ?? 0}%`} label="Taux conformité" />
          <StatCard value={stats?.known_anomalies ?? 0}      label="Anomalies connues" />
        </View>

        {/* Anomalies par type */}
        {stats?.anomalies_by_type?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Anomalies par type</Text>
            <Card>
              {stats.anomalies_by_type.map((item) => (
                <MiniBar
                  key={item.anomaly_type}
                  label={item.anomaly_type}
                  value={parseInt(item.count)}
                  max={maxBarCount}
                />
              ))}
            </Card>
          </>
        )}

        {/* Dernières inspections */}
        {stats?.recent_inspections?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Dernières inspections</Text>
            {stats.recent_inspections.map((insp) => (
              <Card key={insp.inspection_ref} style={styles.inspRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inspPlate}>
                    {insp.license_plate} · {insp.brand} {insp.model}
                  </Text>
                  <Text style={styles.inspDriver}>
                    {insp.first_name} · {new Date(insp.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <StatusBadge status={insp.overall_status} />
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

// ── Sous-composants locaux ────────────────────────────────────
const StatCard = ({ value, label, alert }) => (
  <View style={[styles.statCard, alert && styles.statCardAlert]}>
    <Text style={[styles.statVal, alert && { color: '#F09595' }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ANOMALY_COLORS = {
  scratch: '#E24B4A',
  dent:    '#EF9F27',
  crack:   '#378ADD',
  none:    Colors.textMuted,
};

const MiniBar = ({ label, value, max }) => {
  const pct   = max > 0 ? (value / max) * 100 : 0;
  const color = ANOMALY_COLORS[label] || Colors.textMuted;
  const ANOMALY_LABELS = { scratch: 'Rayures', dent: 'Bosses', crack: 'Fissures', none: 'Aucune' };
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{ANOMALY_LABELS[label] || label}</Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.barCount}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  body:        { flexGrow: 1, padding: Spacing.xl, gap: Spacing.lg },
  sub:         { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
  statGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: {
    backgroundColor: Colors.bg1,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    width: '47%',
  },
  statCardAlert: { borderColor: '#501313' },
  statVal:   { fontSize: 26, fontWeight: '500', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  sectionTitle: {
    fontSize: 11, color: Colors.textMuted,
    letterSpacing: 0.8, textTransform: 'uppercase',
    marginTop: Spacing.sm,
  },
  inspRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  inspPlate: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  inspDriver:{ fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  barRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  barLabel:  { width: 60, fontSize: 11, color: Colors.textSecondary },
  barBg:     { flex: 1, height: 5, backgroundColor: Colors.bg0, borderRadius: Radius.sm, overflow: 'hidden' },
  barFill:   { height: '100%', borderRadius: Radius.sm },
  barCount:  { width: 24, fontSize: 11, color: Colors.textSecondary, textAlign: 'right' },
});
