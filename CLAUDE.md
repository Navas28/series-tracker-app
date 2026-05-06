# Series Tracker — Project Reference

Personal app to track watched series, manage watch history, check analytics, and follow upcoming seasons.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Navigation | Expo Router v6 (file-based) |
| Styling | NativeWind v4 (Tailwind CSS for React Native) |
| Data fetching | TanStack Query v5 + Axios |
| Series data | TMDB API (free, personal key) |
| Auth | Firebase Auth (Google Sign-In) |
| Database | Firebase Firestore |
| Animations | React Native Reanimated v4 + Moti |
| Icons | Lucide React Native |
| Language | TypeScript (strict mode) |
| Architecture | New Architecture enabled |

---

## Design System

Single source of truth: `constants/theme.ts` + `global.css` + `tailwind.config.js`

### Color Palette — "Logo DNA"

CSS variables defined in `global.css` auto-switch between light and dark.
Use them directly as Tailwind classes — no `dark:` prefix needed.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `background` | `#f4f6fb` | `#010d23` | Screen backgrounds |
| `surface` | `#ffffff` | `#0f1a2e` | Cards, sheets |
| `surface-elevated` | `#e8eef7` | `#1a2d47` | Modals, popovers |
| `border` | `#c2cedf` | `#22293c` | Dividers, outlines |
| `border-subtle` | `#d8e2ef` | `#162035` | Subtle separators |
| `text` | `#010d23` | `#f0f4ff` | Primary text |
| `text-sub` | `#455f82` | `#8ba0b8` | Secondary labels |
| `text-muted` | `#8ba0b8` | `#455f82` | Placeholders |
| `accent` | `#c86c36` | `#ed8130` | Brand orange (from logo rim) |
| `accent-fg` | `#ffffff` | `#010d23` | Text on accent bg |
| `accent-subtle` | `#fdf0e6` | `#1f1510` | Accent-tinted surfaces |
| `watched` | `#3a5272` | `#5f7387` | Watched state (slate blue from logo) |
| `watched-subtle` | `#e4eaf4` | `#0d1829` | Watched background |
| `rating` | `#c86c36` | `#eb7f23` | Star ratings (warm orange) |
| `error` | `#c0392b` | `#e05c5c` | Errors |
| `success` | `#1e7e5e` | `#2ecc8a` | Success states |

### Fonts

Three fonts create a clear hierarchy:

| Class | Font | Weight | Use for |
|---|---|---|---|
| `font-display` | Sora | Bold 700 | Hero titles, screen headings |
| `font-heading` | Sora | SemiBold 600 | Section titles, card titles |
| `font-heading-regular` | Sora | Regular 400 | Subtitles |
| `font-body` | Inter | Regular 400 | Body copy, descriptions |
| `font-body-medium` | Inter | Medium 500 | Labels, list items |
| `font-body-semibold` | Inter | SemiBold 600 | Buttons, emphasis |
| `font-mono` | Space Mono | Regular 400 | Ratings, episode numbers, counts |
| `font-mono-bold` | Space Mono | Bold 700 | Highlighted stats |

### Font Sizes

`text-2xs` → `text-xs` → `text-sm` → `text-base` → `text-md` → `text-lg` → `text-xl` → `text-2xl` → `text-3xl`

### Spacing

4pt grid: `p-1`=4px `p-2`=8px `p-3`=12px `p-4`=16px `p-5`=20px `p-6`=24px `p-8`=32px

### Border Radius

`rounded-sm`=6 · `rounded-md`=12 · `rounded-lg`=16 · `rounded-xl`=24 · `rounded-2xl`=32 · `rounded-full`

---

## Coding Rules

### Styling

- Use **NativeWind className** as the primary way to style everything.
- Only use `StyleSheet` or inline `style={{}}` when NativeWind cannot handle it (e.g. complex shadows, animated values, dynamic numeric calculations).
- All color tokens, font names, spacing, and radii come from `tailwind.config.js` / `theme.ts`. Never hardcode color hex values or font strings in components.
- Example pattern:
  ```tsx
  <View className="bg-surface rounded-lg p-4 border border-border">
    <Text className="font-heading text-md text-text">Title</Text>
    <Text className="font-body text-sm text-text-sub">Subtitle</Text>
    <Text className="font-mono text-xs text-rating">★ 8.7</Text>
  </View>
  ```

### Architecture

- Follow **component-based architecture**: each feature has its own folder inside `components/`.
- Screens in `app/` are thin — they compose components, call hooks, pass data down. No logic inside screen files.
- Keep data-fetching logic in `services/` and wrap it with TanStack Query hooks in `hooks/`.
- Firebase reads/writes only happen inside `services/` — never directly in components or screens.
- TMDB API calls only happen inside `services/tmdb/` — never directly in components.

### New Files

- Every new component file must use NativeWind classes for styling.
- Every new file must import colors/fonts from `constants/theme.ts` if using StyleSheet.
- Follow the existing folder structure. Do not create new top-level folders without a clear reason.
- Keep component files under ~150 lines. Split into smaller components if needed.

### Services & APIs

- Use only working, documented approaches. Check official docs before implementing new features.
- TMDB API key lives in `.env` as `EXPO_PUBLIC_TMDB_API_KEY`. Access via `process.env.EXPO_PUBLIC_TMDB_API_KEY`.
- Firebase config lives in `lib/firebase.ts`.
- All async operations use try/catch with proper error states.

### Animations

- Use animations and smooth effects where they improve the experience (screen transitions, list items appearing, button press feedback, loading states).
- **Moti** — use for simple animations: fade in/out, slide, scale, pulse. Framer Motion-like API, easy to write.
- **React Native Reanimated** (already installed) — use for complex animations: gesture-driven, shared element transitions, layout animations.
- Framer Motion does **not** work in React Native — never use it.
- Example Moti usage:
  ```tsx
  import { MotiView } from 'moti';
  <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} />
  ```

### General

- TypeScript strict mode is on. No `any` types.
- All answers and explanations should be simple, clear, and accurate.
- No unnecessary comments in code.
- No unused imports or variables.

---

## Environment Variables

```
EXPO_PUBLIC_TMDB_API_KEY=          # TMDB v3 API key
EXPO_PUBLIC_TMDB_API_READ_ACCESS_TOKEN=  # TMDB v4 read access token
```

Firebase config is loaded from `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) — not from `.env`.

---

## Key Commands

```bash
npx expo start              # Start dev server
npx expo run:android        # Build and run on Android (required for Firebase)
npx expo run:ios            # Build and run on iOS
npx expo prebuild --clean   # Regenerate native folders
```
