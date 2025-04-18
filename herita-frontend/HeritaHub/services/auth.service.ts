// src/services/authService.ts
import api from '../api';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

type DecodedToken = {
  sub: number;
  email: string;
  exp: number;
};

export const refreshToken = async (): Promise<string> => {
  const refresh = await SecureStore.getItemAsync('refresh_token');

  const response = await api.post(`/auth/refreshToken`, {
    refreshToken: refresh
  });

  const { access_token, refresh_token } = response.data;

  await SecureStore.setItemAsync('access_token', access_token);
  await SecureStore.setItemAsync('refresh_token', refresh_token);

  return access_token;
};

export const isAccessTokenExpired = async (): Promise<boolean> => {
  const accessToken = await SecureStore.getItemAsync('access_token');
  if (!accessToken) return true;

  const decoded = jwtDecode<DecodedToken>(accessToken);
  return decoded.exp * 1000 < Date.now();
};
