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
| Icons | Lucide React Native |
| Language | TypeScript (strict mode) |
| Architecture | New Architecture enabled |

---

## Folder Structure

```
series-tracker/
├── app/                        # Screens (Expo Router file-based routing)
│   ├── (tabs)/                 # Bottom tab screens
│   │   ├── _layout.tsx         # Tab bar setup
│   │   ├── index.tsx           # Home / discover
│   │   └── explore.tsx         # Browse / search
│   ├── _layout.tsx             # Root layout (fonts, providers)
│   └── modal.tsx               # Modal screen
│
├── components/                 # Reusable UI components
│   ├── ui/                     # Base primitives (Button, Card, Badge, etc.)
│   └── [feature]/              # Feature-specific components
│
├── constants/
│   └── theme.ts                # Design system: colors, fonts, spacing, radius, shadow
│
├── hooks/                      # Custom React hooks
├── lib/                        # API clients, Firebase setup, helpers
├── services/                   # Data layer (TMDB queries, Firestore reads/writes)
├── types/                      # Shared TypeScript types
├── assets/images/              # App icons, splash screen
│
├── global.css                  # Tailwind directives + CSS variables (light/dark colors)
├── tailwind.config.js          # Tailwind custom colors, fonts, spacing, radius
├── babel.config.js             # NativeWind babel preset
├── metro.config.js             # NativeWind metro wrapper
├── nativewind-env.d.ts         # NativeWind TypeScript types
├── app.json                    # Expo config (bundle IDs, Firebase plugin)
└── .env                        # API keys (never commit)
```

---

## Design System

Single source of truth: `constants/theme.ts` + `global.css` + `tailwind.config.js`

### Color Palette — "Cinescape"

CSS variables defined in `global.css` auto-switch between light and dark.
Use them directly as Tailwind classes — no `dark:` prefix needed.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `background` | `#F5F7FC` | `#0B0D14` | Screen backgrounds |
| `surface` | `#FFFFFF` | `#13172B` | Cards, sheets |
| `surface-elevated` | `#EAEFF8` | `#1C2240` | Modals, popovers |
| `border` | `#D1D9ED` | `#252D45` | Dividers, outlines |
| `border-subtle` | `#E5EAF6` | `#1A2035` | Subtle separators |
| `text` | `#0B0D14` | `#EEF0FF` | Primary text |
| `text-sub` | `#4E5A7A` | `#8B95AE` | Secondary labels |
| `text-muted` | `#9BA5C4` | `#454F6B` | Placeholders |
| `accent` | `#C8881E` | `#E8A838` | Brand color (amber/gold) |
| `accent-fg` | `#FFFFFF` | `#0B0D14` | Text on accent bg |
| `accent-subtle` | `#FEF4E3` | `#251C0A` | Accent-tinted surfaces |
| `watched` | `#0D9488` | `#2DD4BF` | Watched state (teal) |
| `watched-subtle` | `#E6FAF5` | `#0A2218` | Watched background |
| `rating` | `#D4A017` | `#F5C518` | Star ratings (gold) |
| `error` | `#DC2626` | `#F87171` | Errors |
| `success` | `#059669` | `#34D399` | Success states |

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
