import { create } from "zustand";
import type { AITheme } from "@/theme/themes";

export interface PortfolioState {
  /* Boot */
  booted: boolean;
  setBoot: (v: boolean) => void;

  /* Current section (e.g. "boot", "hero", "about", "skills", "projects", "contact") */
  currentSection: string;
  setSection: (id: string) => void;

  /* Active AI theme */
  currentTheme: AITheme["id"];
  setTheme: (id: AITheme["id"]) => void;

  /* Audio */
  audioEnabled: boolean;
  toggleAudio: () => void;

  /* Voice intro finished */
  speechDone: boolean;
  setSpeechDone: (v: boolean) => void;

  /* Scroll progress 0-1 */
  scrollProgress: number;
  setScrollProgress: (v: number) => void;

  /* Loading progress 0-100 */
  loadProgress: number;
  setLoadProgress: (v: number) => void;

  /* Reduced motion preference */
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
}

export const useStore = create<PortfolioState>((set) => ({
  booted: false,
  setBoot: (v) => set({ booted: v }),

  currentSection: "boot",
  setSection: (id) => set({ currentSection: id }),

  currentTheme: "jarvis",
  setTheme: (id) => set({ currentTheme: id }),

  audioEnabled: true,
  toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),

  speechDone: false,
  setSpeechDone: (v) => set({ speechDone: v }),

  scrollProgress: 0,
  setScrollProgress: (v) => set({ scrollProgress: v }),

  loadProgress: 0,
  setLoadProgress: (v) => set({ loadProgress: v }),

  reducedMotion: false,
  setReducedMotion: (v) => set({ reducedMotion: v }),
}));
