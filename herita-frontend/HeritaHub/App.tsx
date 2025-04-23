import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import WelcomeScreen from "./pages/WelcomeScreen";
import SignUpScreen from "./pages/SignUpSreen";
import SignInScreen from "./pages/SignInScreen";
import HomeScreen from "./pages/HomeScreen";
import DocumentScreen from "./pages/Document/DocumentScreen";
import UploadDocumentScreen from "./pages/Document/UploadDocumentScreen";
type RootStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  SignIn: undefined;
  Home: undefined;
  Document: undefined;
  UploadDocument: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Document"
          component={DocumentScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UploadDocument"
          component={UploadDocumentScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
