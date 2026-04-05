import React, { useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert, PanResponder,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { useAppStore } from '../utils/store';
import { inspectionsAPI } from '../services/api';
import {
  Screen, TopBar, Card, BtnPrimary, BtnDanger, GeoPill,
} from '../components/UI';
import { Colors, Typography, Spacing, Radius } from '../utils/theme';

const { width } = Dimensions.get('window');
const CANVAS_WIDTH  = width - Spacing.xl * 2;
const CANVAS_HEIGHT = 160;

export default function SignatureScreen() {
  const router       = useRouter();
  const inspection   = useAppStore((s) => s.inspection);
  const checklist    = useAppStore((s) => s.checklist);
  const toggleCheck  = useAppStore((s) => s.toggleCheck);

  const [paths, setPaths]     = useState([]);
  const [current, setCurrent] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Dessin signature ──────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: (e) => {
        const { locationX: x, locationY: y } = e.nativeEvent;
        setCurrent(`M${x.toFixed(1)},${y.toFixed(1)}`);
      },
      onPanResponderMove: (e) => {
        const { locationX: x, locationY: y } = e.nativeEvent;
        setCurrent((p) => `${p} L${x.toFixed(1)},${y.toFixed(1)}`);
      },
      onPanResponderRelease: () => {
        if (current) setPaths((p) => [...p, current]);
        setCurrent('');
      },
    })
  ).current;

  const clearSignature = () => {
    setPaths([]);
    setCurrent('');
  };

  const hasSigned = paths.length > 0;
  const allChecked = checklist.every((i) => i.checked);

  const handleValidate = async () => {
    if (!hasSigned) {
      Alert.alert('Signature requise', 'Veuillez signer avant de valider');
      return;
    }
    if (!allChecked) {
      Alert.alert(
        'Checklist incomplète',
        'Cochez tous les éléments avant de valider',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Valider quand même', onPress: () => submit() },
        ]
      );
      return;
    }
    submit();
  };

  const submit = async () => {
    setLoading(true);
    try {
      // Convertir la signature SVG en data URL (base64)
      const sigData = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}">${paths.map(d => `<path d="${d}" stroke="%23378ADD" stroke-width="2" fill="none" stroke-linecap="round"/>`).join('')}</svg>`;

      // Uploader la signature
      await inspectionsAPI.sign(
        inspection.id,
        sigData,
        checklist.map((i) => ({ key: i.key, checked: i.checked }))
      );

      Alert.alert(
        'Inspection validée',
        'Signature enregistrée. Le rapport PDF a été généré.',
        [{ text: 'OK', onPress: () => router.replace('/results') }]
      );
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <TopBar
        title="FLEETGUARD — Validation"
        subtitle="Checklist pré-départ + signature"
        onBack={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          <Text style={Typography.h2}>Validation finale</Text>
          <Text style={styles.sub}>
            {inspection?.inspection_ref}
          </Text>
        </View>

        <GeoPill label="Localisation enregistrée" />

        {/* Checklist */}
        <Text style={styles.sectionTitle}>Checklist pré-départ</Text>
        {checklist.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.checkItem}
            onPress={() => toggleCheck(item.key)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkCircle, item.checked && styles.checkCircleDone]}>
              {item.checked && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={[
              styles.checkLabel,
              item.checked && { color: Colors.textPrimary }
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Zone de signature */}
        <Text style={styles.sectionTitle}>Signature électronique du conducteur</Text>
        <Card style={styles.sigCard}>
          <View
            style={styles.sigCanvas}
            {...panResponder.panHandlers}
          >
            <Svg
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={StyleSheet.absoluteFill}
            >
              {paths.map((d, i) => (
                <Path
                  key={i}
                  d={d}
                  stroke={Colors.blueLight}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {current ? (
                <Path
                  d={current}
                  stroke={Colors.blueLight}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                />
              ) : null}
            </Svg>
            {!hasSigned && (
              <Text style={styles.sigHint}>Signez ici avec votre doigt</Text>
            )}
          </View>
        </Card>

        <View style={styles.actions}>
          <BtnDanger
            label="Effacer"
            onPress={clearSignature}
            style={{ flex: 1 }}
          />
          <BtnPrimary
            label="Valider et générer PDF →"
            onPress={handleValidate}
            loading={loading}
            style={{ flex: 2 }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body:        { flexGrow: 1, padding: Spacing.xl, gap: Spacing.lg },
  sub:         { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
  sectionTitle: {
    fontSize: 11, color: Colors.textMuted,
    letterSpacing: 0.8, textTransform: 'uppercase',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg1,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  checkCircle: {
    width: 22, height: 22,
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: Colors.borderActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: Colors.greenDark,
    borderColor: Colors.greenDark,
  },
  checkMark:  { color: Colors.white, fontSize: 12, fontWeight: '600' },
  checkLabel: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  sigCard:    { padding: 0, overflow: 'hidden' },
  sigCanvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sigHint: {
    color: Colors.textDisabled,
    fontSize: 13,
    position: 'absolute',
  },
  actions: { flexDirection: 'row', gap: Spacing.md },
});
