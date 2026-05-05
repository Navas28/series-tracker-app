import axios from 'axios';

const tmdbClient = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_API_READ_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export default tmdbClient;

export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export type ImageSize =
  | 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';

export function getImageUrl(path: string | null | undefined, size: ImageSize = 'w500'): string | null {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}
