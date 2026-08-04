import { Platform } from 'react-native';

export const API_BASE_URL = 'https://cms-qaj9.onrender.com';

export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
