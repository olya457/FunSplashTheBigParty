import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Animated,
  Easing,
  useWindowDimensions,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

const BG: ImageSourcePropType = require('../assets/BACKGROUND.png');
const FISH: ImageSourcePropType = require('../assets/fish.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Loader'>;

const FISH_W = 146;
const FISH_H = 131;

type Bubble = {
  key: string;
  size: number;
  startX: number;
  drift: number;
  delay: number;
  duration: number;
  progress: Animated.Value;
};

export default function LoaderScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();

  const fishX = useRef(new Animated.Value(-FISH_W)).current;

  const bobProgress = useRef(new Animated.Value(0)).current;
  const BOB_AMP = 10;        
  const BOB_DUR = 1400;     

  const baseY = height * 0.45 - FISH_H / 2;

  useEffect(() => {
   
    Animated.timing(fishX, {
      toValue: width,
      duration: 5000,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fishX, width]);

  useEffect(() => {
    const loopBobbing = () =>
      Animated.sequence([
        Animated.timing(bobProgress, {
          toValue: 1,
          duration: BOB_DUR,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bobProgress, {
          toValue: 0,
          duration: BOB_DUR,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) loopBobbing();
      });

    loopBobbing();
  }, [bobProgress]);

  useEffect(() => {
    const id = setTimeout(() => navigation.replace('Onboarding'), 5000);
    return () => clearTimeout(id);
  }, [navigation]);

  const bubbles = useMemo<Bubble[]>(() => {
    const N = 22;
    const arr: Bubble[] = [];
    for (let i = 0; i < N; i++) {
      const size = 8 + Math.random() * 22;         
      const startX = Math.random() * width;
      const drift = Math.random() * 40 - 20;        
      const delay = Math.random() * 1800;           
      const duration = 3500 + Math.random() * 3000; 
      arr.push({
        key: `b${i}`,
        size,
        startX,
        drift,
        delay,
        duration,
        progress: new Animated.Value(0),
      });
    }
    return arr;
  }, [width]);

  useEffect(() => {
    bubbles.forEach(b => {
      const startLoop = () =>
        Animated.sequence([
          Animated.delay(b.delay),
          Animated.timing(b.progress, {
            toValue: 1,
            duration: b.duration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished) {
            b.progress.setValue(0);
            startLoop();
          }
        });
      startLoop();
    });
  }, [bubbles]);

  const renderBubbles = () =>
    bubbles.map(b => {
      const translateY = b.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [height + b.size, -b.size],
      });
      const translateX = b.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [b.startX, b.startX + b.drift],
      });
      const opacity = b.progress.interpolate({
        inputRange: [0, 0.1, 0.8, 1],
        outputRange: [0, 0.6, 0.25, 0],
      });
      const scale = b.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.9, 1.05],
      });

      return (
        <Animated.View
          key={b.key}
          pointerEvents="none"
          style={[
            styles.bubble,
            {
              width: b.size,
              height: b.size,
              borderRadius: b.size / 2,
              transform: [{ translateX }, { translateY }, { scale }],
              opacity,
            },
          ]}
        />
      );
    });

  const fishBobOffsetY = bobProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-BOB_AMP, BOB_AMP],
  });

  return (
    <View style={styles.wrap}>
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        {renderBubbles()}

        <Animated.Image
          source={FISH}
          resizeMode="contain"
          style={[
            styles.fish,
            {
              width: FISH_W,
              height: FISH_H,
              transform: [
                { translateX: fishX },
                { translateY: new Animated.Value(baseY) },
                { translateY: fishBobOffsetY },
              ],
            },
          ]}
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1, width: '100%', height: '100%' },
  fish: { position: 'absolute' },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: Platform.OS === 'ios' ? 0.6 : 0.8,
    borderColor: 'rgba(255,255,255,0.35)',
  },
});
