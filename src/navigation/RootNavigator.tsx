import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoaderScreen from '../screens/LoaderScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import AddPlayerScreen from '../screens/AddPlayerScreen';
import GameRulesScreen from '../screens/GameRulesScreen';
import InfoScreen from '../screens/InfoScreen';
import SettingsScreen from '../screens/SettingsScreen';
import GameplayScreen from '../screens/GameplayScreen';

export type RootStackParamList = {
  Loader:
    | {
        next?: {
          name: keyof RootStackParamList;
          params?: any;
        };
      }
    | undefined;

  Onboarding: undefined;
  Home: undefined;
  AddPlayer: undefined;
  GameRules: undefined;
  Info: undefined;
  Settings: undefined;

  Gameplay: { players: Array<{ id: string; name: string; avatarIndex: number }> };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Loader"
    >
      <Stack.Screen name="Loader" component={LoaderScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AddPlayer" component={AddPlayerScreen} />
      <Stack.Screen name="GameRules" component={GameRulesScreen} />
      <Stack.Screen name="Info" component={InfoScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Gameplay" component={GameplayScreen} />
    </Stack.Navigator>
  );
}
