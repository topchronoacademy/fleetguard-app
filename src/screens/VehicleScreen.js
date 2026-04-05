import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../utils/store';
import { inspectionsAPI, vehiclesAPI } from '../services/api';
import * as Location from 'expo-location';
import {
  Screen, TopBar, Field, Input,
  BtnPrimary, ErrorBanner, GeoPill,
} from '../components/UI';
import { Colors, Typography, Spacing } from '../utils/theme';

export default function VehicleScreen() {
  const router       = useRouter();
  const driver       = useAppStore((s) => s.driver);
  const setVehicle   = useAppStore((s) => s.setVehicle);
  const setInspection = useAppStore((s) => s.setInspection);

  const [form, setForm] = useState({
    license_plate: '', brand: '', model: '',
    year: '', mileage: '', vin: '',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [geoLabel, setGeoLabel] = useState('');

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
    setApiError('');
  };

  const validate = () => {
    const e = {};
    if (!form.license_plate.trim()) e.license_plate = 'Immatriculation requise';
    if (!form.brand.trim())         e.brand         = 'Marque requise';
    if (!form.model.trim())         e.model         = 'Modèle requis';
    if (!form.year || isNaN(form.year)) e.year      = 'Année invalide';
    if (!form.mileage || isNaN(form.mileage)) e.mileage = 'Kilométrage invalide';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleStart = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Géolocalisation
      let latitude = null, longitude = null, location_label = null;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        latitude  = loc.coords.latitude;
        longitude = loc.coords.longitude;
        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        location_label = place
          ? `${place.street || ''} ${place.city || ''}`.trim()
          : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setGeoLabel(location_label);
      }

      // Créer ou récupérer le véhicule
      let vehicle;
      try {
        vehicle = (await vehiclesAPI.create({
          ...form, year: parseInt(form.year), mileage: parseInt(form.mileage),
        })).vehicle;
      } catch (err) {
        // Si immatriculation déjà existante, on récupère le véhicule existant
        if (err.response?.status === 409) {
          const list = await vehiclesAPI.list();
          vehicle = list.vehicles.find(v =>
            v.license_plate.toUpperCase() === form.license_plate.toUpperCase()
          );
        } else throw err;
      }

      setVehicle(vehicle);

      // Créer l'inspection
      const res = await inspectionsAPI.create({
        vehicle_id:     vehicle.id,
        mileage:        parseInt(form.mileage),
        latitude, longitude, location_label,
      });

      setInspection(res.inspection);
      router.push('/capture');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Erreur lors de la création de l\'inspection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <TopBar
        title="FLEETGUARD — Véhicule"
        subtitle={`Bonjour ${driver?.first_name || ''}`}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Text style={Typography.h2}>Informations véhicule</Text>
            <Text style={styles.sub}>Renseignez le véhicule à inspecter</Text>
          </View>

          {geoLabel ? <GeoPill label={geoLabel} /> : null}

          <View style={styles.form}>
            <Field label="Immatriculation" error={errors.license_plate}>
              <Input
                value={form.license_plate}
                onChangeText={(v) => set('license_plate', v.toUpperCase())}
                placeholder="AB-123-CD"
                autoCapitalize="characters"
                error={errors.license_plate}
              />
            </Field>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Field label="Marque" error={errors.brand}>
                  <Input
                    value={form.brand}
                    onChangeText={(v) => set('brand', v)}
                    placeholder="Renault"
                    error={errors.brand}
                  />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Modèle" error={errors.model}>
                  <Input
                    value={form.model}
                    onChangeText={(v) => set('model', v)}
                    placeholder="Master"
                    error={errors.model}
                  />
                </Field>
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Field label="Année" error={errors.year}>
                  <Input
                    value={form.year}
                    onChangeText={(v) => set('year', v)}
                    placeholder="2021"
                    keyboardType="numeric"
                    maxLength={4}
                    error={errors.year}
                  />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Kilométrage" error={errors.mileage}>
                  <Input
                    value={form.mileage}
                    onChangeText={(v) => set('mileage', v)}
                    placeholder="87420"
                    keyboardType="numeric"
                    error={errors.mileage}
                  />
                </Field>
              </View>
            </View>

            <Field label="VIN (optionnel)">
              <Input
                value={form.vin}
                onChangeText={(v) => set('vin', v.toUpperCase())}
                placeholder="VF1MA000…"
                autoCapitalize="characters"
                maxLength={17}
              />
            </Field>
          </View>

          <ErrorBanner message={apiError} />

          <BtnPrimary
            label="Démarrer l'inspection →"
            onPress={handleStart}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flexGrow: 1, padding: Spacing.xl, gap: Spacing.xl },
  sub:  { color: Colors.textMuted, fontSize: 13, marginTop: 4 },
  form: { gap: Spacing.lg },
  row:  { flexDirection: 'row', gap: Spacing.md },
});
