declare module 'voicemeeter-remote' {
  const voicemeeter: {
    init: () => Promise<void>;
    login: () => void;
    logout: () => void;
    setStripMute: (stripIndex: number, mute: boolean) => void;
    getStripMute: (stripIndex: number) => boolean;
    setStripVolume: (stripIndex: number, volume: number) => void;
    getStripVolume: (stripIndex: number) => number;
  };
  export default voicemeeter;
}
