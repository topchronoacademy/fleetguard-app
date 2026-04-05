import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

// ============================================================
//  HOOKS PERSONNALISÉS — FleetGuard
// ============================================================

// ── useCamera ────────────────────────────────────────────────
export const useCamera = () => {
  const [hasPermission, setHasPermission] = useState(null);

  const requestPermission = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    return status === 'granted';
  }, []);

  const takePhoto = useCallback(async () => {
    const granted = hasPermission ?? (await requestPermission());
    if (!granted) {
      Alert.alert(
        'Permission caméra requise',
        'Activez la caméra dans les paramètres de votre téléphone.',
        [{ text: 'OK' }]
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality:    0.85,
      allowsEditing: false,
      exif: false,
    });

    if (result.canceled || !result.assets?.[0]) return null;
    return result.assets[0].uri;
  }, [hasPermission, requestPermission]);

  return { takePhoto, hasPermission, requestPermission };
};

// ── useLocation ──────────────────────────────────────────────
export const useLocation = () => {
  const [location, setLocation]   = useState(null);
  const [geoLabel, setGeoLabel]   = useState('');
  const [loading, setLoading]     = useState(false);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGeoLabel('Localisation non autorisée');
        return null;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = loc.coords;

      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const label = place
        ? [place.street, place.city, place.region].filter(Boolean).join(', ')
        : `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

      setLocation({ latitude, longitude });
      setGeoLabel(label);
      return { latitude, longitude, location_label: label };
    } catch (err) {
      setGeoLabel('Erreur de localisation');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { location, geoLabel, fetchLocation, locationLoading: loading };
};

// ── useInspectionFlow ────────────────────────────────────────
export const useInspectionFlow = () => {
  const [step, setStep] = useState(0);  // 0=login, 1=vehicle, 2=capture, 3=results, 4=sign

  return {
    step,
    goNext: () => setStep((s) => Math.min(s + 1, 4)),
    goBack: () => setStep((s) => Math.max(s - 1, 0)),
    goTo:   (s) => setStep(s),
    isFirst: step === 0,
    isLast:  step === 4,
  };
};
