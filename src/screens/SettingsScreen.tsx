import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  useWindowDimensions,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useMusic } from '../providers/MusicProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const BG: ImageSourcePropType = require('../assets/BACKGROUND.png');
const BACK_BTN: ImageSourcePropType = require('../assets/back.png');
const TITLE_IMG: ImageSourcePropType = require('../assets/SETTINGS.png');

const MUSIC_KEY = 'settings:musicEnabled';
const VIBRA_KEY = 'settings:vibration';

export default function SettingsScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const s = Math.max(0.8, Math.min(1, width / 390));

  const { musicOn, setOn: setMusicOn } = useMusic();
  const [vibration, setVibration] = useState(false);

  useEffect(() => {
    (async () => {
      const savedMusic = await AsyncStorage.getItem(MUSIC_KEY);
      if (savedMusic == null) {
        await AsyncStorage.setItem(MUSIC_KEY, '1');
        setMusicOn(true);
      } else {
        const enabled = savedMusic === '1';
        if (enabled !== musicOn) setMusicOn(enabled);
      }
      const savedVibra = await AsyncStorage.getItem(VIBRA_KEY);
      if (savedVibra != null) setVibration(savedVibra === '1');
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(MUSIC_KEY, musicOn ? '1' : '0').catch(() => {});
  }, [musicOn]);
  useEffect(() => {
    AsyncStorage.setItem(VIBRA_KEY, vibration ? '1' : '0').catch(() => {});
  }, [vibration]);

  const toggleMusic = () => setMusicOn(!musicOn);

  return (
    <View style={styles.wrap}>
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        <View style={[styles.container, { paddingTop: 80 }]}>
          <View style={styles.headerCenterWrap}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ marginRight: 12 * s }}
              >
                <Image source={BACK_BTN} style={{ width: 75 * s, height: 75 * s }} resizeMode="contain" />
              </TouchableOpacity>

              <Image
                source={TITLE_IMG}
                style={{ width: 230 * s, height: 75 * s }}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={[styles.list, { gap: 14 * s, marginTop: 40 }]}>
            <SettingRow s={s} label="Music" value={musicOn} onToggle={toggleMusic} />
            <SettingRow s={s} label="Vibration" value={vibration} onToggle={() => setVibration(v => !v)} />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

function SettingRow({
  s,
  label,
  value,
  onToggle,
}: {
  s: number;
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  const OFF_X = 2 * s;
  const ON_X = 44 * s;
  const knobX = useRef(new Animated.Value(value ? ON_X : OFF_X)).current;

  useEffect(() => {
    Animated.timing(knobX, {
      toValue: value ? ON_X: OFF_X,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [value, s, knobX]);

  const labelLeft = value ? 10 * s : 40 * s;

  return (
    <View
      style={[
        styles.card,
        {
          width: 314 * s,
          height: 74 * s,
          borderRadius: 16 * s,
          paddingHorizontal: 16 * s,
        },
      ]}
    >
      <Text style={[styles.cardLabel, { fontSize: Math.max(13, 14 * s) }]}>{label}</Text>

      <TouchableOpacity activeOpacity={0.9} onPress={onToggle}>
        <View
          style={[
            styles.switchBase,
            {
              width: 74 * s,
              height: 32 * s,
              borderRadius: 16 * s,
              backgroundColor: value ? '#38C558' : '#D9534F',
            },
          ]}
        >
          <Text style={[styles.switchText, { left: labelLeft, fontSize: 12 * s }]}>
            {value ? 'ON' : 'OFF'}
          </Text>

          <Animated.View
            style={[
              styles.knob,
              {
                width: 28 * s,
                height: 28 * s,
                borderRadius: 14 * s,
                transform: [{ translateX: knobX }],
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  bg: { flex: 1, width: '100%', height: '100%' },

  container: { flex: 1, alignItems: 'center' },

  headerCenterWrap: { width: '100%', alignItems: 'center', paddingHorizontal: 30 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },

  list: { alignItems: 'center', width: '100%' },

  card: {
    backgroundColor: '#0B2438',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    borderRadius: 16,
  },

  cardLabel: { color: '#FFFFFF', fontWeight: '700' },

  switchBase: { justifyContent: 'center', overflow: 'hidden' },

  switchText: { position: 'absolute', color: '#FFFFFF', fontWeight: '800' },

  knob: { position: 'absolute', top: 2, backgroundColor: '#FFFFFF' },
});
