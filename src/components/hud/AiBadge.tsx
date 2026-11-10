import { useStore } from "@/store/useStore";
import { THEMES } from "@/theme/themes";
import GlitchText from "@/components/ui/GlitchText";

export default function AiBadge() {
  const themeId = useStore((s) => s.currentTheme);
  const theme = THEMES[themeId];

  return (
    <div className="flex items-center gap-2 hud-text text-[10px] tracking-widest select-none">
      {/* Pulse dot */}
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse-slow"
        style={{ background: "var(--accent)" }}
      />
      <GlitchText
        text={`${theme.label} ${theme.description}`}
        speed={20}
        scrambleDuration={300}
        key={themeId} /* re-trigger on theme change */
      />
    </div>
  );
}
