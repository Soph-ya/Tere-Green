import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase.config";

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: { 
          height: 70, 
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'map' : 'map-outline'} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="myScheduleScreen"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'calendar' : 'calendar-outline'} 
              size={26} 
              color={color} 
            />
          ),
          href: user ? "/myScheduleScreen" : null,
        }}
      />

      <Tabs.Screen
        name="profileScreen"
        options={{
          title: user ? 'Perfil' : 'Entrar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />

      {/* Ocultas */}
      <Tabs.Screen name="newUser" options={{ href: null }} />
      <Tabs.Screen name="replacePass" options={{ href: null }} />
      <Tabs.Screen name="login" options={{ href: null }} />
    </Tabs>
  );
}