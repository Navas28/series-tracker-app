/**
 * Single source of truth for the app's design system.
 *
 * Colors here mirror the CSS variables in global.css.
 * Use className="bg-background text-text" for NativeWind components.
 * Use theme.colors.light / theme.colors.dark for StyleSheet / inline styles.
 */

/* ────────────────────────────────────────────────
   COLOR PALETTE
   ──────────────────────────────────────────────── */

const light = {
  background:      '#F5F7FC',
  surface:         '#FFFFFF',
  surfaceElevated: '#EAEFF8',

  border:          '#D1D9ED',
  borderSubtle:    '#E5EAF6',

  text:            '#0B0D14',
  textSub:         '#4E5A7A',
  textMuted:       '#9BA5C4',

  accent:          '#C8881E',
  accentFg:        '#FFFFFF',
  accentSubtle:    '#FEF4E3',

  watched:         '#0D9488',
  watchedSubtle:   '#E6FAF5',

  rating:          '#D4A017',

  error:           '#DC2626',
  errorSubtle:     '#FEF2F2',
  success:         '#059669',
  successSubtle:   '#ECFDF5',

  overlay:         'rgba(11, 13, 20, 0.5)',
} as const;

const dark = {
  background:      '#0B0D14',
  surface:         '#13172B',
  surfaceElevated: '#1C2240',

  border:          '#252D45',
  borderSubtle:    '#1A2035',

  text:            '#EEF0FF',
  textSub:         '#8B95AE',
  textMuted:       '#454F6B',

  accent:          '#E8A838',
  accentFg:        '#0B0D14',
  accentSubtle:    '#251C0A',

  watched:         '#2DD4BF',
  watchedSubtle:   '#0A2218',

  rating:          '#F5C518',

  error:           '#F87171',
  errorSubtle:     '#2D1515',
  success:         '#34D399',
  successSubtle:   '#0A2218',

  overlay:         'rgba(11, 13, 20, 0.7)',
} as const;

/* ────────────────────────────────────────────────
   FONT FAMILIES
   These names must match the keys passed to useFonts()
   in app/_layout.tsx.
   ──────────────────────────────────────────────── */

export const FontFamily = {
  // Sora — headings, titles, display text
  display:        'Sora-Bold',
  heading:        'Sora-SemiBold',
  headingRegular: 'Sora-Regular',

  // Inter — body copy, UI labels, descriptions
  body:           'Inter-Regular',
  bodyMedium:     'Inter-Medium',
  bodySemiBold:   'Inter-SemiBold',

  // Space Mono — ratings, episode counts, stats, badges
  mono:           'SpaceMono-Regular',
  monoBold:       'SpaceMono-Bold',
} as const;

/* ────────────────────────────────────────────────
   FONT SIZES  (4pt base grid)
   ──────────────────────────────────────────────── */

export const FontSize = {
  xxs:  10,
  xs:   12,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  30,
  xxxl: 36,
} as const;

export const LineHeight = {
  xxs:  14,
  xs:   16,
  sm:   18,
  base: 22,
  md:   24,
  lg:   28,
  xl:   32,
  xxl:  38,
  xxxl: 44,
} as const;

/* ────────────────────────────────────────────────
   SPACING  (4pt grid)
   ──────────────────────────────────────────────── */

export const Spacing = {
  0.5: 2,
  1:   4,
  2:   8,
  3:   12,
  4:   16,
  5:   20,
  6:   24,
  7:   28,
  8:   32,
  10:  40,
  12:  48,
  16:  64,
  20:  80,
  24:  96,
} as const;

/* ────────────────────────────────────────────────
   BORDER RADIUS
   ──────────────────────────────────────────────── */

export const Radius = {
  sm:   6,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  full: 9999,
} as const;

/* ────────────────────────────────────────────────
   SHADOWS  (cross-platform)
   ──────────────────────────────────────────────── */

export const Shadow = {
  sm: {
    shadowColor: '#0B0D14',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0B0D14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#0B0D14',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

/* ────────────────────────────────────────────────
   MAIN EXPORT
   ──────────────────────────────────────────────── */

export const theme = {
  colors: { light, dark },
  font:   FontFamily,
  size:   FontSize,
  line:   LineHeight,
  space:  Spacing,
  radius: Radius,
  shadow: Shadow,
} as const;

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof light;
