import { useCallback, useRef } from "react";
import { useStore } from "@/store/useStore";

/**
 * Provides tiny synthesised UI sounds using the Web Audio API.
 * No external audio files needed — everything is generated on-the-fly.
 */

let ctx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/** Expose the shared AudioContext so the voice intro can play through it */
export function getAudioContext(): AudioContext {
  return getCtx();
}

type SoundName = "click" | "hover" | "boot" | "whoosh" | "transition" | "type" | "success";

function playRaw(name: SoundName) {
  try {
    const ac = getCtx();
    if (ac.state === "suspended") ac.resume();
    const now = ac.currentTime;

    switch (name) {
      case "click": {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain).connect(ac.destination);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case "hover": {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.06);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain).connect(ac.destination);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }
      case "boot": {
        // Rising sweep
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(2000, now + 1.5);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
        osc.connect(gain).connect(ac.destination);
        osc.start(now);
        osc.stop(now + 2);
        break;
      }
      case "whoosh": {
        // Filtered noise burst
        const bufferSize = ac.sampleRate * 0.3;
        const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const source = ac.createBufferSource();
        source.buffer = buffer;
        const filter = ac.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        filter.Q.value = 2;
        const gain = ac.createGain();
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        source.connect(filter).connect(gain).connect(ac.destination);
        source.start(now);
        break;
      }
      case "transition": {
        // Two-tone chime
        [800, 1200].forEach((freq, i) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.05, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
          osc.connect(gain).connect(ac.destination);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.3);
        });
        break;
      }
      case "type": {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = "square";
        osc.frequency.value = 400 + Math.random() * 200;
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.connect(gain).connect(ac.destination);
        osc.start(now);
        osc.stop(now + 0.03);
        break;
      }
      case "success": {
        [523, 659, 784].forEach((freq, i) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.06, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
          osc.connect(gain).connect(ac.destination);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.4);
        });
        break;
      }
    }
  } catch {
    // Audio errors are non-critical
  }
}

export function useSound() {
  const audioEnabledRef = useRef(useStore.getState().audioEnabled);

  // Keep ref in sync
  useStore.subscribe((state) => {
    audioEnabledRef.current = state.audioEnabled;
  });

  const play = useCallback((name: SoundName) => {
    if (audioEnabledRef.current) playRaw(name);
  }, []);

  return { play };
}

/** Direct imperative play — checks store.audioEnabled itself */
export function playSound(name: SoundName) {
  if (useStore.getState().audioEnabled) playRaw(name);
}
