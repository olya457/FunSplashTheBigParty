import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  Animated,
  Easing,
  useWindowDimensions,
  ImageSourcePropType,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

const BG: ImageSourcePropType = require('../assets/BACKGROUND.png');
const P1: ImageSourcePropType = require('../assets/picture1.png');
const P2: ImageSourcePropType = require('../assets/picture2.png');
const P3: ImageSourcePropType = require('../assets/picture3.png');
const FRAME: ImageSourcePropType = require('../assets/bottom_picture.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();

  const sW = Math.max(0.72, Math.min(1, width / 390));
  const sH = Math.max(0.72, Math.min(1, height / 844));
  const s = Math.min(sW, sH); 

  const isShort = height < 750;

  const [step, setStep] = useState<0 | 1 | 2>(0);
  
  const screens = useMemo(
    () => [
      { img: P1, title: 'Gather friends', text: 'Fish fun with your friends! Fun Splash: The Big Party is your company fishing for laughter and bright moments.', btn: 'Okay' },
      { img: P2, title: 'Fish tasks', text: 'Cast the fishing rod and catch a random task, joke or challenge. Each catch is a new fan!', btn: 'Continue' },
      { img: P3, title: 'Accidentally caught a goldfish?', text: 'Cast the fishing rod and catch a random task, joke or challenge. Each catch is a new fan!', btn: 'Start play' },
    ],
    []
  );
  const { img, title, text, btn } = screens[step];

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    fade.setValue(0);
    slide.setValue(16);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [step]);

  const onPrimary = () => (step < 2 ? setStep((v) => (v + 1) as 0 | 1 | 2) : navigation.replace('Home'));

  const TOP_W = 340 * s;
  const TOP_H = 400 * s;
  const FRAME_W = 372 * s;
  const FRAME_H = 320 * s;
  const BTN_W = 160 * s;
  const BTN_H = 70 * s;

  const TOP_MARGIN = isShort ? 25 * sH : 40 * sH;
  const topExtraDown = 80 * s * (isShort ? 0.7 : 1);
  const btnLiftUp = 10 * s;

  const universalBottomMargin = 20 * s; 

  return (
    <View style={styles.wrap}>
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        <Animated.View style={[styles.content, { opacity: fade, transform: [{ translateY: slide }] }]}>
       
          <View 
            style={[
              styles.innerContainer,
              { 
                justifyContent: 'flex-end', 
                marginBottom: universalBottomMargin 
              }
            ]}
          >
            
            <View style={[styles.topWrap, { 
                marginTop: TOP_MARGIN + topExtraDown,
                marginBottom: 20 * s, 
             }]}>
              <Image source={img} style={{ width: TOP_W, height: TOP_H }} resizeMode="contain" />
            </View>

            <View style={styles.frameWrap}>
              <ImageBackground
                source={FRAME}
                style={{ width: FRAME_W, height: FRAME_H, alignItems: 'center', justifyContent: 'center' }}
                resizeMode="contain"
              >
                <View style={styles.frameInner}>
                  <Text style={[styles.title, { fontSize: 22 * s }]}>{title}</Text>
                  <Text style={[styles.subtitle, { 
                    fontSize: Math.max(13, 14 * s), 
                    lineHeight: Math.max(18, 20 * s),
                    paddingVertical: isShort ? 4 * s : 8 * s, 
                  }]}>
                    {text}
                  </Text>
                </View>
              </ImageBackground>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPrimary}
                style={[
                  styles.primaryBase,
                  {
                    width: BTN_W,
                    height: BTN_H,
                    marginTop: -(BTN_H / 2) - btnLiftUp, 
                    borderRadius: 16 * s,
                  },
                ]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: Math.max(14, 16 * s) }}>{btn}</Text>
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
  
  content: { flex: 1, alignItems: 'center' }, 

  innerContainer: {
    flex: 1, 
    alignItems: 'center',
  },

  topWrap: { alignItems: 'center', justifyContent: 'center' },
  frameWrap: { width: '100%', alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 12 },
  frameInner: { width: '80%', maxWidth: 300, alignItems: 'center', justifyContent: 'center' }, 
  
  title: { color: '#FFFFFF', fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#FFFFFF', opacity: 0.92, textAlign: 'center' },
  primaryBase: {
    backgroundColor: '#38C558',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
});