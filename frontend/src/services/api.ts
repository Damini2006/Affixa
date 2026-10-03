import axios from 'axios';

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

// Centralized error handling — messages must say what actually went wrong so a
// broken production config (bad VITE_API_URL, CORS) is diagnosable from the UI.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }
    if (!error.response) {
      return Promise.reject(
        new Error(
          `Cannot reach the API at ${API_URL}. ` +
            'Check VITE_API_URL on the frontend and ALLOWED_ORIGINS on the backend.'
        )
      );
    }
    const status = error.response.status;
    const path = `${error.config?.baseURL ?? API_URL}${error.config?.url ?? ''}`;
    if (status === 404) {
      return Promise.reject(
        new Error(
          `404 Not Found for ${path}. ` +
            'VITE_API_URL must include the /api suffix (e.g. https://<service>.up.railway.app/api).'
        )
      );
    }
    if (status === 403) {
      return Promise.reject(
        new Error(
          'The backend refused the request (403). ' +
            'Its ALLOWED_ORIGINS probably does not include this site\'s URL.'
        )
      );
    }
    const detail = error.response.data?.detail;
    const message =
      typeof detail === 'string' && detail
        ? detail
        : Array.isArray(detail)
          ? detail.map((d: any) => d.msg).join('; ')
          : error.message;
    return Promise.reject(new Error(`API error ${status}: ${message}`));
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
