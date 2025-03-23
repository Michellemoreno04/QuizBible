import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Icon } from '@rneui/base';

export default function TabLayout() {
  const colorScheme = useColorScheme();


  return (
    <Tabs
      screenOptions={{
         tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'skyblue',
   
        tabBarStyle: {
          backgroundColor: '#3C7E9F',
          borderTopWidth: 0,
          
          
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 5,
          justifyContent: 'center',
          alignItems: 'center',
          
          
        
        
        },
       }}>
        
      <Tabs.Screen
        name="index"
        
        options={{
          title: 'Home',
        headerShown: false,
        tabBarIcon: ({ color }) => <Icon name="day-haze" type="fontisto" color={color} size={26}/>,
       
        

        }}
        
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" color={color} size={26} />,
         
        
        }}
      />
    
       
     
    </Tabs>
  );
}