import { useStore } from "@/store/useStore";
import { playSound } from "@/hooks/useSound";
import AiBadge from "./AiBadge";
import SystemClock from "./SystemClock";
import NavDots from "./NavDots";
import CursorReticle from "./CursorReticle";

const NAV_LINKS = [
  { id: "hero", label: "HOME" },
  { id: "about", label: "ABOUT" },
  { id: "skills", label: "SKILLS" },
  { id: "projects", label: "PROJECTS" },
  { id: "contact", label: "CONTACT" },
];

/**
 * Persistent HUD overlay with recruiter-friendly navigation bar,
 * corner brackets, side nav dots, scanline overlay, and cursor.
 */
export default function HudOverlay() {
  const booted = useStore((s) => s.booted);
  const audioEnabled = useStore((s) => s.audioEnabled);
  const toggleAudio = useStore((s) => s.toggleAudio);
  const scrollProgress = useStore((s) => s.scrollProgress);
  const currentSection = useStore((s) => s.currentSection);

  if (!booted) return <CursorReticle />;

  const handleNavClick = (id: string) => {
    playSound("click");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <CursorReticle />

      {/* ── Scanlines (only visible when ultron glitch > 0) ── */}
      <div className="scanlines" />

      {/* ── Top Navigation Bar (compact) ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-1.5"
        style={{
          background: "linear-gradient(180deg, rgba(5,5,8,0.9) 0%, rgba(5,5,8,0.5) 80%, transparent 100%)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(0,212,255,0.06)",
        }}
      >
        {/* Left: Logo / badge */}
        <div className="flex items-center gap-2 pointer-events-none shrink-0">
          <AiBadge />
        </div>

        {/* Center: Navigation links */}
        <nav className="flex items-center gap-0">
          {NAV_LINKS.map((link) => {
            const active = currentSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                onMouseEnter={() => playSound("hover")}
                className="relative px-3 py-1.5 font-mono text-[9px] tracking-[0.15em] transition-all duration-300 group"
                style={{
                  color: active ? "var(--accent, #00d4ff)" : "rgba(224,228,240,0.4)",
                  textShadow: active ? "0 0 8px var(--accent-glow, rgba(0,212,255,0.4))" : "none",
                }}
              >
                {link.label}
                {/* Active indicator line */}
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px transition-all duration-300"
                  style={{
                    width: active ? "70%" : "0%",
                    background: "linear-gradient(90deg, transparent, var(--accent, #00d4ff), transparent)",
                    boxShadow: active ? "0 0 4px var(--accent-glow, rgba(0,212,255,0.3))" : "none",
                  }}
                />
                {/* Hover glow */}
                <span
                  className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "rgba(0,212,255,0.03)",
                    border: "1px solid rgba(0,212,255,0.06)",
                  }}
                />
              </button>
            );
          })}
        </nav>

        {/* Right: Telemetry + controls */}
        <div className="flex items-center gap-4">
          {/* Scroll % */}
          <span className="hud-text text-[10px] opacity-40 tabular-nums select-none pointer-events-none">
            {Math.round(scrollProgress * 100)
              .toString()
              .padStart(3, "0")}
            %
          </span>

          <SystemClock />

          {/* Audio toggle */}
          <button
            onClick={toggleAudio}
            className="hud-text text-[10px] opacity-50 hover:opacity-100 transition-opacity"
            aria-label={audioEnabled ? "Mute audio" : "Enable audio"}
          >
            {audioEnabled ? "SND:ON" : "SND:OFF"}
          </button>

          {/* Resume / GitHub quick links */}
          <a
            href="https://github.com/utkarsh-sharma-017"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[9px] tracking-wider opacity-40 hover:opacity-90 transition-opacity"
            style={{ color: "#00d4ff" }}
            onMouseEnter={() => playSound("hover")}
          >
            GITHUB
          </a>
        </div>
      </header>

      {/* ── Scroll Progress Bar ── */}
      <div className="fixed top-0 left-0 w-full h-px z-[51]">
        <div
          className="h-full transition-[width] duration-100"
          style={{
            width: `${scrollProgress * 100}%`,
            background: "linear-gradient(90deg, var(--accent), transparent)",
          }}
        />
      </div>

      {/* ── Side Nav Dots ── */}
      <NavDots />

      {/* ── Corner Brackets (viewport) ── */}
      <div className="fixed inset-3 pointer-events-none z-40">
        <span className="corner-bracket corner-tl" />
        <span className="corner-bracket corner-tr" />
        <span className="corner-bracket corner-bl" />
        <span className="corner-bracket corner-br" />
      </div>

      {/* ── Decorative Scanning Line ── */}
      <div
        className="fixed left-0 w-full h-px pointer-events-none z-40 animate-scan-line opacity-20"
        style={{ background: "var(--accent)" }}
      />

      {/* ── Thin Side Lines ── */}
      <div
        className="fixed top-12 bottom-12 left-3 w-px pointer-events-none z-40 opacity-[0.08]"
        style={{ background: "var(--accent)" }}
      />
      <div
        className="fixed top-12 bottom-12 right-3 w-px pointer-events-none z-40 opacity-[0.08]"
        style={{ background: "var(--accent)" }}
      />
    </>
  );
}
