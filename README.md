# FleetGuard — Application d'inspection véhicule

## Structure du projet

```
fleetguard/
├── fleetguard-backend/     ← API Node.js + PostgreSQL
│   ├── sql/schema.sql      ← Schéma base de données complet
│   ├── src/
│   │   ├── index.js        ← Serveur Express
│   │   ├── controllers/    ← Logique métier
│   │   ├── services/       ← IA + PDF
│   │   ├── middleware/     ← Auth JWT + Upload
│   │   ├── models/         ← Connexion DB
│   │   └── routes/         ← Endpoints API
│   └── Dockerfile
│
└── fleetguard-app/         ← Application React Native (Expo)
    ├── app/                ← Routes Expo Router
    └── src/
        ├── screens/        ← 7 écrans
        ├── components/     ← Composants UI réutilisables
        ├── services/       ← Appels API
        └── utils/          ← Thème, Store, Helpers
```

---

## Démarrage rapide

### 1. Base de données
```bash
createdb fleetguard
psql fleetguard -f fleetguard-backend/sql/schema.sql
```

### 2. Backend
```bash
cd fleetguard-backend
cp .env.example .env
# Remplissez .env avec vos clés

npm install
npm run dev
# API disponible sur http://localhost:3000
```

### 3. Application mobile
```bash
cd fleetguard-app
npm install
npx expo start
# Scannez le QR code avec Expo Go (Android/iOS)
```

---

## Endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/auth/login | Connexion conducteur |
| GET  | /api/auth/me | Profil connecté |
| GET  | /api/vehicles | Liste des véhicules |
| POST | /api/vehicles | Créer un véhicule |
| POST | /api/inspections | Créer une inspection |
| POST | /api/inspections/:id/images | Uploader les 4 photos + analyse IA |
| PATCH| /api/inspections/:id/sign | Signer + checklist |
| GET  | /api/inspections/:id | Détails inspection |
| GET  | /api/dashboard/stats | Stats flotte |

---

## Variables d'environnement à configurer

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
AZURE_VISION_KEY=...          # optionnel en développement
AZURE_VISION_ENDPOINT=...
```

---

## Déploiement production

### Backend (Railway)
```bash
railway login
railway init
railway add postgresql
railway up
```

### App mobile (Expo EAS)
```bash
npm install -g eas-cli
eas login
eas build --platform android
eas submit --platform android
```

---

## Compte de test
- Matricule : `DRV-20483`
- Mot de passe : `password123`

---

## Roadmap Phase 2
- [ ] Notifications push (anomalie critique)
- [ ] Mode hors-ligne avec sync
- [ ] Intégration Roboflow (modèle IA propriétaire)
- [ ] Export données assureur (API partenaire)
- [ ] Dashboard web (Next.js)
