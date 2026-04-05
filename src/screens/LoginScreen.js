import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../utils/store';
import { authAPI } from '../services/api';
import {
  Screen, TopBar, Field, Input,
  BtnPrimary, ErrorBanner,
} from '../components/UI';
import { Colors, Typography, Spacing } from '../utils/theme';

export default function LoginScreen() {
  const router   = useRouter();
  const setDriver = useAppStore((s) => s.setDriver);

  const [form, setForm]     = useState({ first_name: '', driver_id: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
    setApiError('');
  };

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = 'Prénom requis';
    if (!form.driver_id.trim())  e.driver_id  = 'Matricule requis';
    if (!form.password.trim())   e.password   = 'Mot de passe requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.login(form.driver_id, form.password);
      setDriver(res.driver, res.token);
      router.replace('/vehicle');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <TopBar title="FLEETGUARD" subtitle="Inspection véhicule" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heading}>
            <Text style={Typography.h2}>Connexion</Text>
            <Text style={styles.sub}>
              Identifiez-vous pour commencer l'inspection
            </Text>
          </View>

          <View style={styles.form}>
            <Field label="Prénom" error={errors.first_name}>
              <Input
                value={form.first_name}
                onChangeText={(v) => set('first_name', v)}
                placeholder="Mohamed"
                autoCapitalize="words"
                error={errors.first_name}
              />
            </Field>

            <Field label="Matricule" error={errors.driver_id}>
              <Input
                value={form.driver_id}
                onChangeText={(v) => set('driver_id', v.toUpperCase())}
                placeholder="DRV-20483"
                autoCapitalize="characters"
                error={errors.driver_id}
              />
            </Field>

            <Field label="Mot de passe" error={errors.password}>
              <Input
                value={form.password}
                onChangeText={(v) => set('password', v)}
                placeholder="••••••••"
                secureTextEntry
                error={errors.password}
              />
            </Field>
          </View>

          <ErrorBanner message={apiError} />

          <BtnPrimary
            label="Continuer →"
            onPress={handleLogin}
            loading={loading}
          />

          <Text style={styles.version}>FleetGuard v1.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flexGrow: 1,
    padding: Spacing.xl,
    gap: Spacing.xl,
    justifyContent: 'center',
  },
  heading: { gap: Spacing.sm },
  sub: { color: Colors.textMuted, fontSize: 13 },
  form: { gap: Spacing.lg },
  version: {
    textAlign: 'center',
    color: Colors.textDisabled,
    fontSize: 11,
    marginTop: Spacing.lg,
  },
});
