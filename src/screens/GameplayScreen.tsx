import React, { useMemo, useRef, useState, useEffect } from 'react';
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
  Animated,
  Easing,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

const BG: ImageSourcePropType = require('../assets/BACKGROUND.png');
const FRAME: ImageSourcePropType = require('../assets/bottom_picture.png');
const HOOK_GREEN: ImageSourcePropType = require('../assets/hook_green.png');

const AVATARS: ImageSourcePropType[] = [
  require('../assets/player_male.png'),
  require('../assets/player_female.png'),
];

const CATCH_RING_YELLOW: ImageSourcePropType = require('../assets/catch_ring_yellow.png');
const CATCH_CHEST: ImageSourcePropType       = require('../assets/catch_chest.png');
const CATCH_FISH: ImageSourcePropType        = require('../assets/catch_fish.png');
const CATCH_GOLDFISH: ImageSourcePropType    = require('../assets/catch_goldfish.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Gameplay'>;
type Player = { id: string; name: string; avatarIndex: number };
type CatchKind = 'ring' | 'chest' | 'fish' | 'goldfish';

const CATCH_IMG: Record<CatchKind, ImageSourcePropType> = {
  ring: CATCH_RING_YELLOW,
  chest: CATCH_CHEST,
  fish: CATCH_FISH,
  goldfish: CATCH_GOLDFISH,
};

const TASKS_STUFF = [
  'Tell a funny story from your childhood.',
  'Show three things in your room that remind you of summer.',
  'Sing any song as if you were fishing.',
  'Name three things you would take with you to a deserted island.',
  'Use any object nearby and come up with a new purpose for it.',
  'Compliment every friend in the room.',
  'Tell a joke or a pun.',
  'Pretend you are a professional TV presenter and interview your neighbor.',
  'Imitate the sound of a fish jumping out of the water.',
  'Come up with a new name for this game.',
];
const TASKS_FISH = [
  'Show with your hands what a giant fish would look like.',
  'Do a “fish dance”.',
  'Say a phrase with a fishing accent.',
  'Imitate a fisherman hauling in a huge catch.',
  'Name three types of fish in 5 seconds.',
  'Make up a joke about fish.',
  'Sing the word “fish” 5 times to different tunes.',
  'Invent a new type of fish and describe it.',
  'Show what you would look like if you were a fish.',
  'Take a selfie with a fish face.',
];
const TASKS_RING = [
  'Jump in place 5 times as if you were in water.',
  'Make a “drowning doll” face.',
  'Show how you would float with a circle on the waves.',
  'Name 3 summer drinks in 5 seconds.',
  'Show how you would look on the beach.',
  'Come up with a new shape for a circle (pizza? cat?).',
  'Imitate the sound of waves.',
  'Say any word adding “-slap” at the end.',
  'Stand up and do breaststroke moves.',
  'Imagine you are a circle and let someone “put” you on.',
];
const GOLD_MSG = 'Make a wish for all the players!';

const randOf = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

type Bubble = {
  key: string;
  size: number;
  startX: number;
  drift: number;
  delay: number;
  duration: number;
  progress: Animated.Value;
};

export default function GameplayScreen({ navigation, route }: Props) {
  const players: Player[] = route.params?.players ?? [];
  const { width, height } = useWindowDimensions();

  const sW = Math.max(0.82, Math.min(1, width / 390));
  const sH = Math.max(0.82, Math.min(1, height / 844));
  const s = Math.min(sW, sH);

  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState<'throw' | 'caught' | 'results'>('throw');
  const [caught, setCaught] = useState<CatchKind | null>(null);
  const [taskText, setTaskText] = useState('');
  const [score, setScore] = useState<{ ring: number; fish: number; chest: number; goldfish: number }>({
    ring: 0, fish: 0, chest: 0, goldfish: 0,
  });

  const current = players.length ? players[turn % players.length] : null;

  const press = useRef(new Animated.Value(0)).current;
  const hookScale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] });
  const onHookPress = () => {
    Animated.sequence([
      Animated.timing(press, { toValue: 1, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(press, { toValue: 0, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start(() => doCatch());
  };

  const pickCatch = (): CatchKind => {
    const moveNo = turn + 1;
    const base: CatchKind[] = ['ring', 'fish', 'chest'];
    if (moveNo >= 5 && Math.random() < 0.2) return 'goldfish';
    return randOf(base);
  };

  const doCatch = () => {
    const kind = pickCatch();
    setCaught(kind);
    setTaskText(
      kind === 'goldfish' ? GOLD_MSG :
      kind === 'ring' ? randOf(TASKS_RING) :
      kind === 'fish' ? randOf(TASKS_FISH) :
      randOf(TASKS_STUFF)
    );
    setScore(prev => ({ ...prev, [kind]: prev[kind] + 1 } as any));
    setPhase('caught');
  };

  const nextPlayer = () => {
    if (caught === 'goldfish') { setPhase('results'); return; }
    setTurn(t => t + 1);
    setPhase('throw');
  };

  const restartGame = () => {
    setScore({ ring: 0, fish: 0, chest: 0, goldfish: 0 });
    setTurn(0);
    setCaught(null);
    setTaskText('');
    setPhase('throw');
  };

  const shareResults = async () => {
    const text = `Game results:\n🟠 Ring: ${score.ring}\n🐟 Fish: ${score.fish}\n🟥 Chest: ${score.chest}\n✨ Goldfish: ${score.goldfish}`;
    try { await Share.share({ message: text }); } catch {}
  };

  const FRAME_W = 370 * s;
  const FRAME_H = 320 * s;
  const FRAME_H_THROW = FRAME_H + 20 * s;

  const phaseFade = useRef(new Animated.Value(0)).current;
  const phaseSlide = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    phaseFade.setValue(0);
    phaseSlide.setValue(14);
    Animated.parallel([
      Animated.timing(phaseFade, { toValue: 1, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(phaseSlide, { toValue: 0, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [phase, phaseFade, phaseSlide]);

  const bubbles = useMemo<Bubble[]>(() => {
    const N = 16; const arr: Bubble[] = [];
    for (let i = 0; i < N; i++) {
      const size = 6 + Math.random() * 18;
      const startX = Math.random() * width;
      const drift = Math.random() * 36 - 18;
      const delay = Math.random() * 1600;
      const duration = 3200 + Math.random() * 2600;
      arr.push({ key: `gb${i}`, size, startX, drift, delay, duration, progress: new Animated.Value(0) });
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

  if (!players.length) {
    return (
      <View style={styles.wrap}>
        <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
          {renderBubbles()}
          <View style={[styles.center, { paddingTop: 80 * s }]}>
            <Text style={{ color: '#fff', fontSize: 18 * s, textAlign: 'center', padding: 16 * s }}>
              Add at least two players first.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddPlayer')}
              style={[styles.btnGreen, { width: 220 * s, height: 56 * s }]}
            >
              <Text style={styles.btnGreenText}>Add players</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        {renderBubbles()}

        <Animated.View style={{ flex: 1, alignItems: 'center', opacity: phaseFade, transform: [{ translateY: phaseSlide }] }}>
          {phase === 'throw' && current && (
            <View style={{ alignItems: 'center', width: '100%', paddingTop: 80 * s }}>
              <ImageBackground
                source={FRAME}
                style={[
                  styles.frame,
                  {
                    width: FRAME_W,
                    height: FRAME_H_THROW,
                    paddingTop: 38 * s,
                    paddingHorizontal: 22 * s,
                  },
                ]}
                resizeMode="contain"
              >
                <View style={{ width: '100%', alignItems: 'center', transform: [{ translateY: -10 }] }}>
                  <Text style={[styles.throwText, { fontSize: 26 * s, lineHeight: 30 * s }]} numberOfLines={1}>
                    {current.name}
                  </Text>
                  <Text style={[styles.throwText, { fontSize: 22 * s, lineHeight: 26 * s }]}>is</Text>
                  <Text style={[styles.throwText, { fontSize: 26 * s, lineHeight: 30 * s }]}>throwing up!</Text>

                  <Image
                    source={AVATARS[current.avatarIndex]}
                    style={{ width: 120 * s, height: 120 * s, borderRadius: 24 * s, marginTop: 12 * s }}
                    resizeMode="cover"
                  />
                </View>
              </ImageBackground>

              <Animated.View style={{ transform: [{ scale: hookScale }], marginTop: 20 * s }}>
                <TouchableOpacity activeOpacity={0.9} onPress={onHookPress}>
                  <Image source={HOOK_GREEN} style={{ width: 280 * s, height: 280 * s }} resizeMode="contain" />
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}

          {phase === 'caught' && caught && (
            <View style={{ alignItems: 'center', width: '100%', paddingTop: 80 * s }}>
              <ImageBackground
                source={FRAME}
                style={[styles.frame, { width: FRAME_W, height: FRAME_H, alignItems: 'center', paddingTop: 20 * s }]}
                resizeMode="contain"
              >
                <Text style={[styles.catchTitle, { fontSize: 26 * s }]}>Catch:</Text>
                <Image
                  source={CATCH_IMG[caught]}
                  style={{ width: 200 * s, height: 160 * s, marginTop: 8 * s }}
                  resizeMode="contain"
                />
              </ImageBackground>

              <View
                style={[
                  styles.taskBox,
                  { width: 330 * s, minHeight: 110 * s, borderRadius: 16 * s, padding: 16 * s, marginTop: 14 * s },
                ]}
              >
                <Text style={[styles.taskLabel, { fontSize: 20 * s, marginBottom: 6 * s }]}>Task:</Text>
                <Text style={[styles.taskText, { fontSize: 18 * s, lineHeight: 24 * s }]}>{taskText}</Text>
              </View>

              <TouchableOpacity
                onPress={caught === 'goldfish' ? () => setPhase('results') : nextPlayer}
                activeOpacity={0.9}
                style={[styles.btnGreen, { width: 300 * s, height: 64 * s, marginTop: 16 * s }]}
              >
                <Text style={styles.btnGreenText}>{caught === 'goldfish' ? 'END THE GAME' : 'Next player'}</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 14 * s, marginTop: 10 * s }}>
                <TouchableOpacity
                  onPress={() => navigation.replace('Home')}
                  style={[styles.btnSecondary, { width: 150 * s, height: 48 * s }]}
                >
                  <Text style={styles.btnSecondaryText}>Back home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPhase('results')}
                  style={[styles.btnRed, { width: 150 * s, height: 48 * s }]}
                >
                  <Text style={styles.btnRedText}>End the game</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {phase === 'results' && (
            <View style={{ alignItems: 'center', width: '100%', paddingTop: 120 }}>
              <View
                style={[
                  styles.resultsCard,
                  { width: 330 * s, padding: 18 * s, borderRadius: 18 * s, marginTop: 10 * s },
                ]}
              >
                <Text style={[styles.resultsTitle, { fontSize: 28 * s, marginBottom: 14 * s }]}>Game results</Text>

                <View style={[styles.row, { marginBottom: 10 * s }]}>
                  <View style={styles.resultsLine}>
                    <Image source={CATCH_RING_YELLOW} style={{ width: 28 * s, height: 28 * s }} />
                    <Text style={styles.resultsText}>{score.ring}</Text>
                  </View>
                  <View style={styles.resultsLine}>
                    <Image source={CATCH_FISH} style={{ width: 28 * s, height: 28 * s }} />
                    <Text style={styles.resultsText}>{score.fish}</Text>
                  </View>
                  <View style={styles.resultsLine}>
                    <Image source={CATCH_CHEST} style={{ width: 28 * s, height: 28 * s }} />
                    <Text style={styles.resultsText}>{score.chest}</Text>
                  </View>
                  <View style={styles.resultsLine}>
                    <Image source={CATCH_GOLDFISH} style={{ width: 28 * s, height: 28 * s }} />
                    <Text style={styles.resultsText}>{score.goldfish}</Text>
                  </View>
                </View>

                {score.goldfish > 0 && (
                  <View style={[styles.goldRow, { borderRadius: 12 * s, padding: 10 * s }]}>
                    <Image source={CATCH_GOLDFISH} style={{ width: 36 * s, height: 36 * s }} />
                    <Text style={styles.goldText}>
                      {players[(turn % players.length)]?.name || 'Someone'} caught a goldfish
                    </Text>
                  </View>
                )}

                <View style={{ alignItems: 'center', marginTop: 16 * s }}>
                  <TouchableOpacity
                    onPress={restartGame}
                    activeOpacity={0.9}
                    style={[styles.btnGreen, { width: 260 * s, height: 60 * s }]}
                  >
                    <Text style={styles.btnGreenText}>Restart game</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={shareResults}
                    activeOpacity={0.9}
                    style={[styles.btnSecondary, { width: 220 * s, height: 50 * s, marginTop: 12 * s }]}
                  >
                    <Text style={styles.btnSecondaryText}>Share results</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.replace('Home')}
                    activeOpacity={0.9}
                    style={[styles.btnSecondary, { width: 200 * s, height: 48 * s, marginTop: 12 * s }]}
                  >
                    <Text style={styles.btnSecondaryText}>Back home</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  bg: { flex: 1, width: '100%', height: '100%' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  frame: { alignItems: 'center', justifyContent: 'center' },

  throwText: { color: '#FFFFFF', fontWeight: '800', textAlign: 'center' },
  catchTitle: { color: '#FFFFFF', fontWeight: '800', textAlign: 'center' },

  taskBox: { backgroundColor: '#0B2438' },
  taskLabel: { color: '#FFFFFF', fontWeight: '800' },
  taskText: { color: '#FFFFFF' },

  btnGreen: {
    backgroundColor: '#38C558',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  btnGreenText: { color: '#FFFFFF', fontWeight: '800', fontSize: 18 },

  btnSecondary: {
    backgroundColor: '#4D5B94',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingHorizontal: 16,
  },
  btnSecondaryText: { color: '#FFFFFF', fontWeight: '700' },

  btnRed: {
    backgroundColor: '#C53857',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingHorizontal: 16,
  },
  btnRedText: { color: '#FFFFFF', fontWeight: '700' },

  resultsCard: { backgroundColor: '#0D3152' },
  resultsTitle: { color: '#FFFFFF', fontWeight: '800', textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  resultsLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resultsText: { color: '#FFFFFF', fontWeight: '800', fontSize: 18 },
  goldRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#0B2438' },
  goldText: { color: '#FFFFFF', fontWeight: '700' },

  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: Platform.OS === 'ios' ? 0.5 : 0.8,
    borderColor: 'rgba(255,255,255,0.35)',
  },
});
