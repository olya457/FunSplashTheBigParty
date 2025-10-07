import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, PermissionsAndroid, Platform } from 'react-native';
import TrackPlayer, { Capability, RepeatMode } from 'react-native-track-player';

type MusicCtx = { musicOn: boolean; toggle: () => void; setOn: (b: boolean) => void };
const Ctx = createContext<MusicCtx>({ musicOn: true, toggle() {}, setOn() {} });

let isPlayerSetup = false;
let setupInFlight: Promise<void> | null = null;
let isPlaying = false;

async function ensureNotifPermission() {
  if (Platform.OS === 'android' && (Platform.Version as number) >= 33) {
    try {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    } catch {}
  }
}

async function ensurePlayer() {
  if (isPlayerSetup) return;
  if (setupInFlight) return setupInFlight;

  setupInFlight = (async () => {
    try {
      await TrackPlayer.getQueue();
      isPlayerSetup = true;
      return;
    } catch {}

    await ensureNotifPermission();

    try {
      await TrackPlayer.setupPlayer();
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (msg.includes('already been initialized')) {
        isPlayerSetup = true;
      } else {
        setupInFlight = null;
        throw e;
      }
    }
    await TrackPlayer.updateOptions({
      capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
      compactCapabilities: [Capability.Play, Capability.Pause],
      progressUpdateEventInterval: 2,
    });
    const queue = await TrackPlayer.getQueue().catch(() => [] as any[]);
    if (!queue || queue.length === 0) {
      await TrackPlayer.add({
        id: 'bgm',
        url: require('../assets/bgm.mp3'),
        title: 'Background Theme',
        artist: 'Fun Splash',
      });
    }

    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
    isPlayerSetup = true;
  })();

  await setupInFlight;
}

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [musicOn, setMusicOn] = useState(true);
  const prevAppState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (musicOn) {
        await ensurePlayer();
        if (!cancelled) {
          try { await TrackPlayer.play(); isPlaying = true; } catch {}
        }
      } else {
        try { await TrackPlayer.pause(); } catch {}
        isPlaying = false;
      }
    })();

    return () => { cancelled = true; };
  }, [musicOn]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (next) => {
      const prev = prevAppState.current;
      prevAppState.current = next;

      if (prev === 'active' && (next === 'background' || next === 'inactive')) {
        try { await TrackPlayer.pause(); } catch {}
        isPlaying = false;
      }

      if (next === 'active' && musicOn) {
        await ensurePlayer();
        try { await TrackPlayer.play(); isPlaying = true; } catch {}
      }
    });

    return () => sub.remove();
  }, [musicOn]);

  return (
    <Ctx.Provider value={{ musicOn, toggle: () => setMusicOn(v => !v), setOn: setMusicOn }}>
      {children}
    </Ctx.Provider>
  );
};

export const useMusic = () => useContext(Ctx);
