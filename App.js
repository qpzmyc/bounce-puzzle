import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import MenuScreen from './src/screens/MenuScreen';
import WorldSelectScreen from './src/screens/WorldSelectScreen';
import LevelSelectScreen from './src/screens/LevelSelectScreen';
import GameScreen from './src/screens/GameScreen';

const Stack = createNativeStackNavigator();

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { loadSounds, unloadSounds } from './src/utils/audio';
import { onAppBackground, onAppForeground } from './src/utils/ads';

export default function App() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    loadSounds();

    // AppState listener for ad timer pause/resume
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        // App going to background - freeze timer
        onAppBackground();
      } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App coming to foreground - resume timer
        onAppForeground();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      unloadSounds();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Menu"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Menu" component={MenuScreen} />
            <Stack.Screen name="WorldSelect" component={WorldSelectScreen} />
            <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
