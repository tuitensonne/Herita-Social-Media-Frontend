// App.tsx
// App.tsx
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from './pages/WelcomeScreen';
import SignUpScreen from './pages/SignUpSreen';
import SignInScreen from './pages/SignInScreen';
import TabNavigator from './components/BottomNavBar';
import { navigationRef } from './services/NavigationService';
import DocumentScreen from './pages/DocumentScreen';

export type RootStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  SignIn: undefined;
  MainTabs: undefined;
  Document: {
    id: string;
  };
};

const Stack = createStackNavigator<RootStackParamList>();
export default function App() {
  return ( 
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="MainTabs" component={TabNavigator} /> 
          <Stack.Screen name="Document" component={DocumentScreen} /> 
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}