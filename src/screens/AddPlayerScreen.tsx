import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  ImageSourcePropType,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
  ImageStyle,
  SafeAreaView, 
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'AddPlayer'>;

const BG: ImageSourcePropType        = require('../assets/BACKGROUND.png');
const BACK_BTN: ImageSourcePropType  = require('../assets/back.png');               
const TITLE_IMG: ImageSourcePropType = require('../assets/addplayers_title.png');  
const FISH: ImageSourcePropType      = require('../assets/fish.png');              
const AVATAR_MALE: ImageSourcePropType   = require('../assets/player_male.png');
const AVATAR_FEMALE: ImageSourcePropType = require('../assets/player_female.png');

type Player = { id: string; name: string; avatarIndex: number };
const AVATARS: ImageSourcePropType[] = [AVATAR_MALE, AVATAR_FEMALE];

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

export default function AddPlayerScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();

  const sW = Math.max(0.84, Math.min(1, width / 390));
  const sH = Math.max(0.84, Math.min(1, height / 844));
  const s = Math.min(sW, sH);

  const [name, setName] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showLoader, setShowLoader] = useState(false);

  const canAdd = name.trim().length > 0;
  const canStart = players.length >= 2;

  const addPlayer = () => {
    if (!canAdd) return;
    const clean = name.trim();
    setPlayers(p => [{ id: String(Date.now()), name: clean, avatarIndex }, ...p]);
    setName('');
  };
  const removePlayer = (id: string) => setPlayers(p => p.filter(x => x.id !== id));
  const nextAvatar = () => setAvatarIndex(i => (i + 1) % AVATARS.length);
  const prevAvatar = () => setAvatarIndex(i => (i - 1 + AVATARS.length) % AVATARS.length);

  const onStartGame = () => {
    if (!canStart || showLoader) return;
    setShowLoader(true);
    setTimeout(() => {
      navigation.replace('Gameplay', { players }); 
    }, 5000);
  };

  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    contentFade.setValue(0);
    contentSlide.setValue(14);
    Animated.parallel([
      Animated.timing(contentFade, { toValue: 1, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(contentSlide, { toValue: 0, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [contentFade, contentSlide]);

  const bgBubbles = useMemo<Bubble[]>(() => {
    const N = 16;
    const arr: Bubble[] = [];
    for (let i = 0; i < N; i++) {
      const size = 6 + Math.random() * 18;
      const startX = Math.random() * width;
      const drift = Math.random() * 36 - 18;
      const delay = Math.random() * 1600;
      const duration = 3200 + Math.random() * 2600;
      arr.push({ key: `bg${i}`, size, startX, drift, delay, duration, progress: new Animated.Value(0) });
    }
    return arr;
  }, [width]);

  useEffect(() => {
    bgBubbles.forEach(b => {
      const loop = () =>
        Animated.sequence([
          Animated.delay(b.delay),
          Animated.timing(b.progress, { toValue: 1, duration: b.duration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]).start(({ finished }) => {
          if (finished) { b.progress.setValue(0); loop(); }
        });
      loop();
    });
  }, [bgBubbles]);

  const renderBgBubbles = () =>
    bgBubbles.map(b => {
      const translateY = b.progress.interpolate({ inputRange: [0, 1], outputRange: [height + b.size, -b.size] });
      const translateX = b.progress.interpolate({ inputRange: [0, 1], outputRange: [b.startX, b.startX + b.drift] });
      const opacity    = b.progress.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 0.5, 0.2, 0] });
      const scale      = b.progress.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.06] });
      const style: StyleProp<ViewStyle> = [
        styles.bubble,
        {
          width: b.size,
          height: b.size,
          borderRadius: b.size / 2,
          transform: [{ translateX }, { translateY }, { scale }],
          opacity,
        } as ViewStyle,
      ];
      return <Animated.View key={b.key} pointerEvents="none" style={style} />;
    });

  const fishX = useRef(new Animated.Value(-FISH_W)).current;
  const bobProgress = useRef(new Animated.Value(0)).current;
  const BOB_AMP = 10;
  const BOB_DUR = 1400;
  const baseYNumber = height * 0.45 - FISH_H / 2;
  const baseY = useRef(new Animated.Value(baseYNumber)).current;
  useEffect(() => { baseY.setValue(baseYNumber); }, [baseYNumber, baseY]);

  const loaderBubbles = useMemo<Bubble[]>(() => {
    const N = 22;
    const arr: Bubble[] = [];
    for (let i = 0; i < N; i++) {
      const size = 8 + Math.random() * 22;
      const startX = Math.random() * width;
      const drift = Math.random() * 40 - 20;
      const delay = Math.random() * 1800;
      const duration = 3500 + Math.random() * 3000;
      arr.push({ key: `ld${i}`, size, startX, drift, delay, duration, progress: new Animated.Value(0) });
    }
    return arr;
  }, [width]);

  useEffect(() => {
    if (!showLoader) return;

    Animated.timing(fishX, {
      toValue: width,
      duration: 5000,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();

    const loopBob = () =>
      Animated.sequence([
        Animated.timing(bobProgress, { toValue: 1, duration: BOB_DUR, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bobProgress, { toValue: 0, duration: BOB_DUR, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]).start(({ finished }) => finished && loopBob());
    loopBob();

    loaderBubbles.forEach(b => {
      const loop = () =>
        Animated.sequence([
          Animated.delay(b.delay),
          Animated.timing(b.progress, { toValue: 1, duration: b.duration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]).start(({ finished }) => {
          if (finished && showLoader) { b.progress.setValue(0); loop(); }
        });
      loop();
    });

    return () => {
      fishX.stopAnimation();
      bobProgress.stopAnimation();
      loaderBubbles.forEach(b => b.progress.stopAnimation());
    };
  }, [showLoader, width, fishX, bobProgress, loaderBubbles]);

  const fishBobOffsetY = bobProgress.interpolate({ inputRange: [0, 1], outputRange: [-BOB_AMP, BOB_AMP] });
  const fishY = Animated.add(baseY, fishBobOffsetY);

  const renderLoaderBubbles = () =>
    loaderBubbles.map(b => {
      const translateY = b.progress.interpolate({ inputRange: [0, 1], outputRange: [height + b.size, -b.size] });
      const translateX = b.progress.interpolate({ inputRange: [0, 1], outputRange: [b.startX, b.startX + b.drift] });
      const opacity    = b.progress.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 0.6, 0.25, 0] });
      const scale      = b.progress.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.05] });
      const style: StyleProp<ViewStyle> = [
        styles.bubble,
        {
          width: b.size,
          height: b.size,
          borderRadius: b.size / 2,
          transform: [{ translateX }, { translateY }, { scale }],
          opacity,
        } as ViewStyle,
      ];
      return <Animated.View key={b.key} pointerEvents="none" style={style} />;
    });

  const header = useMemo(
    () => (
      <View style={[styles.headerCenterWrap, { height: 75 * s }]}> 
        <View style={styles.headerRow}>
  
          {!showLoader && (
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Image source={BACK_BTN} style={{ width: 75 * s, height: 75 * s }} resizeMode="contain" />
            </TouchableOpacity>
          )}

          {!showLoader && <View style={{ width: 12 * s }} />}

          <Image source={TITLE_IMG} style={{ width: 230 * s, height: 75 * s }} resizeMode="contain" />
        </View>
      </View>
    ),
    [navigation, s, showLoader]
  );


  if (showLoader) {
    return (
      <View style={styles.wrap}>
        <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
          {renderLoaderBubbles()}
          <Animated.Image
            source={FISH}
            resizeMode="contain"
            style={
              [
                styles.fishImage,
                {
                  width: FISH_W,
                  height: FISH_H,
                  transform: [{ translateX: fishX }, { translateY: fishY }],
                },
              ] as StyleProp<ImageStyle>
            }
          />
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        {renderBgBubbles()}

        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Animated.View style={{ flex: 1, alignItems: 'center', opacity: contentFade, transform: [{ translateY: contentSlide }] }}>
          
              <View style={[styles.container, { paddingTop: 80 * s }]}> 
                {header}
                <View
                  style={[
                    styles.card,
                    {
                      width: 330 * s,
                      borderRadius: 18 * s,
                      padding: 16 * s,
                      gap: 14 * s,
                      marginTop: 30 * s, 
                    },
                  ]}
                >
                  <View style={{ gap: 10 * s }}>
                    <Text style={[styles.label, { fontSize: 14 * s }]}>Player’s name</Text>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter player’s name"
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      style={[
                        styles.input,
                        { height: 46 * s, paddingHorizontal: 14 * s, borderRadius: 12 * s, fontSize: 16 * s },
                      ]}
                      returnKeyType="done"
                      onSubmitEditing={addPlayer}
                    />
                  </View>

                  <View style={[styles.avatarRow, { gap: 12 * s }]}>
                    <TouchableOpacity onPress={prevAvatar} activeOpacity={0.8} style={[styles.pillBtn, { width: 44 * s, height: 44 * s, borderRadius: 12 * s }]}>
                      <Text style={styles.pillTxt}>{'<'}</Text>
                    </TouchableOpacity>

                    <Image
                      source={AVATARS[avatarIndex]}
                      style={{ width: 86 * s, height: 86 * s, borderRadius: 18 * s, backgroundColor: '#0E2233' }}
                      resizeMode="cover"
                    />

                    <TouchableOpacity onPress={nextAvatar} activeOpacity={0.8} style={[styles.pillBtn, { width: 44 * s, height: 44 * s, borderRadius: 12 * s }]}>
                      <Text style={styles.pillTxt}>{'>'}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ gap: 10 * s }}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={addPlayer}
                      disabled={!canAdd}
                      style={[
                        styles.cta,
                        { backgroundColor: canAdd ? '#C53857' : 'rgba(197,56,87,0.4)', height: 56 * s, borderRadius: 16 * s },
                      ]}
                    >
                      <Text style={[styles.ctaText, { fontSize: 16 * s }]}>ADD PLAYER</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={onStartGame}
                      disabled={!canStart}
                      style={[
                        styles.cta,
                        { backgroundColor: canStart ? '#38C558' : 'rgba(56,197,88,0.4)', height: 56 * s, borderRadius: 16 * s },
                      ]}
                    >
                      <Text style={[styles.ctaText, { fontSize: 16 * s }]}>Start game</Text>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    style={{ marginTop: 4 * s }}
                    data={players}
                    keyExtractor={item => item.id}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                      <Text style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 6 * s }}>
                        Add at least two players to start
                      </Text>
                    }
                    renderItem={({ item }) => (
                      <View
                        style={[
                          styles.playerRow,
                          { height: 64 * s, borderRadius: 14 * s, paddingHorizontal: 12 * s },
                        ]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 * s }}>
                          <Image
                            source={AVATARS[item.avatarIndex]}
                            style={{ width: 44 * s, height: 44 * s, borderRadius: 12 * s }}
                            resizeMode="cover"
                          />
                          <Text style={[styles.playerName, { fontSize: 16 * s }]} numberOfLines={1}>
                            {item.name}
                          </Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => removePlayer(item.id)}
                          style={[styles.delBtn, { width: 36 * s, height: 36 * s, borderRadius: 10 * s }]}
                          activeOpacity={0.9}
                        >
                          <Text style={{ color: '#fff', fontWeight: '800' }}>×</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                </View>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  bg: { flex: 1, width: '100%', height: '100%' },

  container: { 
    flex: 1, 
    alignItems: 'center',
  },

  headerCenterWrap: {
    width: '100%',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },


  card: {
    backgroundColor: '#001930',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  label: { color: '#FFFFFF', fontWeight: '700' },

  input: {
    color: '#FFFFFF',
    backgroundColor: '#0E2233',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  avatarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },

  pillBtn: { backgroundColor: '#193B55', alignItems: 'center', justifyContent: 'center' },
  pillTxt: { color: '#FFFFFF', fontWeight: '800', fontSize: 18 },

  cta: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  ctaText: { color: '#FFFFFF', fontWeight: '800' },

  playerRow: {
    backgroundColor: '#0E2233',
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
  },

  playerName: { color: '#FFFFFF', fontWeight: '700', maxWidth: 180 },

  delBtn: { backgroundColor: '#D9534F', alignItems: 'center', justifyContent: 'center' },

  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: Platform.OS === 'ios' ? 0.6 : 0.8,
    borderColor: 'rgba(255,255,255,0.35)',
  } as ViewStyle,

  fishImage: {
    position: 'absolute',
  } as ImageStyle,
});