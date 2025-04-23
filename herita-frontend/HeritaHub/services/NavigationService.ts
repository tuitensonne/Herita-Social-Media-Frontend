import { NavigationContainerRef } from '@react-navigation/native';
import { createRef } from 'react';
import { AuthStackParamList } from '../Stack/AuthStack';

export const navigationRef = createRef<NavigationContainerRef<AuthStackParamList>>();

export function navigate(name: keyof AuthStackParamList, params?: any) {
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