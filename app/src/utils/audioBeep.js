/**
 * Audio Beep Sound Synthesizer for Rulership POS Scanner
 * Plays a crisp 1800Hz POS scanner beep on successful barcode scan
 */

import { Vibration, Platform } from 'react-native';

export async function playScanBeep() {
  try {
    // 1. Always trigger haptic vibration on mobile
    if (Platform.OS !== 'web') {
      Vibration.vibrate(60);
    }

    // 2. Web Audio API for Web browser
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, ctx.currentTime);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } else {
      // 3. Try expo-av safely if native module exists in the client build
      try {
        const { Audio } = require('expo-av');
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/beep.mp3')
        );
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status?.didJustFinish) {
            sound.unloadAsync();
          }
        });
      } catch (audioErr) {
        // ExponentAV native module not present in this Expo Go binary — vibration already handled
      }
    }
  } catch (e) {
    // Fallback guard
  }
}
