import { NavigationContainerRef } from '@react-navigation/native';
import { createRef } from 'react';
import { RootStackParamList } from '../App';

export const navigationRef = createRef<NavigationContainerRef<RootStackParamList>>();

export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.current) {
    navigationRef.current.navigate(name, params);
  }
}

export function resetToSignIn() {
  if (navigationRef.current) {
    navigationRef.current.reset({
      index: 0,
      routes: [{ name: 'SignIn' }],
    });
  }
}