import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

// ============================================================
//  STORE GLOBAL — FleetGuard
//  Gestion d'état avec Zustand
// ============================================================

export const useAppStore = create((set, get) => ({

  // ── Session driver ──────────────────────────────────────────
  driver:  null,
  token:   null,

  setDriver: (driver, token) => {
    set({ driver, token });
    SecureStore.setItemAsync('fg_token', token);
    SecureStore.setItemAsync('fg_driver', JSON.stringify(driver));
  },

  logout: () => {
    set({ driver: null, token: null, inspection: null, vehicle: null });
    SecureStore.deleteItemAsync('fg_token');
    SecureStore.deleteItemAsync('fg_driver');
  },

  restoreSession: async () => {
    const token  = await SecureStore.getItemAsync('fg_token');
    const raw    = await SecureStore.getItemAsync('fg_driver');
    if (token && raw) {
      set({ token, driver: JSON.parse(raw) });
      return true;
    }
    return false;
  },

  // ── Véhicule sélectionné ────────────────────────────────────
  vehicle: null,
  setVehicle: (vehicle) => set({ vehicle }),

  // ── Inspection en cours ─────────────────────────────────────
  inspection: null,
  setInspection: (inspection) => set({ inspection }),

  // ── Photos capturées ────────────────────────────────────────
  photos: { front: null, rear: null, left: null, right: null },

  setPhoto: (side, uri) =>
    set((state) => ({ photos: { ...state.photos, [side]: uri } })),

  resetPhotos: () =>
    set({ photos: { front: null, rear: null, left: null, right: null } }),

  photosComplete: () => {
    const { photos } = get();
    return Object.values(photos).every(Boolean);
  },

  // ── Checklist ───────────────────────────────────────────────
  checklist: [
    { key: 'oil_level',  label: 'Niveaux huile et carburant vérifiés', checked: false },
    { key: 'lights',     label: 'Éclairages fonctionnels',             checked: false },
    { key: 'tires',      label: 'Pression pneus conforme',             checked: false },
    { key: 'safety_kit', label: 'Extincteur et trousse de secours',    checked: false },
    { key: 'mirrors',    label: 'Rétroviseurs réglés',                 checked: false },
  ],

  toggleCheck: (key) =>
    set((state) => ({
      checklist: state.checklist.map((item) =>
        item.key === key ? { ...item, checked: !item.checked } : item
      ),
    })),

  resetChecklist: () =>
    set((state) => ({
      checklist: state.checklist.map((item) => ({ ...item, checked: false })),
    })),

  // ── Résultats inspection ────────────────────────────────────
  results: null,
  setResults: (results) => set({ results }),

  // ── Reset complet (nouvelle inspection) ────────────────────
  resetInspection: () =>
    set((state) => ({
      vehicle:    null,
      inspection: null,
      photos:     { front: null, rear: null, left: null, right: null },
      results:    null,
      checklist:  state.checklist.map((item) => ({ ...item, checked: false })),
    })),
}));
