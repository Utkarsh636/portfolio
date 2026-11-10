import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { getAudioContext } from "@/hooks/useSound";

/**
 * Plays the JARVIS AI voice intro (MP3) once after boot.
 *
 * Uses the Web Audio API (same AudioContext already unlocked by
 * playSound("boot") during the boot-button click) so it works
 * even after long setTimeout chains that lose the user-gesture
 * context needed by HTMLAudioElement.play().
 *
 * Sets `speechDone` in store when audio finishes so the particle
 * hologram shrinks into the reactor.
 */
export function useVoiceIntro() {
  const booted = useStore((s) => s.booted);
  const audioEnabled = useStore((s) => s.audioEnabled);
  const setSpeechDone = useStore((s) => s.setSpeechDone);
  const hasPlayed = useRef(false);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (!booted || hasPlayed.current) return;
    hasPlayed.current = true;

    // If audio disabled, show particle portrait for 6s then shrink
    if (!audioEnabled) {
      const t = setTimeout(() => setSpeechDone(true), 6000);
      return () => clearTimeout(t);
    }

    let cancelled = false;

    // Small delay so boot exit animation settles
    const delay = setTimeout(async () => {
      try {
        const ac = getAudioContext();
        // Resume in case it's suspended (should already be unlocked by boot sounds)
        if (ac.state === "suspended") await ac.resume();

        // Fetch and decode the MP3
        const resp = await fetch("/assets/jarvis-intro.mp3");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const arrayBuffer = await resp.arrayBuffer();
        const audioBuffer = await ac.decodeAudioData(arrayBuffer);

        if (cancelled) return;

        // Play through AudioContext (bypasses autoplay restrictions)
        const source = ac.createBufferSource();
        source.buffer = audioBuffer;

        // Add slight gain control
        const gain = ac.createGain();
        gain.gain.value = 0.85;
        source.connect(gain).connect(ac.destination);

        source.onended = () => {
          if (!cancelled) setSpeechDone(true);
        };

        sourceRef.current = source;
        source.start();
      } catch (err) {
        console.warn("Voice intro failed, falling back to timer:", err);
        if (!cancelled) {
          setTimeout(() => setSpeechDone(true), 5000);
        }
      }
    }, 800);

    return () => {
      cancelled = true;
      clearTimeout(delay);
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch { /* already stopped */ }
        sourceRef.current = null;
      }
    };
  }, [booted, audioEnabled, setSpeechDone]);
}
