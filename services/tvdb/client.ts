import axios from 'axios';

const BASE_URL = 'https://api4.thetvdb.com/v4';
const API_KEY = process.env.EXPO_PUBLIC_TVDB_API_KEY as string;

let _token: string | null = null;
let _loginPromise: Promise<string> | null = null;

async function fetchToken(): Promise<string> {
  const res = await axios.post<{ data: { token: string }; status: string }>(
    `${BASE_URL}/login`,
    { apikey: API_KEY },
  );
  return res.data.data.token;
}

async function getToken(): Promise<string> {
  if (_token) return _token;
  if (!_loginPromise) {
    _loginPromise = fetchToken().then(t => {
      _token = t;
      _loginPromise = null;
      return t;
    });
  }
  return _loginPromise;
}

const client = axios.create({ baseURL: BASE_URL });

client.interceptors.request.use(async config => {
  const token = await getToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto re-login on token expiry
client.interceptors.response.use(
  res => res,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      _token = null;
      const token = await getToken();
      error.config.headers.Authorization = `Bearer ${token}`;
      return client.request(error.config);
    }
    return Promise.reject(error);
  },
);

export default client;
