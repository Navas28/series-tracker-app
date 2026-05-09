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
  background:      '#f4f6fb',
  surface:         '#ffffff',
  surfaceElevated: '#e8eef7',

  border:          '#c2cedf',
  borderSubtle:    '#d8e2ef',

  text:            '#010d23',
  textSub:         '#455f82',
  textMuted:       '#8ba0b8',

  accent:          '#c86c36',
  accentFg:        '#ffffff',
  accentSubtle:    '#fdf0e6',

  watched:         '#3a5272',
  watchedSubtle:   '#e4eaf4',

  rating:          '#c86c36',

  error:           '#c0392b',
  errorSubtle:     '#fdecea',
  success:         '#1e7e5e',
  successSubtle:   '#e6f5ef',

  overlay:         'rgba(1, 13, 35, 0.5)',
  tint:            '#c86c36',
} as const;

const dark = {
  background:      '#010d23',
  surface:         '#0f1a2e',
  surfaceElevated: '#1a2d47',

  border:          '#22293c',
  borderSubtle:    '#162035',

  text:            '#f0f4ff',
  textSub:         '#8ba0b8',
  textMuted:       '#455f82',

  accent:          '#ed8130',
  accentFg:        '#010d23',
  accentSubtle:    '#1f1510',

  watched:         '#5f7387',
  watchedSubtle:   '#0d1829',

  rating:          '#eb7f23',

  error:           '#e05c5c',
  errorSubtle:     '#1f0d0d',
  success:         '#2ecc8a',
  successSubtle:   '#061a12',

  overlay:         'rgba(1, 13, 35, 0.7)',
  tint:            '#ed8130',
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

export const Colors = { light: dark, dark };

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
