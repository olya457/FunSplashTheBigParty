import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  ImageSourcePropType,
  Share,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Info'>;

const BG: ImageSourcePropType = require('../assets/BACKGROUND.png');
const BACK_BTN: ImageSourcePropType = require('../assets/back.png');
const TITLE_IMG: ImageSourcePropType = require('../assets/INFORMATION.png');
const APP_IMG: ImageSourcePropType = require('../assets/image_h.png');

type Bubble = {
  key: string;
  size: number;
  startX: number;
  drift: number;
  delay: number;
  duration: number;
  progress: Animated.Value;
};

export default function InfoScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const sW = Math.max(0.82, Math.min(1, width / 390));
  const sH = Math.max(0.82, Math.min(1, height / 844));
  const s = Math.min(sW, sH);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    fade.setValue(0);
    slide.setValue(14);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  const bubbles = useMemo<Bubble[]>(() => {
    const N = 16;
    const arr: Bubble[] = [];
    for (let i = 0; i < N; i++) {
      const size = 6 + Math.random() * 18;
      const startX = Math.random() * width;
      const drift = Math.random() * 36 - 18;
      const delay = Math.random() * 1600;
      const duration = 3200 + Math.random() * 2600;
      arr.push({ key: `ib${i}`, size, startX, drift, delay, duration, progress: new Animated.Value(0) });
    }
    return arr;
  }, [width]);

  useEffect(() => {
    bubbles.forEach(b => {
      const loop = () =>
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
            loop();
          }
        });
      loop();
    });
  }, [bubbles]);

  const renderBubbles = () =>
    bubbles.map(b => {
      const translateY = b.progress.interpolate({ inputRange: [0, 1], outputRange: [height + b.size, -b.size] });
      const translateX = b.progress.interpolate({ inputRange: [0, 1], outputRange: [b.startX, b.startX + b.drift] });
      const opacity = b.progress.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 0.5, 0.2, 0] });
      const scale = b.progress.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.06] });
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

  const onShare = async () => {
    try {
      await Share.share({
        message:
          'Fun Splash: The Big Party — catch tasks, complete funny challenges and wait for the goldfish! 🎣✨',
        url: Platform.select({
          ios: 'https://apps.apple.com/app/id0000000000',
          android: 'https://play.google.com/store/apps/details?id=com.yourapp',
        }) as string,
        title: 'Fun Splash: The Big Party',
      });
    } catch {}
  };

  return (
    <View style={styles.wrap}>
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        {renderBubbles()}
        <Animated.View
          style={[
            styles.container,
            { paddingTop: 80 * s, opacity: fade, transform: [{ translateY: slide }] },
          ]}
        >
          <View style={styles.headerCenterWrap}>
            <View style={styles.headerRow}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.goBack()}>
                <Image source={BACK_BTN} style={{ width: 75 * s, height: 75 * s }} resizeMode="contain" />
              </TouchableOpacity>
              <View style={{ width: 12 * s }} />
              <Image source={TITLE_IMG} style={{ width: 230 * s, height: 75 * s }} resizeMode="contain" />
            </View>
          </View>

          <View
            style={[
              styles.card,
              {
                width: 330 * s,
                borderRadius: 18 * s,
                padding: 16 * s,
                marginTop: 50 * s, 
              },
            ]}
          >
            <View style={{ alignItems: 'center', marginBottom: 12 * s }}>
              <Image
                source={APP_IMG}
                style={{ width: 180 * s, height: 180 * s, borderRadius: 22 * s }}
                resizeMode="cover"
              />
            </View>

            <Text
              style={{
                color: '#FFFFFF',
                fontSize: Math.max(13, 14 * s),
                lineHeight: Math.max(18, 20 * s),
                fontWeight: '700',
              }}
            >
              “Fun Splash: The Big Party” is a fun game for a group of friends. Catch tasks, complete funny
              challenges and wait for the goldfish to determine the winner of the party!
            </Text>

            <View style={{ marginTop: 18 * s }}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={onShare}
                style={[styles.cta, { height: 58 * s, borderRadius: 20 * s }]}
              >
                <Text style={[styles.ctaText, { fontSize: Math.max(16, 18 * s) }]}>Share game</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  bg: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1, alignItems: 'center' },

  headerCenterWrap: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    alignSelf: 'center',
    backgroundColor: '#001930',
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  cta: {
    backgroundColor: '#38C558',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: Platform.OS === 'ios' ? 0.5 : 0.8,
    borderColor: 'rgba(255,255,255,0.35)',
  },
});
