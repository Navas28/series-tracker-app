import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from '@react-native-firebase/firestore';
import { db } from '@/lib/firebase';

export interface SeriesTracking {
  seriesId: number;
  name: string;
  posterPath: string | null;
  backdropPath: string | null;
  tmdbStatus: string;
  totalSeasons: number;
  totalEpisodes: number;
  addedAt: number;
  lastWatchedAt: number;
  watched: Record<string, true>;
}

export type TrackingInput = Omit<SeriesTracking, 'addedAt' | 'lastWatchedAt' | 'watched'>;

const trackingRef = (userId: string, seriesId: number) =>
  doc(db, 'users', userId, 'tracking', String(seriesId));

export async function getTracking(userId: string, seriesId: number): Promise<SeriesTracking | null> {
  try {
    const snap = await getDoc(trackingRef(userId, seriesId));
    if (!snap.exists()) return null;
    return snap.data() as SeriesTracking;
  } catch {
    return null;
  }
}

export async function getAllTracking(userId: string): Promise<SeriesTracking[]> {
  const snap = await getDocs(collection(db, 'users', userId, 'tracking'));
  return snap.docs.map(d => d.data() as SeriesTracking);
}

export async function addTracking(userId: string, input: TrackingInput): Promise<void> {
  const ref = trackingRef(userId, input.seriesId);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, { ...input, watched: {}, addedAt: Date.now(), lastWatchedAt: Date.now() });
}

export async function removeTracking(userId: string, seriesId: number): Promise<void> {
  await deleteDoc(trackingRef(userId, seriesId));
}

export async function toggleEpisode(
  userId: string,
  seriesId: number,
  seasonNum: number,
  episodeNum: number,
): Promise<void> {
  const ref = trackingRef(userId, seriesId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data() as SeriesTracking;
  const key = `S${seasonNum}E${episodeNum}`;
  const newWatched = { ...data.watched };
  if (newWatched[key]) {
    delete newWatched[key];
  } else {
    newWatched[key] = true;
  }
  await updateDoc(ref, { watched: newWatched, lastWatchedAt: Date.now() });
}

export async function markSeasonWatched(
  userId: string,
  seriesId: number,
  seasonNum: number,
  episodeCount: number,
): Promise<void> {
  const ref = trackingRef(userId, seriesId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data() as SeriesTracking;
  const newWatched = { ...data.watched };
  for (let i = 1; i <= episodeCount; i++) {
    newWatched[`S${seasonNum}E${i}`] = true;
  }
  await updateDoc(ref, { watched: newWatched, lastWatchedAt: Date.now() });
}

export async function markSeasonUnwatched(
  userId: string,
  seriesId: number,
  seasonNum: number,
): Promise<void> {
  const ref = trackingRef(userId, seriesId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data() as SeriesTracking;
  const newWatched = Object.fromEntries(
    Object.entries(data.watched).filter(([k]) => !k.startsWith(`S${seasonNum}E`)),
  ) as Record<string, true>;
  await updateDoc(ref, { watched: newWatched, lastWatchedAt: Date.now() });
}

export function countWatchedInSeason(watched: Record<string, true>, seasonNum: number): number {
  return Object.keys(watched).filter(k => k.startsWith(`S${seasonNum}E`)).length;
}

export function getNextEpisode(watched: Record<string, true>): string | null {
  const keys = Object.keys(watched);
  if (keys.length === 0) return 'S1E1';

  // Find max season and episode
  let maxS = 1;
  let maxE = 0;

  keys.forEach(k => {
    const match = k.match(/S(\d+)E(\d+)/);
    if (match) {
      const s = parseInt(match[1]);
      const e = parseInt(match[2]);
      if (s > maxS) {
        maxS = s;
        maxE = e;
      } else if (s === maxS && e > maxE) {
        maxE = e;
      }
    }
  });

  // This is a simple guess. In reality, we should check if maxE is the last episode of the season.
  // But for the UI, "Next: S[X]E[Y+1]" is a good enough hint.
  return `S${maxS}E${maxE + 1}`;
}
