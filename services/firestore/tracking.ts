import {
  collection,
  doc,
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

export async function getTracking(
  userId: string,
  seriesId: number,
): Promise<SeriesTracking | null> {
  try {
    const snap = await getDoc(trackingRef(userId, seriesId));
    if (!snap.exists()) return null;
    return snap.data() as SeriesTracking;
  } catch (e) {
    console.error('[getTracking] error:', e);
    return null;
  }
}

export async function getAllTracking(userId: string): Promise<SeriesTracking[]> {
  try {
    const col = collection(db, 'users', userId, 'tracking');
    const snap = await getDocs(col);
    return snap.docs.map(d => d.data() as SeriesTracking);
  } catch (e) {
    console.error('[getAllTracking] error:', e);
    return [];
  }
}

export async function addTracking(userId: string, input: TrackingInput): Promise<void> {
  try {
    const ref = trackingRef(userId, input.seriesId);
    const snap = await getDoc(ref);
    if (snap.exists()) return;
    await setDoc(ref, {
      ...input,
      watched: {},
      addedAt: Date.now(),
      lastWatchedAt: Date.now(),
    });
  } catch (e) {
    console.error('[addTracking] error:', e);
    throw e;
  }
}

export async function removeTracking(userId: string, seriesId: number): Promise<void> {
  try {
    await deleteDoc(trackingRef(userId, seriesId));
  } catch (e) {
    console.error('[removeTracking] error:', e);
    throw e;
  }
}

/**
 * Toggle a single episode watched state.
 * When marking as WATCHED: also marks all earlier episodes in the same season (1 → episodeNum-1).
 * When marking as UNWATCHED: only unmarks that specific episode.
 */
export async function toggleEpisode(
  userId: string,
  seriesId: number,
  seasonNum: number,
  episodeNum: number,
): Promise<void> {
  try {
    const ref = trackingRef(userId, seriesId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data() as SeriesTracking;
    const key = `S${seasonNum}E${episodeNum}`;
    const newWatched = { ...data.watched };

    if (newWatched[key]) {
      // Unmark only this episode
      delete newWatched[key];
    } else {
      // Mark this episode + all earlier episodes in same season as watched
      for (let ep = 1; ep <= episodeNum; ep++) {
        newWatched[`S${seasonNum}E${ep}`] = true;
      }
    }

    await updateDoc(ref, { watched: newWatched, lastWatchedAt: Date.now() });
  } catch (e) {
    console.error('[toggleEpisode] error:', e);
    throw e;
  }
}

/**
 * Mark all episodes in a season (and all previous seasons) as watched.
 * seasonEpisodeCounts: map of seasonNum → episodeCount for all seasons up to and including this one.
 */
export async function markSeasonWatched(
  userId: string,
  seriesId: number,
  seasonNum: number,
  episodeCount: number,
  seasonEpisodeCounts?: Record<number, number>,
): Promise<void> {
  try {
    const ref = trackingRef(userId, seriesId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data() as SeriesTracking;
    const newWatched = { ...data.watched };

    // Mark all prior seasons if their episode counts are provided
    if (seasonEpisodeCounts) {
      for (const [sNum, sCount] of Object.entries(seasonEpisodeCounts)) {
        const n = Number(sNum);
        if (n < seasonNum) {
          for (let ep = 1; ep <= sCount; ep++) {
            newWatched[`S${n}E${ep}`] = true;
          }
        }
      }
    }

    // Mark all episodes in the target season
    for (let i = 1; i <= episodeCount; i++) {
      newWatched[`S${seasonNum}E${i}`] = true;
    }

    await updateDoc(ref, { watched: newWatched, lastWatchedAt: Date.now() });
  } catch (e) {
    console.error('[markSeasonWatched] error:', e);
    throw e;
  }
}

export async function markSeasonUnwatched(
  userId: string,
  seriesId: number,
  seasonNum: number,
): Promise<void> {
  try {
    const ref = trackingRef(userId, seriesId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data() as SeriesTracking;
    const newWatched = Object.fromEntries(
      Object.entries(data.watched).filter(([k]) => !k.startsWith(`S${seasonNum}E`)),
    ) as Record<string, true>;
    await updateDoc(ref, { watched: newWatched, lastWatchedAt: Date.now() });
  } catch (e) {
    console.error('[markSeasonUnwatched] error:', e);
    throw e;
  }
}

export function countWatchedInSeason(watched: Record<string, true>, seasonNum: number): number {
  return Object.keys(watched).filter(k => k.startsWith(`S${seasonNum}E`)).length;
}

export function getNextEpisode(watched: Record<string, true>): string | null {
  const keys = Object.keys(watched);
  if (keys.length === 0) return 'S1E1';

  let maxS = 1;
  let maxE = 0;
  keys.forEach(k => {
    const match = k.match(/S(\d+)E(\d+)/);
    if (match) {
      const s = parseInt(match[1]);
      const e = parseInt(match[2]);
      if (s > maxS) { maxS = s; maxE = e; }
      else if (s === maxS && e > maxE) { maxE = e; }
    }
  });

  return `S${maxS}E${maxE + 1}`;
}
