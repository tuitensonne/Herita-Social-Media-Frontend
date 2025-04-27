import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ChatListScreen from '../pages/ChatListScreen';
import ConversationScreen from '../pages/ConversationScreen';

export type ChatStackParamList = {
  ChatList: undefined;
  Conversation: {chatI: string, chatType: string, chatName: string, userId: string}
};

const Stack = createStackNavigator<ChatStackParamList>();

export default function ChatStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Conversation" component={ConversationScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
