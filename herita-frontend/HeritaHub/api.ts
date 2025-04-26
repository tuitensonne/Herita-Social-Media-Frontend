import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { getToken, setToken } from './services/TokenService';
import { resetToSignIn } from './services/NavigationService';

type DecodedToken = {
  sub: string;
  email: string;
  exp: number;
};

const api = axios.create({
  baseURL: process.env.EXPO_BASE_URL,
});

const refreshToken = async (): Promise<string> => {
  const refresh = await SecureStore.getItemAsync('refresh_token');
  const response = await api.post(`/auth/refreshToken`, {
    refreshToken: refresh
  });
  const { access_token, refresh_token } = response.data.result;
  await SecureStore.setItemAsync('refresh_token', refresh_token);
  return access_token;
};

export const isAccessTokenExpired = async (): Promise<boolean> => {
  const accessToken = await SecureStore.getItemAsync('access_token');
  if (!accessToken) return true;

  const decoded = jwtDecode<DecodedToken>(accessToken);
  return decoded.exp * 1000 < Date.now();
};

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  async (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        setToken(newToken);
        await SecureStore.setItemAsync('access_token', newToken);
        processQueue(null, newToken);

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err: any) {
        processQueue(err, null);
        
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        
        resetToSignIn();
        
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
