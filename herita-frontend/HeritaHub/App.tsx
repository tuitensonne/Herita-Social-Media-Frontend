// App.tsx
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from './pages/WelcomeScreen';
import SignUpScreen from './pages/SignUpSreen';
import SignInScreen from './pages/SignInScreen';
import TabNavigator from './components/BottomNavBar';

export type RootStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  SignIn: undefined;
  MainTabs: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const defaultErrorHandler = ErrorUtils.getGlobalHandler && ErrorUtils.getGlobalHandler();

ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.log("🔥 TOÀN BỘ ERROR 🔥", error);
  console.log("🔎 Stack:", error?.stack);
  if (defaultErrorHandler) {
    defaultErrorHandler(error, isFatal);
  }
});

export default function App() {
  return ( 
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="MainTabs" component={TabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}