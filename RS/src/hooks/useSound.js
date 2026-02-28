// src/hooks/useSound.js
import { useCallback } from 'react';

export const useSound = () => {
  const playFeedback = useCallback((type = 'light') => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const now = context.currentTime;
      const masterGain = context.createGain();
      masterGain.connect(context.destination);
      masterGain.gain.setValueAtTime(type === 'notify' ? 4.0 : 1.0, now);

      const createTone = (freq, start, duration, vol, toneType = 'sine') => {
        const osc = context.createOscillator();
        const g = context.createGain();
        osc.type = toneType;
        osc.frequency.setValueAtTime(freq, start);
        g.gain.setValueAtTime(vol, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(start);
        osc.stop(start + duration);
      };

      if (type === 'notify') {
        // Extra-loud alert pair for incoming verification notifications
        createTone(880, now, 0.3, 1.0, 'triangle');
        createTone(1100, now + 0.08, 0.3, 1.0, 'triangle');
      } 
      else if (type === 'success') {
        // "Victory" upward slide
        createTone(440, now, 0.3, 0.1);
        createTone(880, now + 0.1, 0.4, 0.1);
      } 
      else if (type === 'error') {
        createTone(150, now, 0.3, 0.1); // Low thud
      } 
      else {
        // Standard "Pop"
        createTone(600, now, 0.1, 0.05);
      }

    } catch (e) {
      console.log("Audio Error:", e);
    }
  }, []);

  return { playFeedback };
};
