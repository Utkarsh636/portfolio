export interface AITheme {
  id: "jarvis" | "friday" | "vision" | "ultron";
  label: string;
  accent: string;
  accentRgb: string;
  bloom: number;
  glitch: number;
  particleColor: string;
  hudBorderAlpha: number;
  soundPitch: number;
  description: string;
}

export const THEMES: Record<string, AITheme> = {
  jarvis: {
    id: "jarvis",
    label: "J.A.R.V.I.S.",
    accent: "#00d4ff",
    accentRgb: "0, 212, 255",
    bloom: 0.6,
    glitch: 0,
    particleColor: "#00d4ff",
    hudBorderAlpha: 0.2,
    soundPitch: 1.0,
    description: "ONLINE",
  },
  friday: {
    id: "friday",
    label: "F.R.I.D.A.Y.",
    accent: "#ff9e2c",
    accentRgb: "255, 158, 44",
    bloom: 0.5,
    glitch: 0,
    particleColor: "#ff9e2c",
    hudBorderAlpha: 0.18,
    soundPitch: 1.15,
    description: "ACTIVE",
  },
  vision: {
    id: "vision",
    label: "V.I.S.I.O.N.",
    accent: "#ffd23f",
    accentRgb: "255, 210, 63",
    bloom: 0.7,
    glitch: 0,
    particleColor: "#ffd23f",
    hudBorderAlpha: 0.15,
    soundPitch: 0.9,
    description: "CONNECTED",
  },
  ultron: {
    id: "ultron",
    label: "U.L.T.R.O.N.",
    accent: "#ff1e2d",
    accentRgb: "255, 30, 45",
    bloom: 0.9,
    glitch: 0.6,
    particleColor: "#ff1e2d",
    hudBorderAlpha: 0.3,
    soundPitch: 0.75,
    description: "OVERRIDING",
  },
} as const;

/** Maps section IDs to which AI theme they use. */
export const SECTION_THEMES: Record<string, AITheme["id"]> = {
  boot: "jarvis",
  hero: "jarvis",
  about: "friday",
  skills: "vision",
  projects: "ultron",
  contact: "jarvis",
};

/** Returns CSS variable object to apply to :root for a given theme. */
export function themeToCSS(theme: AITheme): Record<string, string> {
  return {
    "--accent": theme.accent,
    "--accent-rgb": theme.accentRgb,
    "--accent-dim": `rgba(${theme.accentRgb}, 0.12)`,
    "--accent-glow": `rgba(${theme.accentRgb}, 0.35)`,
    "--bloom-intensity": String(theme.bloom),
    "--glitch-amount": String(theme.glitch),
    "--hud-border": `rgba(${theme.accentRgb}, ${theme.hudBorderAlpha})`,
  };
}
