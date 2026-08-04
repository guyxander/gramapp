export const colors = {
  background: '#F9F9FF',
  surface: '#FFFFFF',
  surfaceMuted: '#F2F3FB',
  surfaceStrong: '#E7E8F0',
  text: '#191C21',
  textMuted: '#5C6370',
  outline: '#D8DAE2',
  primary: '#005EB8',
  primaryDark: '#00478D',
  primarySoft: '#D6E3FF',
  onPrimary: '#FFFFFF',
  success: '#00875A',
  successSoft: '#DDF8EB',
  discovery: '#673AB7',
  xp: '#FFC107',
  streak: '#FF5722',
  premium: '#9C27B0',
  error: '#BA1A1A',
  heatmap: ['#EEF4FB', '#D7E9FA', '#73B9F2', '#2D8DDB', '#1565C0'],
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;
