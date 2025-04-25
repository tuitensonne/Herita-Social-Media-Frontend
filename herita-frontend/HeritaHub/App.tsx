import { SafeAreaProvider } from "react-native-safe-area-context";
import AuthStackNavigator from "./Stack/AuthStack";
import TabNavigator from "./components/BottomNavBar";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef } from "./services/NavigationService";
import ChatListScreen from "./pages/ChatListScreen";
import DocumentScreen from "./pages/DocumentScreen";
export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthStackNavigator} />
          <Stack.Screen name="MainTabs" component={DocumentScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
