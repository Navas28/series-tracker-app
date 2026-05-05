import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from '@react-native-firebase/firestore';
import { db } from '@/lib/firebase';

export interface PlaylistSeries {
  seriesId: number;
  name: string;
  posterPath: string | null;
}

export interface Playlist {
  id: string;
  name: string;
  createdAt: number;
  series: PlaylistSeries[];
}

const playlistsCol = (userId: string) =>
  collection(db, 'users', userId, 'playlists');

const playlistRef = (userId: string, id: string) =>
  doc(db, 'users', userId, 'playlists', id);

export async function getPlaylists(userId: string): Promise<Playlist[]> {
  const snap = await getDocs(playlistsCol(userId));
  return snap.docs
    .map(d => d.data() as Playlist)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function createPlaylist(userId: string, name: string): Promise<string> {
  const ref = await addDoc(playlistsCol(userId), {
    name: name.trim(),
    createdAt: Date.now(),
    series: [],
    id: '',
  });
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

export async function deletePlaylist(userId: string, playlistId: string): Promise<void> {
  await deleteDoc(playlistRef(userId, playlistId));
}

export async function addSeriesToPlaylist(
  userId: string,
  playlistId: string,
  series: PlaylistSeries,
): Promise<void> {
  const ref = playlistRef(userId, playlistId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data() as Playlist;
  if (data.series.some(s => s.seriesId === series.seriesId)) return;
  await updateDoc(ref, { series: [...data.series, series] });
}

export async function removeSeriesFromPlaylist(
  userId: string,
  playlistId: string,
  seriesId: number,
): Promise<void> {
  const ref = playlistRef(userId, playlistId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data() as Playlist;
  await updateDoc(ref, { series: data.series.filter(s => s.seriesId !== seriesId) });
}
