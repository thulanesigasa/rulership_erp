/**
 * Audio Beep Sound Synthesizer for Rulership POS Scanner
 * Plays a crisp 1800Hz POS scanner beep on successful barcode scan
 */

export function playScanBeep() {
  try {
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // 1800Hz crisp POS Scanner pitch
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, ctx.currentTime);

        // Quick 150ms envelope
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    }
  } catch (e) {
    console.log('Scan beep audio trigger:', e);
  }
}
