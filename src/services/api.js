import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ============================================================
//  SERVICE API — FleetGuard
// ============================================================

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({ baseURL: API_URL, timeout: 30000 });

// Injecter le token automatiquement
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('fg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Authentification ─────────────────────────────────────────
export const authAPI = {
  login: (driver_id, password) =>
    api.post('/auth/login', { driver_id, password }).then((r) => r.data),
};

// ── Véhicules ────────────────────────────────────────────────
export const vehiclesAPI = {
  list: () => api.get('/vehicles').then((r) => r.data),
  getById: (id) => api.get(`/vehicles/${id}`).then((r) => r.data),
  create: (data) => api.post('/vehicles', data).then((r) => r.data),
};

// ── Inspections ──────────────────────────────────────────────
export const inspectionsAPI = {

  create: (data) => api.post('/inspections', data).then((r) => r.data),

  uploadImages: async (inspection_id, photos) => {
    const formData = new FormData();
    formData.append('inspection_id', inspection_id);

    const sides = ['front', 'rear', 'left', 'right'];
    for (const side of sides) {
      const uri  = photos[side];
      const name = `${side}_${Date.now()}.jpg`;
      formData.append(side, { uri, name, type: 'image/jpeg' });
    }

    return api.post(`/inspections/${inspection_id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    }).then((r) => r.data);
  },

  sign: (inspection_id, signature_url, checklist) =>
    api.patch(`/inspections/${inspection_id}/sign`, { signature_url, checklist })
       .then((r) => r.data),

  getById: (id) => api.get(`/inspections/${id}`).then((r) => r.data),
};

// ── Dashboard ────────────────────────────────────────────────
export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats').then((r) => r.data),
  vehicleHistory: (id) => api.get(`/dashboard/vehicles/${id}/history`).then((r) => r.data),
};
