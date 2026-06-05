# Binge — Series Tracker App

> A personal series tracking app built with React Native & Expo. Powered by the TVDB API for rich, up-to-date TV show data.

---

## About

Binge helps TV enthusiasts take control of their watching habits. Search any series, mark episodes as watched, build custom playlists, and see detailed watch statistics — all from your phone.

---

Backend Repo [Backend Repository](https://github.com/Navas28/series-tracker-backend)
---
## Features

- **Series Tracking** — Search and follow TV shows using real-time data from the TVDB API
- **Episode Management** — Mark individual episodes or full seasons as watched, auto-tracks previous seasons
- **Watch Progress** — Per-show progress bar, episode counts, total watch time
- **Custom Playlists** — Organise shows into named playlists
- **My Series** — Tracked shows grouped as Ongoing, To Finish, and Completed
- **Password Auth** — Register, email OTP verification, forgot/reset password flow
---

## Stack

| Layer | Tool |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Navigation | Expo Router v6 (file-based) |
| Styling | NativeWind v4 (Tailwind CSS) |
| GraphQL client | Apollo Client v4 |
| Server state | TanStack Query v5 |
| Animations | Moti + React Native Reanimated v4 |
| Icons | Lucide React Native |
| Language | TypeScript (strict) |
| Architecture | New Architecture enabled, React Compiler enabled |

---

## Data Flow

The app uses a **dual data path** depending on whether a series is tracked:

| State | Source | Client |
|---|---|---|
| Untracked | TVDB API directly | TanStack Query |
| Tracked | Neon DB via GraphQL | Apollo Client |

When a user tracks a series, the backend fetches and caches the full series data from TVDB into the database. All subsequent reads come from that cache.

---

## TVDB API

Series data (titles, posters, episode lists, air dates, descriptions) is fetched from the **TVDB API** — the largest community-driven TV database. An API key is required to run the project.
---
## Screenshots

<img width="1080" height="2319" alt="login" src="https://github.com/user-attachments/assets/e0342796-cec8-473d-b8d7-5bb1839eed44" />
<img width="717" height="1549" alt="home" src="https://github.com/user-attachments/assets/3e4a33f5-a2f9-4338-b49c-59734e2b47e5" />
<img width="717" height="1541" alt="popular" src="https://github.com/user-attachments/assets/f026c39a-940c-445b-a9f6-792993aaba9d" />
<img width="1080" height="2319" alt="playlist" src="https://github.com/user-attachments/assets/a85035a5-8a8a-44e4-bf80-dac1d2175617" />
<img width="717" height="1541" alt="details" src="https://github.com/user-attachments/assets/5f6688a2-81c9-4a68-932e-771d9634bef6" />
<img width="717" height="1537" alt="stats" src="https://github.com/user-attachments/assets/5b4e3391-b272-46e9-9b32-f2aff28fb005" />



Get your free API key at [thetvdb.com/api-information](https://www.thetvdb.com/)

---

