import { NavigationContainerRef, CommonActions } from '@react-navigation/native';
import { createRef } from 'react';
import { RootStackParamList } from '../App';

export const navigationRef = createRef<NavigationContainerRef<RootStackParamList>>();

export function navigate(name: keyof RootStackParamList | string, params?: any) {
  if (navigationRef.current) {
    if (isRootStackRoute(name as keyof RootStackParamList)) {
      navigationRef.current.navigate(name as keyof RootStackParamList, params);
    } else {
      navigationRef.current.dispatch(
        CommonActions.navigate({
          name: name as string,
          params
        })
      );
    }
  }
}

function isRootStackRoute(name: string): name is keyof RootStackParamList {
  const rootRoutes: (keyof RootStackParamList)[] = ['Welcome', 'SignUp', 'SignIn', 'MainTabs'];
  return rootRoutes.includes(name as keyof RootStackParamList);
}

export function resetToSignIn() {
  if (navigationRef.current) {
    navigationRef.current.reset({
      index: 0,
      routes: [{ name: 'SignIn' }],
    });
  }
}