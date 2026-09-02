/**
 * Audio Beep Sound Synthesizer for Rulership POS Scanner
 * Plays a crisp 1800Hz POS scanner beep on successful barcode scan
 */

import { Vibration, Platform } from 'react-native';

export function playScanBeep() {
  try {
    // 1. Always trigger haptic vibration on mobile
    if (Platform.OS !== 'web') {
      Vibration.vibrate(60);
      return;
    }

    // 2. Web Audio API for Web browser
    if (typeof window !== 'undefined') {
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
    }
  } catch (e) {
    // Fallback guard
  }
}
