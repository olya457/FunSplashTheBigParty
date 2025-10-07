import { NativeModules } from 'react-native';

type MusicModule = {
  start: () => void | Promise<void>;
  stop: () => void | Promise<void>;
};

const Native: Partial<MusicModule> = NativeModules.Music ?? {};

export const Music: MusicModule = {
  start: () => {
    try {
      return Native.start?.() as any;
    } catch {}
  },
  stop: () => {
    try {
      return Native.stop?.() as any;
    } catch {}
  },
};
