import React from 'react';
import {
  View, Text, ScrollView, Image,
  StyleSheet, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../utils/store';
import {
  Screen, TopBar, StatusBadge,
  BtnPrimary, BtnSecondary, Card,
} from '../components/UI';
import { Colors, Typography, Spacing, Radius } from '../utils/theme';

const SIDE_LABELS = { front: 'Avant', rear: 'Arrière', left: 'Gauche', right: 'Droite' };
const ANOMALY_LABELS = { scratch: 'Rayure', dent: 'Bosse', crack: 'Fissure', none: '—' };

const VERDICT_STYLE = {
  NEW:   { bg: Colors.redBg,   border: '#501313', text: '#F09595' },
  KNOWN: { bg: Colors.amberBg, border: '#412402', text: '#FAC775' },
  NONE:  { bg: Colors.greenBg, border: Colors.greenDark, text: Colors.green },
};

export default function ResultsScreen() {
  const router        = useRouter();
  const results       = useAppStore((s) => s.results);
  const inspection    = useAppStore((s) => s.inspection);
  const vehicle       = useAppStore((s) => s.vehicle);
  const resetInspection = useAppStore((s) => s.resetInspection);

  if (!results) {
    return (
      <Screen>
        <TopBar title="FLEETGUARD — Résultats" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: Colors.textMuted }}>Aucun résultat disponible</Text>
        </View>
      </Screen>
    );
  }

  const status = results.overall_status;
  const verdict = VERDICT_STYLE[status] || VERDICT_STYLE.NONE;
  const sides = ['front', 'rear', 'left', 'right'];

  return (
    <Screen>
      <TopBar
        title="FLEETGUARD — Résultats"
        subtitle={`${inspection?.inspection_ref} · ${vehicle?.license_plate}`}
      />
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          <Text style={Typography.h2}>Résultats d'inspection</Text>
          <Text style={styles.sub}>
            {vehicle?.brand} {vehicle?.model} — {new Date().toLocaleString('fr-FR')}
          </Text>
        </View>

        {/* Verdict global */}
        <View style={[styles.verdict, {
          backgroundColor: verdict.bg,
          borderColor: verdict.border,
        }]}>
          <StatusBadge status={status} />
          <Text style={[styles.verdictText, { color: verdict.text }]}>
            {results.message}
          </Text>
        </View>

        {/* Résultats par face */}
        <Text style={styles.sectionTitle}>Détail par face</Text>
        {sides.map((side) => {
          const r = results.results?.[side];
          if (!r) return null;
          return (
            <Card key={side} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View>
                  <Text style={styles.sideLabel}>{SIDE_LABELS[side]}</Text>
                  <Text style={styles.anomalyLabel}>
                    {ANOMALY_LABELS[r.anomaly_type] || r.anomaly_type}
                  </Text>
                </View>
                <StatusBadge status={r.status} />
              </View>

              {/* Comparaison images */}
              {(r.current_image_url || r.previous_image_url) && (
                <View style={styles.imgRow}>
                  {r.previous_image_url ? (
                    <View style={styles.imgWrap}>
                      <Text style={styles.imgLabel}>Précédente</Text>
                      <Image source={{ uri: r.previous_image_url }} style={styles.img} />
                    </View>
                  ) : (
                    <View style={[styles.imgWrap, styles.imgEmpty]}>
                      <Text style={styles.imgLabel}>Précédente</Text>
                      <Text style={styles.imgNoData}>Aucune référence</Text>
                    </View>
                  )}
                  {r.current_image_url && (
                    <View style={styles.imgWrap}>
                      <Text style={styles.imgLabel}>Actuelle</Text>
                      <Image source={{ uri: r.current_image_url }} style={styles.img} />
                    </View>
                  )}
                </View>
              )}

              <Text style={styles.resultMsg}>{r.message}</Text>
            </Card>
          );
        })}

        {/* Bouton signature */}
        <BtnSecondary
          label="Signer et générer le rapport PDF"
          onPress={() => router.push('/signature')}
        />

        {/* Actions */}
        <View style={styles.actions}>
          <BtnSecondary
            label="Terminer"
            onPress={() => {
              resetInspection();
              router.replace('/vehicle');
            }}
            style={{ flex: 1 }}
          />
          <BtnPrimary
            label="Nouvelle inspection"
            onPress={() => {
              resetInspection();
              router.replace('/vehicle');
            }}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body:        { flexGrow: 1, padding: Spacing.xl, gap: Spacing.lg },
  sub:         { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
  verdict: {
    borderWidth: 0.5,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  verdictText: { fontSize: 13 },
  sectionTitle: { ...Typography.label, marginTop: Spacing.sm },
  resultCard:  { gap: Spacing.md },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sideLabel:    { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  anomalyLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  imgRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  imgWrap: { flex: 1, gap: Spacing.xs },
  imgEmpty: {
    backgroundColor: Colors.bg0,
    borderRadius: Radius.sm,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgLabel:  { fontSize: 10, color: Colors.textMuted },
  imgNoData: { fontSize: 11, color: Colors.textDisabled },
  img: {
    width: '100%',
    height: 70,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bg0,
  },
  resultMsg: { fontSize: 11, color: Colors.textMuted, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: Spacing.md },
});
