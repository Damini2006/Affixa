import axios from 'axios';

// Use 127.0.0.1 instead of localhost: localhost resolves to IPv6 ::1 first on this
// machine, where WSL's wslrelay/Docker squat on port 8000 and answer 404.
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
