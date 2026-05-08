import axios from 'axios';

const traktClient = axios.create({
  baseURL: 'https://api.trakt.tv',
  headers: {
    'trakt-api-key': process.env.EXPO_PUBLIC_TRAKT_CLIENT_ID ?? '',
    'trakt-api-version': '2',
    'Content-Type': 'application/json',
  },
});

export default traktClient;
