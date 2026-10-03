import axios, { type InternalAxiosRequestConfig } from 'axios';

// Use 127.0.0.1 instead of localhost: localhost resolves to IPv6 ::1 first on this
// machine, where WSL's wslrelay/Docker squat on port 8000 and answer 404.
// Trailing slashes are stripped so `${API_URL}/analyze/word` never becomes `//analyze/word`.
export const API_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
).replace(/\/+$/, '');

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s timeout
});

// Same-origin path that frontend/vercel.json proxies to the backend. Being
// same-origin, it never triggers a CORS check — this is the safety net for any
// origin the backend does not whitelist (preview deploys, new custom domains).
const API_PROXY = '/api';

type ProxyConfig = InternalAxiosRequestConfig & { __viaProxy?: boolean };

const configOf = (thing: any): ProxyConfig | undefined => thing?.config as ProxyConfig | undefined;

const baseOf = (config?: ProxyConfig) =>
  config?.__viaProxy ? `${window.location.origin}${API_PROXY}` : config?.baseURL ?? API_URL;

const isJson = (response: any) =>
  String(response.headers?.['content-type'] ?? '').toLowerCase().includes('json');

// Centralized error handling — messages must say what actually went wrong so a
// broken production config (bad VITE_API_URL, CORS) is diagnosable from the UI.
const friendlyError = (error: any): Error => {
  if (error.code === 'ECONNABORTED') {
    return new Error('Request timed out. Please try again.');
  }
  const config = configOf(error);
  const base = baseOf(config);
  if (!error.response) {
    if (config?.__viaProxy) {
      return new Error(
        `The backend did not respond via ${base} either — it looks down, ` +
          'or the /api rewrite is missing from vercel.json.'
      );
    }
    return new Error(
      `Cannot reach the API at ${base}. ` +
        'Check VITE_API_URL on the frontend and ALLOWED_ORIGINS on the backend.'
    );
  }
  const status = error.response.status;
  const path = `${base}${config?.url ?? ''}`;
  if (status === 404) {
    return new Error(
      `404 Not Found for ${path}. ` +
        'VITE_API_URL must include the /api suffix (e.g. https://<service>.up.railway.app/api).'
    );
  }
  if (status === 403) {
    return new Error(
      "The backend refused the request (403). " +
        "Its ALLOWED_ORIGINS probably does not include this site's URL."
    );
  }
  const detail = error.response.data?.detail;
  const message =
    typeof detail === 'string' && detail
      ? detail
      : Array.isArray(detail)
        ? detail.map((d: any) => d.msg).join('; ')
        : error.message;
  return new Error(`API error ${status}: ${message}`);
};

apiClient.interceptors.response.use(
  (response) => {
    // The proxy can only reach a real backend; anything else (e.g. index.html
    // from the SPA fallback) must not be mistaken for a successful API call.
    if (configOf(response)?.__viaProxy && !isJson(response)) {
      return Promise.reject(
        new Error(
          `The API proxy at ${window.location.origin}${API_PROXY} did not return JSON. ` +
            'Check the /api rewrite in vercel.json.'
        )
      );
    }
    return response;
  },
  async (error) => {
    const config = configOf(error);
    // Direct call failed at the network layer (CORS blocked this origin, wrong
    // VITE_API_URL, backend unreachable) — retry once through the same-origin
    // proxy. Production builds only: local dev has no proxy, and the Vite dev
    // server would answer with index.html instead of an API response.
    if (import.meta.env.PROD && !error.response && config && !config.__viaProxy) {
      config.__viaProxy = true;
      config.baseURL = API_PROXY;
      return apiClient.request(config);
    }
    return Promise.reject(friendlyError(error));
  }
);

export interface AnalysisResponse {
  word: string;
  prefix: string;
  root: string;
  suffix: string;
  rule: string;
  confidence: number;
  method: string;
  is_valid: boolean;
}

export const analyzeWord = async (word: string): Promise<AnalysisResponse> => {
  const response = await apiClient.post('/analyze/word', { word });
  return response.data;
};

export const analyzeText = async (text: string): Promise<AnalysisResponse[]> => {
  const response = await apiClient.post('/analyze/text', { text });
  return response.data;
};
