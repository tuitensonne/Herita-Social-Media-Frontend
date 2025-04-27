import React, { ReactNode } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../pages/HomeScreen';
import { Ionicons } from "@expo/vector-icons";
import ProfileStackNavigator from '../Stack/ProfileStack';
import ChatStackNavigator from '../Stack/ChatStack';
import DocumentScreen from '../pages/DocumentScreen';

export type TabParamList = {
  Home: undefined;
  Profile: undefined;
  Chat: undefined;
};


const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline'; 
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          }
          
          return <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={size} color="#FF6F20" />;
        },
        tabBarActiveTintColor: '#FF6F20', 
        tabBarInactiveTintColor: 'gray',  
        tabBarStyle: {
          height: 60,           
          paddingBottom: 10,    
          paddingTop: 5,        
          backgroundColor: '#fff', 
          borderTopWidth: 1,    
          borderTopColor: '#e0e0e0', 
        },
        headerShown: false,    
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chat" component={ChatStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}