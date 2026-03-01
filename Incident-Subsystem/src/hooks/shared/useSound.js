import { useCallback } from 'react';

export const useSound = () => {
  const playFeedback = useCallback(async (type = 'light') => {
    try {
      // Initialize Context
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContextClass();

      if (context.state === 'suspended') {
        await context.resume();
      }

      const now = context.currentTime;
      const masterGain = context.createGain();
      masterGain.connect(context.destination);
      
      // Notify volume is higher
      masterGain.gain.setValueAtTime(type === 'notify' ? 0.8 : 0.2, now);

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
        // High-pitched double beep
        createTone(880, now, 0.3, 0.5, 'triangle');
        createTone(1100, now + 0.15, 0.4, 0.5, 'triangle');
      } 
      else if (type === 'success') {
        createTone(440, now, 0.2, 0.1);
        createTone(880, now + 0.1, 0.3, 0.1);
      } 
      else if (type === 'error') {
        createTone(150, now, 0.4, 0.2, 'sawtooth');
      } 
      else {
        createTone(600, now, 0.1, 0.05);
      }

    } catch (e) {
      console.warn("Audio Context could not start. User interaction might be required.", e);
    }
  }, []);

  return { playFeedback };
};