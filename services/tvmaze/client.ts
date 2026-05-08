import axios from 'axios';

const tvmazeClient = axios.create({
  baseURL: 'https://api.tvmaze.com',
  paramsSerializer: (params: Record<string, unknown>) => {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const v of value) {
          parts.push(`${key}[]=${encodeURIComponent(String(v))}`);
        }
      } else if (value !== null && value !== undefined) {
        parts.push(`${key}=${encodeURIComponent(String(value))}`);
      }
    }
    return parts.join('&');
  },
});

// Retry up to 3 times on 429 with exponential backoff
tvmazeClient.interceptors.response.use(
  res => res,
  async err => {
    const config = err.config;
    if (err.response?.status === 429) {
      config._retryCount = (config._retryCount ?? 0) + 1;
      if (config._retryCount <= 3) {
        await new Promise(res => setTimeout(res, config._retryCount * 1000));
        return tvmazeClient(config);
      }
    }
    return Promise.reject(err);
  },
);

export default tvmazeClient;

export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '');
}
