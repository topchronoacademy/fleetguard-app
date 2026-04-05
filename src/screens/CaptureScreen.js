import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../utils/store';
import { inspectionsAPI } from '../services/api';
import {
  Screen, TopBar, ProgressBar,
  BtnPrimary, BtnSecondary, FullScreenLoader,
} from '../components/UI';
import { Colors, Typography, Spacing, Radius } from '../utils/theme';

const SIDES = [
  { key: 'front', label: 'Avant' },
  { key: 'rear',  label: 'Arrière' },
  { key: 'left',  label: 'Gauche' },
  { key: 'right', label: 'Droite' },
];

export default function CaptureScreen() {
  const router      = useRouter();
  const photos      = useAppStore((s) => s.photos);
  const setPhoto    = useAppStore((s) => s.setPhoto);
  const inspection  = useAppStore((s) => s.inspection);
  const setResults  = useAppStore((s) => s.setResults);
  const photosComplete = useAppStore((s) => s.photosComplete);

  const [uploading, setUploading] = useState(false);

  const capturedCount = Object.values(photos).filter(Boolean).length;

  const capturePhoto = async (side) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Activez la caméra dans les paramètres');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets?.[0]) {
      setPhoto(side, result.assets[0].uri);
    }
  };

  const retakePhoto = (side) => {
    Alert.alert(
      'Reprendre la photo',
      `Voulez-vous reprendre la photo ${SIDES.find(s => s.key === side)?.label} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Reprendre', onPress: () => capturePhoto(side) },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!photosComplete()) {
      Alert.alert('Photos manquantes', 'Capturez les 4 faces avant d\'envoyer');
      return;
    }
    setUploading(true);
    try {
      const res = await inspectionsAPI.uploadImages(inspection.id, photos);
      setResults(res);
      router.push('/results');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setUploading(false);
    }
  };

  if (uploading) {
    return <FullScreenLoader message="Analyse en cours… Cela peut prendre 30 secondes" />;
  }

  return (
    <Screen>
      <TopBar title="FLEETGUARD — Photos" subtitle="4 faces obligatoires" />
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          <Text style={Typography.h2}>Capture des photos</Text>
          <Text style={styles.sub}>
            {inspection?.inspection_ref}
          </Text>
        </View>

        <ProgressBar current={capturedCount} total={4} />

        <View style={styles.grid}>
          {SIDES.map(({ key, label }) => {
            const uri     = photos[key];
            const isDone  = !!uri;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.cell, isDone && styles.cellDone]}
                onPress={() => isDone ? retakePhoto(key) : capturePhoto(key)}
                activeOpacity={0.8}
              >
                {isDone ? (
                  <>
                    <Image source={{ uri }} style={styles.thumb} />
                    <View style={styles.doneOverlay}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                    <Text style={styles.cellLabelDone}>{label}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.cameraIcon}>📷</Text>
                    <Text style={styles.cellLabel}>{label}</Text>
                    <Text style={styles.cellHint}>Appuyer pour capturer</Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.hint}>
          Appuyez sur une photo déjà prise pour la reprendre
        </Text>

        <BtnPrimary
          label="Envoyer pour analyse →"
          onPress={handleSubmit}
          disabled={!photosComplete()}
        />

        {capturedCount > 0 && (
          <BtnSecondary
            label="Réinitialiser toutes les photos"
            onPress={() => {
              Alert.alert('Confirmer', 'Effacer toutes les photos ?', [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Effacer', style: 'destructive',
                  onPress: () => SIDES.forEach(s => setPhoto(s.key, null)),
                },
              ]);
            }}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flexGrow: 1, padding: Spacing.xl, gap: Spacing.xl },
  sub:  { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  cell: {
    width: '47%',
    height: 130,
    backgroundColor: Colors.bg1,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    overflow: 'hidden',
  },
  cellDone: {
    borderColor: Colors.greenDark,
  },
  thumb: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: Radius.lg,
  },
  doneOverlay: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.greenDark,
    borderRadius: Radius.round,
    width: 24, height: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  cellLabelDone: {
    position: 'absolute',
    bottom: Spacing.sm,
    color: Colors.white,
    fontSize: 11,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
  },
  cameraIcon: { fontSize: 28 },
  cellLabel:  { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  cellHint:   { color: Colors.textDisabled, fontSize: 10 },
  hint: {
    color: Colors.textDisabled,
    fontSize: 11,
    textAlign: 'center',
  },
});
