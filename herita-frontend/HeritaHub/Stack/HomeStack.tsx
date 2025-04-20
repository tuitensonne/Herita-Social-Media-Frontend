import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../pages/HomeScreen';
import FriendProfileScreen from '../pages/ProfileScreenForFriend';
import ProfileDetailSreen from '../pages/ProfileDetailScreen';
import GeneralProfileScreen from '../pages/GeneralProfileScreen';

export type HomeStackParamList = {
  Home: undefined;
  MainTabs: undefined; 
  ProfileDetail: undefined;
  GeneralProfile: undefined;
  FriendProfile: {userId: string};
};

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="GeneralProfile" component={GeneralProfileScreen} options={{ headerShown: false }} /> 
          <Stack.Screen name="FriendProfile" component={FriendProfileScreen} options={{ headerShown: false }} /> 
          <Stack.Screen name="ProfileDetail" component={ProfileDetailSreen} options={{ headerShown: false }} /> 
    </Stack.Navigator>
  );
}
