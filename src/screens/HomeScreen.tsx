import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  useWindowDimensions,
  ImageSourcePropType,
  SafeAreaView, 
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const BG: ImageSourcePropType = require('../assets/BACKGROUND.png');
const HEADER_IMG: ImageSourcePropType = require('../assets/image_h.png');

export default function HomeScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  
  const s = Math.max(0.8, Math.min(1, width / 390));

  const isShort = height < 750;

  const goStart = () => navigation.navigate('AddPlayer');
  const goRules = () => navigation.navigate('GameRules');
  const goSettings = () => navigation.navigate('Settings');
  const goInfo = () => navigation.navigate('Info');

  return (
    <View style={styles.wrap}>
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        <SafeAreaView style={styles.container}>
      
          <View style={styles.contentArea}>
  
            <Image
              source={HEADER_IMG}
              style={{
                width: 295 * s,
                height: 295 * s,
                borderRadius: 40 * s,
                overflow: 'hidden',
              }}
              resizeMode="cover"
            />

            <View style={[styles.buttonsArea, { 
                marginTop: 24 * s, 
                gap: 16 * s, 
            }]}>
           
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={goStart}
                style={[styles.btnBase, { width: 258 * s, height: 90 * s, borderRadius: 25 * s }]}
              >
                <Text style={[styles.btnText, { fontSize: Math.max(16, 18 * s) }]}>START PLAY</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={goRules}
                style={[styles.btnBase, { width: 258 * s, height: 90 * s, borderRadius: 25 * s }]}
              >
                <Text style={[styles.btnText, { fontSize: Math.max(16, 18 * s) }]}>GAME RULES</Text>
              </TouchableOpacity>
              <View style={[styles.row, { marginTop: 8 * s, gap: 20 * s }]}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={goSettings}
                  style={[styles.btnBase, { width: 120 * s, height: 90 * s, borderRadius: 25 * s }]}
                >
                  <Text style={[styles.btnText, { fontSize: Math.max(14, 16 * s) }]}>SETTINGS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={goInfo}
                  style={[styles.btnBase, { width: 120 * s, height: 90 * s, borderRadius: 25 * s }]}
                >
                  <Text style={[styles.btnText, { fontSize: Math.max(14, 16 * s) }]}>INFO</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
  },

  contentArea: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center', 
  },

  buttonsArea: {
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
  },

  btnBase: {
    backgroundColor: '#38C558',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  btnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});