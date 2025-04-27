import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FriendProfileScreen from '../pages/ProfileScreenForFriend';
import ProfileDetailSreen from '../pages/ProfileDetailScreen';
import GeneralProfileScreen from '../pages/GeneralProfileScreen';
import ConversationScreen from '../pages/ConversationScreen';

export type ProfileStackParamList = {
  ProfileDetail: undefined;
  GeneralProfile: undefined;
  FriendProfile: {userId: string};
  Conversation: {chatI: string, chatType: string, chatName: string, userId: string}
};

const Stack = createStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GeneralProfile" component={GeneralProfileScreen} options={{ headerShown: false }} /> 
        <Stack.Screen name="FriendProfile" component={FriendProfileScreen} options={{ headerShown: false }} /> 
        <Stack.Screen name="ProfileDetail" component={ProfileDetailSreen} options={{ headerShown: false }} /> 
        <Stack.Screen name="Conversation" component={ConversationScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
