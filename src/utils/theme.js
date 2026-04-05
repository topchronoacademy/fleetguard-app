// ============================================================
//  FLEETGUARD — Thème global
//  Dark industrial theme
// ============================================================

export const Colors = {
  // Fonds
  bg0:        '#0f1923',  // fond principal (le plus sombre)
  bg1:        '#131f2e',  // cartes et inputs
  bg2:        '#1a2e42',  // éléments surélevés
  bg3:        '#1e3a5f',  // accents secondaires

  // Textes
  textPrimary:   '#e2e8f0',
  textSecondary: '#94afc8',
  textMuted:     '#5a7a9a',
  textDisabled:  '#2d4060',

  // Bordures
  border:        '#1e2d3d',
  borderActive:  '#2d4a6a',

  // Couleurs fonctionnelles
  blue:          '#1e6fbf',
  blueLight:     '#378ADD',
  green:         '#1D9E75',
  greenDark:     '#0f6e56',
  greenBg:       '#04342c22',
  red:           '#E24B4A',
  redBg:         '#50131322',
  amber:         '#EF9F27',
  amberBg:       '#41240222',

  // Statuts anomalies
  statusNew:     { bg: '#501313', text: '#F09595' },
  statusKnown:   { bg: '#412402', text: '#FAC775' },
  statusNone:    { bg: '#0a1f10', text: '#97C459' },

  // Plaque immatriculation
  plate:         '#f5c518',
  plateText:     '#1a1200',

  white:         '#ffffff',
};

export const Typography = {
  h1:    { fontSize: 24, fontWeight: '500', color: Colors.textPrimary },
  h2:    { fontSize: 20, fontWeight: '500', color: Colors.textPrimary },
  h3:    { fontSize: 16, fontWeight: '500', color: Colors.textPrimary },
  body:  { fontSize: 14, fontWeight: '400', color: Colors.textPrimary },
  small: { fontSize: 12, fontWeight: '400', color: Colors.textSecondary },
  label: { fontSize: 11, fontWeight: '400', color: Colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
};

export const Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24,
};

export const Radius = {
  sm: 6, md: 8, lg: 12, xl: 16, round: 999,
};

export const Shadows = {};  // Pas d'ombres — design plat
