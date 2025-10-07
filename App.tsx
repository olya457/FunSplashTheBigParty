import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { MusicProvider } from './src/providers/MusicProvider';

export default function App() {
  return (
    <MusicProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </MusicProvider>
  );
}
