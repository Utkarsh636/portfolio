import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { THEMES, SECTION_THEMES, themeToCSS } from "@/theme/themes";

/**
 * Watches the current section, resolves its AI theme, and smoothly interpolates
 * CSS variables on :root using GSAP (falls back to instant apply if GSAP
 * is not yet loaded).
 *
 * Also updates the Zustand currentTheme so other components can read it.
 */
export function useThemeTransition() {
  const currentSection = useStore((s) => s.currentSection);
  const setTheme = useStore((s) => s.setTheme);
  const prevRef = useRef<string | null>(null);

  useEffect(() => {
    const themeId = SECTION_THEMES[currentSection] ?? "jarvis";
    if (themeId === prevRef.current) return;
    prevRef.current = themeId;

    const theme = THEMES[themeId];
    setTheme(themeId);

    const vars = themeToCSS(theme);
    const root = document.documentElement;

    // Try GSAP colour lerp, fall back to instant
    import("gsap").then(({ gsap }) => {
      /* Build a from/to object for GSAP */
      const proxy: Record<string, string> = {};
      for (const key of Object.keys(vars)) {
        proxy[key] = getComputedStyle(root).getPropertyValue(key).trim() || vars[key];
      }

      gsap.to(proxy, {
        duration: 1.2,
        ease: "power2.inOut",
        ...vars,
        onUpdate() {
          for (const key of Object.keys(vars)) {
            root.style.setProperty(key, proxy[key]);
          }
        },
      });
    }).catch(() => {
      // Instant fallback
      for (const [key, val] of Object.entries(vars)) {
        root.style.setProperty(key, val);
      }
    });
  }, [currentSection, setTheme]);
}
