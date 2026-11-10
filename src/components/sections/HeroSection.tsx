import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { profile } from "@/data/profile";
import { skills, concepts } from "@/data/skills";
import { projects } from "@/data/projects";
import GlitchText from "@/components/ui/GlitchText";
import ArcReactorHUD from "@/components/ui/ArcReactorHUD";
import { playSound } from "@/hooks/useSound";

/* ─── Reusable 3D HUD Panel wrapper ─── */
function HoloPanel({
  children,
  className = "",
  delay = 0,
  side = "left",
  floatOffset = 0,
  panelId,
  expandedId,
  onExpand,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  side?: "left" | "right" | "center";
  floatOffset?: number;
  panelId?: string;
  expandedId?: string | null;
  onExpand?: (id: string | null) => void;
  style?: React.CSSProperties;
}) {
  const tiltY = side === "left" ? 8 : side === "right" ? -8 : 0;
  const tiltX = side === "center" ? 0 : 2;
  const floatAmt = 5 + floatOffset * 2;
  const floatDur = 3.5 + floatOffset * 0.6;
  const isExpanded = panelId != null && expandedId === panelId;

  const handleClick = useCallback(() => {
    if (!panelId || !onExpand) return;
    playSound("click");
    onExpand(isExpanded ? null : panelId);
  }, [panelId, onExpand, isExpanded]);

  return (
    /* Outer wrapper: continuous floating bob */
    <motion.div
      animate={{ y: [0, -floatAmt, 0], rotateX: [tiltX, tiltX + 0.5, tiltX] }}
      transition={{ duration: floatDur, repeat: Infinity, ease: "easeInOut" }}
      style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
    >
      {/* Inner panel: entrance animation + persistent 3D tilt */}
      <motion.div
        layout
        layoutId={panelId}
        initial={{
          opacity: 0,
          scale: 0.8,
          rotateY: tiltY * 2.5,
          rotateX: tiltX + 4,
          x: side === "left" ? -60 : side === "right" ? 60 : 0,
          z: -50,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          rotateY: isExpanded ? 0 : tiltY,
          rotateX: isExpanded ? 0 : tiltX,
          x: 0,
          z: 0,
        }}
        transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
        onClick={handleClick}
        className={`relative overflow-hidden rounded-sm ${panelId ? "cursor-pointer" : ""} ${className}`}
        style={{
          background: "rgba(var(--accent-rgb, 0,212,255), 0.03)",
          border: "1px solid rgba(var(--accent-rgb, 0,212,255), 0.12)",
          backdropFilter: "blur(8px)",
          transformStyle: "preserve-3d",
          boxShadow: side === "left"
            ? "4px 2px 24px rgba(var(--accent-rgb, 0,212,255), 0.06), inset -1px 0 12px rgba(var(--accent-rgb, 0,212,255), 0.02)"
            : side === "right"
              ? "-4px 2px 24px rgba(var(--accent-rgb, 0,212,255), 0.06), inset 1px 0 12px rgba(var(--accent-rgb, 0,212,255), 0.02)"
              : "0 2px 24px rgba(var(--accent-rgb, 0,212,255), 0.06)",
          ...style,
        }}
        whileHover={panelId ? { scale: 1.02, borderColor: "rgba(var(--accent-rgb, 0,212,255), 0.25)" } : undefined}
      >
        {/* Top glow */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(var(--accent-rgb, 0,212,255), 0.4), transparent)" }}
        />
        {/* Bottom glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(var(--accent-rgb, 0,212,255), 0.1), transparent)" }}
        />
        {/* Scan line */}
        <motion.div
          className="absolute left-0 w-full h-px pointer-events-none z-10"
          style={{ background: "rgba(0,212,255,0.12)" }}
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
        />
        {/* Edge glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: side === "left"
              ? "linear-gradient(90deg, transparent 60%, rgba(var(--accent-rgb, 0,212,255), 0.04) 100%)"
              : side === "right"
                ? "linear-gradient(-90deg, transparent 60%, rgba(var(--accent-rgb, 0,212,255), 0.04) 100%)"
                : "none",
          }}
        />
        {/* Expand hint */}
        {panelId && (
          <span className="absolute top-1.5 right-2 font-mono text-[7px] opacity-20 z-20" style={{ color: "var(--accent, #00d4ff)" }}>
            {isExpanded ? "[ — ]" : "[ + ]"}
          </span>
        )}
        {/* Corner brackets */}
        <span className="corner-bracket corner-tl" style={{ width: 10, height: 10 }} />
        <span className="corner-bracket corner-tr" style={{ width: 10, height: 10 }} />
        <span className="corner-bracket corner-bl" style={{ width: 10, height: 10 }} />
        <span className="corner-bracket corner-br" style={{ width: 10, height: 10 }} />
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ─── Decorative connecting line from panel to reactor ─── */
function ConnectionLine({ side, top, delay: d }: { side: "left" | "right"; top: string; delay: number }) {
  return (
    <motion.div
      className="absolute hidden md:block pointer-events-none z-0"
      style={{
        top,
        [side === "left" ? "left" : "right"]: "33%",
        width: "6%",
        height: "1px",
      }}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ duration: 0.8, delay: d, ease: "easeOut" }}
    >
      <div
        className="w-full h-full"
        style={{
          background: side === "left"
            ? "linear-gradient(90deg, rgba(var(--accent-rgb, 0,212,255), 0.15), rgba(var(--accent-rgb, 0,212,255), 0.02))"
            : "linear-gradient(-90deg, rgba(var(--accent-rgb, 0,212,255), 0.15), rgba(var(--accent-rgb, 0,212,255), 0.02))",
          transformOrigin: side === "left" ? "left" : "right",
        }}
      />
      {/* Endpoint dot */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
        style={{
          [side === "left" ? "left" : "right"]: 0,
          background: "var(--accent, #00d4ff)",
          boxShadow: "0 0 4px rgba(var(--accent-rgb, 0,212,255), 0.4)",
        }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
}

/* ─── Data readout strip (horizontal telemetry) ─── */
function DataStrip({ items, delay: d }: { items: string[]; delay: number }) {
  return (
    <motion.div
      className="flex items-center gap-3 px-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: d, duration: 1 }}
    >
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <motion.span
            className="w-1 h-1 rounded-full"
            style={{ background: "var(--accent, #00d4ff)" }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
          <span className="font-mono text-[7px] tracking-wider opacity-25" style={{ color: "var(--accent, #00d4ff)" }}>
            {item}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

/* ─── Hexagonal grid decoration ─── */
function HexGrid() {
  const hexes = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2;
    const r = 48;
    return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r };
  });
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="absolute w-full h-full pointer-events-none opacity-[0.04]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.04 }}
      transition={{ delay: 2, duration: 2 }}
    >
      <polygon
        points={hexes.map((h) => `${h.x},${h.y}`).join(" ")}
        fill="none"
        stroke="var(--accent, #00d4ff)"
        strokeWidth="0.3"
      />
      {/* Inner hex */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        const r = 28;
        return `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`;
      }).join(" ") && (
        <polygon
          points={Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2;
            const r = 28;
            return `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`;
          }).join(" ")}
          fill="none"
          stroke="var(--accent, #00d4ff)"
          strokeWidth="0.2"
        />
      )}
      {/* Radial lines */}
      {hexes.map((h, i) => (
        <line key={i} x1="50" y1="50" x2={h.x} y2={h.y} stroke="var(--accent, #00d4ff)" strokeWidth="0.15" />
      ))}
    </motion.svg>
  );
}

/* ─── Orbiting status tags around reactor ─── */
function OrbitingTags() {
  const tags = ["SYS:ONLINE", "MEM:64GB", "CPU:98%", "NET:ACTIVE"];
  return (
    <>
      {tags.map((tag, i) => {
        const a = (i / tags.length) * 360;
        return (
          <motion.div
            key={tag}
            className="absolute font-mono text-[7px] tracking-wider pointer-events-none"
            style={{
              color: "var(--accent, #00d4ff)",
              opacity: 0.2,
              left: "50%",
              top: "50%",
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.15, 0.3, 0.15],
              rotate: [a, a + 360],
              x: "-50%",
              y: "-50%",
            }}
            transition={{
              opacity: { duration: 3, repeat: Infinity, delay: i * 0.5 },
              rotate: { duration: 40, repeat: Infinity, ease: "linear" },
            }}
          >
            <span style={{ transform: `translateX(${160 + i * 10}px)`, display: "inline-block" }}>
              {tag}
            </span>
          </motion.div>
        );
      })}
    </>
  );
}

/* ─── Code snippet with typing effect ─── */
function TypingCode({ lines, delay }: { lines: string[]; delay: number }) {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        setVisible((p) => {
          if (p >= lines.length) { clearInterval(iv); return p; }
          return p + 1;
        });
      }, 100);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [lines.length, delay]);

  return (
    <pre className="font-mono text-[9px] leading-[15px] whitespace-pre" style={{ color: "rgba(0,212,255,0.6)" }}>
      {lines.slice(0, visible).map((line, i) => (
        <div key={i}>
          <span className="opacity-30 mr-2 select-none">{String(i + 1).padStart(2, "0")}</span>
          {line}
        </div>
      ))}
      {visible < lines.length && (
        <span className="inline-block w-[5px] h-[11px] animate-pulse" style={{ background: "var(--accent, #00d4ff)", opacity: 0.6 }} />
      )}
    </pre>
  );
}

/* ─── Avatar silhouette for reactor center ─── */
function AvatarSilhouette() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 1.5 }}
    >
      <svg width="100" height="130" viewBox="0 0 100 130" className="opacity-25">
        {/* Head */}
        <ellipse cx="50" cy="35" rx="22" ry="28" fill="none" stroke="var(--accent, #00d4ff)" strokeWidth="1" />
        {/* Neck */}
        <line x1="42" y1="62" x2="42" y2="72" stroke="var(--accent, #00d4ff)" strokeWidth="1" />
        <line x1="58" y1="62" x2="58" y2="72" stroke="var(--accent, #00d4ff)" strokeWidth="1" />
        {/* Shoulders */}
        <path d="M42 72 Q30 74 15 90 L15 130" fill="none" stroke="var(--accent, #00d4ff)" strokeWidth="1" />
        <path d="M58 72 Q70 74 85 90 L85 130" fill="none" stroke="var(--accent, #00d4ff)" strokeWidth="1" />
        {/* Body lines */}
        <line x1="15" y1="130" x2="85" y2="130" stroke="var(--accent, #00d4ff)" strokeWidth="1" />
        {/* Face scan lines */}
        {[20, 28, 36, 44].map((y) => (
          <motion.line
            key={y}
            x1="30" y1={y} x2="70" y2={y}
            stroke="var(--accent, #00d4ff)" strokeWidth="0.5" opacity="0.3"
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, delay: y * 0.05 }}
          />
        ))}
        {/* Eyes */}
        <circle cx="40" cy="32" r="2" fill="var(--accent, #00d4ff)" opacity="0.4" />
        <circle cx="60" cy="32" r="2" fill="var(--accent, #00d4ff)" opacity="0.4" />
      </svg>
    </motion.div>
  );
}

/* ════════════════════════════════════════════
   MAIN HERO — Full-screen HUD dashboard
   ════════════════════════════════════════════ */

const CODE_LINES = [
  "int server = socket(AF_INET, SOCK_STREAM, 0);",
  "struct sockaddr_in addr;",
  "addr.sin_family = AF_INET;",
  "addr.sin_port = htons(8080);",
  "addr.sin_addr.s_addr = INADDR_ANY;",
  "",
  "bind(server, (sockaddr*)&addr, sizeof(addr));",
  "listen(server, SOMAXCONN);",
  "",
  "while (true) {",
  "  int client = accept(server, NULL, NULL);",
  "  std::thread([client] {",
  "    char buf[1024];",
  "    recv(client, buf, sizeof(buf), 0);",
  "    send(client, response, len, 0);",
  "    close(client);",
  "  }).detach();",
  "}",
];

const TECH_STACK = [
  { name: "C++", tag: "Primary" },
  { name: "Linux", tag: "OS" },
  { name: "Python", tag: "Scripting" },
  { name: "Docker", tag: "Deploy" },
  { name: "PostgreSQL", tag: "Data" },
  { name: "AWS", tag: "Cloud" },
];

export default function HeroSection() {
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {/* ── Connection lines from panels to reactor ── */}
      <ConnectionLine side="left" top="25%" delay={1.2} />
      <ConnectionLine side="left" top="48%" delay={1.5} />
      <ConnectionLine side="left" top="70%" delay={1.8} />
      <ConnectionLine side="right" top="22%" delay={1.3} />
      <ConnectionLine side="right" top="50%" delay={1.6} />
      <ConnectionLine side="right" top="72%" delay={1.9} />

      {/* ── Top data readout strip ── */}
      <div className="absolute top-16 left-0 right-0 z-10 flex justify-between px-6">
        <DataStrip items={["CORE:STABLE", "FREQ:3.6GHz", "LOAD:42%"]} delay={2} />
        <DataStrip items={["LAT:12ms", "CONN:SECURE", "VER:4.2.1"]} delay={2.3} />
      </div>

      {/* ── Full-screen grid layout ── */}
      <div className="w-full max-w-[1440px] mx-auto px-4 pt-14 pb-6 grid grid-cols-12 gap-3 min-h-screen items-center relative">

        {/* ═══ LEFT COLUMN (cols 1-4) — tilted toward center ═══ */}
        <div
          className="col-span-12 md:col-span-4 flex flex-col gap-3 self-center"
          style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
        >

          {/* Name / Title card */}
          <HoloPanel delay={0.3} side="left" floatOffset={0} panelId="name" expandedId={expandedPanel} onExpand={setExpandedPanel}>
            <div className="px-4 py-3">
              <motion.h1
                className="font-display text-xl md:text-2xl font-semibold leading-tight mb-1"
                style={{ color: "#e0e4f0" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <GlitchText text="UTKARSH SHARMA" speed={35} scrambleDuration={450} delay={500} />
              </motion.h1>
              <div className="font-mono text-[10px] tracking-[0.15em] opacity-50 mb-2" style={{ color: "var(--accent, #00d4ff)" }}>
                SYSTEMS & BACKEND ENGINEER
              </div>
              <div className="font-body text-[11px] opacity-40 leading-relaxed mb-2">
                B.Tech IT — Building high-performance servers, low-level networking, and systems that handle real load.
              </div>
              {/* Quick links */}
              <div className="flex gap-3 mt-1">
                {[
                  { label: "GITHUB", href: "https://github.com/utkarsh-sharma-017" },
                  { label: "LINKEDIN", href: profile.linkedin },
                  { label: "EMAIL", href: `mailto:${profile.email}` },
                ].map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[8px] tracking-wider opacity-30 hover:opacity-70 transition-opacity"
                    style={{ color: "var(--accent, #00d4ff)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    [{l.label}]
                  </a>
                ))}
              </div>
            </div>
          </HoloPanel>

          {/* Skills list panel */}
          <HoloPanel delay={0.6} side="left" floatOffset={1} panelId="skills" expandedId={expandedPanel} onExpand={setExpandedPanel}>
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-1 rounded-full" style={{ background: "var(--accent, #00d4ff)" }} />
                <span className="font-mono text-[9px] tracking-[0.15em] opacity-40" style={{ color: "var(--accent, #00d4ff)" }}>CORE SKILLS</span>
              </div>
              <div className="space-y-1.5">
                {skills.map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="font-mono text-[10px] w-20 opacity-60" style={{ color: "#e0e4f0" }}>
                      {s.name}
                    </span>
                    <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(var(--accent-rgb, 0,212,255), 0.08)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, #00d4ff, rgba(var(--accent-rgb, 0,212,255), 0.3))" }}
                        initial={{ width: "0%" }}
                        animate={{ width: `${s.level}%` }}
                        transition={{ duration: 1.5, delay: 1 + skills.indexOf(s) * 0.1 }}
                      />
                    </div>
                    <span className="font-mono text-[9px] tabular-nums opacity-40 w-8 text-right" style={{ color: "var(--accent, #00d4ff)" }}>
                      {s.level}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </HoloPanel>

          {/* Code editor panel */}
          <HoloPanel delay={0.9} side="left" floatOffset={2} panelId="code" expandedId={expandedPanel} onExpand={setExpandedPanel}>
            <div className="px-3 py-1.5 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(var(--accent-rgb, 0,212,255), 0.06)" }}>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                <span className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
              </div>
              <span className="font-mono text-[8px] tracking-wider opacity-30" style={{ color: "var(--accent, #00d4ff)" }}>server.cpp</span>
              <span className="ml-auto font-mono text-[7px] opacity-20" style={{ color: "var(--accent, #00d4ff)" }}>C++ | UTF-8</span>
            </div>
            <div className="px-3 py-2 overflow-hidden" style={{ maxHeight: 200 }}>
              <TypingCode lines={CODE_LINES} delay={1200} />
            </div>
          </HoloPanel>

          {/* Education mini panel */}
          <HoloPanel delay={1.1} side="left" floatOffset={3}>
            <div className="px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full" style={{ background: "var(--accent, #00d4ff)" }} />
                <span className="font-mono text-[9px] tracking-[0.15em] opacity-40" style={{ color: "var(--accent, #00d4ff)" }}>EDUCATION</span>
              </div>
              <div className="mt-2 font-mono text-[10px] opacity-50" style={{ color: "#e0e4f0" }}>
                B.Tech Information Technology
              </div>
              <div className="font-mono text-[8px] opacity-25" style={{ color: "var(--accent, #00d4ff)" }}>
                Currently Enrolled — Systems Focus
              </div>
            </div>
          </HoloPanel>
        </div>

        {/* ═══ CENTER — Arc Reactor with avatar + decorations ═══ */}
        <div
          className="col-span-12 md:col-span-4 flex items-center justify-center relative order-first md:order-none py-8 md:py-0"
          style={{ perspective: "1200px" }}
        >
          {/* Hex grid background */}
          <HexGrid />

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.7, rotateX: 15 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.div
              animate={{ z: [0, 10, 0], rotateX: [0, 1, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <ArcReactorHUD size={380} />
            </motion.div>
            <AvatarSilhouette />
          </motion.div>

          {/* Orbiting status tags */}
          <OrbitingTags />

          {/* Status readouts around reactor */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 -bottom-6 flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
          >
            <div className="font-mono text-[7px] tracking-wider opacity-20" style={{ color: "var(--accent, #00d4ff)" }}>
              REACTOR: NOMINAL
            </div>
            <div className="w-8 h-px" style={{ background: "rgba(var(--accent-rgb, 0,212,255), 0.15)" }} />
            <div className="font-mono text-[7px] tracking-wider opacity-20" style={{ color: "var(--accent, #00d4ff)" }}>
              HOLOGRAPHIC INTERFACE ACTIVE
            </div>
            <div className="w-8 h-px" style={{ background: "rgba(var(--accent-rgb, 0,212,255), 0.15)" }} />
            <div className="font-mono text-[7px] tracking-wider opacity-20" style={{ color: "var(--accent, #00d4ff)" }}>
              PWR: 100%
            </div>
          </motion.div>

          {/* Top reactor label */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 -top-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <div className="font-mono text-[7px] tracking-[0.25em] opacity-15 text-center" style={{ color: "var(--accent, #00d4ff)" }}>
              ARC REACTOR MK IV — OUTPUT 3.0 GJ/s
            </div>
          </motion.div>
        </div>

        {/* ═══ RIGHT COLUMN (cols 9-12) — tilted toward center ═══ */}
        <div
          className="col-span-12 md:col-span-4 flex flex-col gap-3 self-center"
          style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
        >

          {/* Tech Stack panel */}
          <HoloPanel delay={0.4} side="right" floatOffset={0.5} panelId="tech" expandedId={expandedPanel} onExpand={setExpandedPanel}>
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-1 rounded-full" style={{ background: "var(--accent, #00d4ff)" }} />
                <span className="font-mono text-[9px] tracking-[0.15em] opacity-40" style={{ color: "var(--accent, #00d4ff)" }}>TECH STACKS</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TECH_STACK.map((t, i) => (
                  <motion.div
                    key={t.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.08 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm"
                    style={{
                      background: "rgba(var(--accent-rgb, 0,212,255), 0.06)",
                      border: "1px solid rgba(var(--accent-rgb, 0,212,255), 0.1)",
                    }}
                  >
                    <span className="font-mono text-[10px]" style={{ color: "#e0e4f0", opacity: 0.7 }}>{t.name}</span>
                    <span className="font-mono text-[8px] opacity-30" style={{ color: "var(--accent, #00d4ff)" }}>{t.tag}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </HoloPanel>

          {/* Project panel */}
          <HoloPanel delay={0.7} side="right" floatOffset={1.5} panelId="project" expandedId={expandedPanel} onExpand={setExpandedPanel}>
            <div className="px-4 py-3">
              <div className="font-mono text-[9px] tracking-[0.12em] opacity-30 mb-1" style={{ color: "var(--accent, #00d4ff)" }}>
                PROJECT: {projects[0]?.title?.toUpperCase()}
              </div>
              <div className="font-display text-sm font-medium mb-3" style={{ color: "#e0e4f0" }}>
                <GlitchText text="01. SYSTEM ARCHITECTURE" speed={25} scrambleDuration={300} delay={1000} />
              </div>
              <div className="space-y-1">
                {["PROJECT DATA", "TECHNICAL DOCS", "SYSTEM ARTIFACTS", "PROJECT ARCHITECTURE", "SERVER ARCHITECTURE", "ASSEMBLED DATA"].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + i * 0.08 }}
                    className="flex items-center gap-2 font-mono text-[10px]"
                  >
                    <span className="opacity-30 tabular-nums" style={{ color: "var(--accent, #00d4ff)" }}>
                      {String(i + 1).padStart(2, "0")}.
                    </span>
                    <span style={{ color: "#e0e4f0", opacity: i === 0 ? 0.8 : 0.4 }}>{item}</span>
                    {i === 0 && (
                      <span className="ml-auto px-1.5 py-0.5 text-[8px] rounded-sm" style={{ background: "rgba(0,212,255,0.12)", color: "var(--accent, #00d4ff)" }}>
                        ACTIVE
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </HoloPanel>

          {/* Performance metrics panel */}
          <HoloPanel delay={1} side="right" floatOffset={2.5} panelId="perf" expandedId={expandedPanel} onExpand={setExpandedPanel}>
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-1 rounded-full" style={{ background: "var(--accent, #00d4ff)" }} />
                <span className="font-mono text-[9px] tracking-[0.15em] opacity-40" style={{ color: "var(--accent, #00d4ff)" }}>PERFORMANCE</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <MetricBox label="PROJECTS" value={String(projects.length)} />
                <MetricBox label="UPTIME" value="99.9%" />
                <MetricBox label="COMMITS" value="500+" />
              </div>
              {/* Concepts tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {concepts.slice(0, 8).map((c, i) => (
                  <motion.span
                    key={c}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 + i * 0.05 }}
                    className="font-mono text-[8px] px-2 py-0.5 rounded-sm"
                    style={{
                      color: "rgba(var(--accent-rgb, 0,212,255), 0.5)",
                      border: "1px solid rgba(var(--accent-rgb, 0,212,255), 0.08)",
                    }}
                  >
                    {c}
                  </motion.span>
                ))}
              </div>
            </div>
          </HoloPanel>

          {/* System diagnostics mini panel */}
          <HoloPanel delay={1.2} side="right" floatOffset={3}>
            <div className="px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full" style={{ background: "#4ade80" }} />
                <span className="font-mono text-[9px] tracking-[0.15em] opacity-40" style={{ color: "var(--accent, #00d4ff)" }}>DIAGNOSTICS</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                {[
                  { k: "MEMORY", v: "2.4GB / 8GB" },
                  { k: "THREADS", v: "12 ACTIVE" },
                  { k: "LATENCY", v: "< 5ms" },
                  { k: "STATUS", v: "OPTIMAL" },
                ].map(({ k, v }) => (
                  <div key={k} className="flex justify-between">
                    <span className="font-mono text-[8px] opacity-30" style={{ color: "var(--accent, #00d4ff)" }}>{k}</span>
                    <span className="font-mono text-[8px] opacity-50" style={{ color: "#e0e4f0" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </HoloPanel>
        </div>
      </div>

      {/* ── Bottom telemetry bar ── */}
      <motion.div
        className="absolute bottom-10 left-0 right-0 flex justify-center gap-8 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        {["SECTOR A-7", "CLEARANCE: ALPHA", "UPLINK: SYNCED", "PROTOCOL: ACTIVE"].map((t, i) => (
          <motion.span
            key={t}
            className="font-mono text-[7px] tracking-[0.15em] opacity-15"
            style={{ color: "var(--accent, #00d4ff)" }}
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
          >
            {t}
          </motion.span>
        ))}
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        <motion.div
          className="flex flex-col items-center gap-1"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="font-mono text-[8px] opacity-20 tracking-widest" style={{ color: "var(--accent, #00d4ff)" }}>SCROLL</span>
          <div className="w-px h-4" style={{ background: "linear-gradient(180deg, rgba(var(--accent-rgb, 0,212,255), 0.3), transparent)" }} />
        </motion.div>
      </motion.div>

      {/* ── Expanded panel overlay ── */}
      <AnimatePresence>
        {expandedPanel && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedPanel(null)}
          >
            <div
              className="absolute inset-0"
              style={{ background: "rgba(5,5,8,0.7)", backdropFilter: "blur(8px)" }}
            />
            <motion.div
              className="relative z-10 w-full max-w-2xl mx-4"
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "rgba(0, 212, 255, 0.04)",
                border: "1px solid rgba(0, 212, 255, 0.2)",
                backdropFilter: "blur(16px)",
                borderRadius: "4px",
                boxShadow: "0 0 40px rgba(var(--accent-rgb, 0,212,255), 0.08)",
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setExpandedPanel(null)}
                className="absolute top-3 right-3 font-mono text-[10px] opacity-40 hover:opacity-80 z-20 px-2 py-1"
                style={{ color: "var(--accent, #00d4ff)", border: "1px solid rgba(var(--accent-rgb, 0,212,255), 0.15)" }}
              >
                [ CLOSE ]
              </button>
              {/* Top glow */}
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(var(--accent-rgb, 0,212,255), 0.5), transparent)" }} />
              <div className="p-6">
                <ExpandedPanelContent panelId={expandedPanel} />
              </div>
              <span className="corner-bracket corner-tl" />
              <span className="corner-bracket corner-tr" />
              <span className="corner-bracket corner-bl" />
              <span className="corner-bracket corner-br" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ─── Expanded panel content ─── */
function ExpandedPanelContent({ panelId }: { panelId: string }) {
  switch (panelId) {
    case "name":
      return (
        <div>
          <h2 className="font-display text-2xl mb-3" style={{ color: "#e0e4f0" }}>UTKARSH SHARMA</h2>
          <div className="font-mono text-[11px] tracking-wider opacity-50 mb-4" style={{ color: "var(--accent, #00d4ff)" }}>
            SYSTEMS & BACKEND ENGINEER — B.Tech IT
          </div>
          <p className="font-body text-sm opacity-50 leading-relaxed mb-4" style={{ color: "#e0e4f0" }}>
            {profile.bio}
          </p>
          <div className="flex gap-4 mt-3">
            {[
              { label: "GITHUB", href: "https://github.com/utkarsh-sharma-017" },
              { label: "LINKEDIN", href: profile.linkedin },
              { label: "EMAIL", href: `mailto:${profile.email}` },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] tracking-wider px-3 py-1.5 rounded-sm transition-all hover:scale-105"
                style={{ color: "var(--accent, #00d4ff)", border: "1px solid rgba(var(--accent-rgb, 0,212,255), 0.2)", background: "rgba(0,212,255,0.05)" }}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      );
    case "skills":
      return (
        <div>
          <h2 className="font-display text-xl mb-4" style={{ color: "#e0e4f0" }}>CORE SKILLS ANALYSIS</h2>
          <div className="space-y-3">
            {skills.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between mb-1">
                  <span className="font-mono text-[11px] opacity-70" style={{ color: "#e0e4f0" }}>{s.name}</span>
                  <span className="font-mono text-[11px] tabular-nums opacity-50" style={{ color: "var(--accent, #00d4ff)" }}>{s.level}%</span>
                </div>
                <div className="h-[4px] rounded-full overflow-hidden" style={{ background: "rgba(var(--accent-rgb, 0,212,255), 0.08)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #00d4ff, rgba(var(--accent-rgb, 0,212,255), 0.4))", width: `${s.level}%` }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${s.level}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "code":
      return (
        <div>
          <h2 className="font-display text-xl mb-2" style={{ color: "#e0e4f0" }}>server.cpp</h2>
          <div className="font-mono text-[8px] opacity-30 mb-4" style={{ color: "var(--accent, #00d4ff)" }}>High-performance multi-threaded TCP server</div>
          <pre className="font-mono text-[11px] leading-[20px] whitespace-pre" style={{ color: "rgba(0,212,255,0.7)" }}>
            {CODE_LINES.map((line, i) => (
              <div key={i}><span className="opacity-30 mr-3 select-none">{String(i + 1).padStart(2, "0")}</span>{line}</div>
            ))}
          </pre>
        </div>
      );
    case "tech":
      return (
        <div>
          <h2 className="font-display text-xl mb-4" style={{ color: "#e0e4f0" }}>TECHNOLOGY STACK</h2>
          <div className="grid grid-cols-3 gap-3">
            {TECH_STACK.map((t) => (
              <div
                key={t.name}
                className="px-4 py-3 rounded-sm text-center"
                style={{ background: "rgba(var(--accent-rgb, 0,212,255), 0.06)", border: "1px solid rgba(var(--accent-rgb, 0,212,255), 0.1)" }}
              >
                <div className="font-display text-sm mb-1" style={{ color: "#e0e4f0" }}>{t.name}</div>
                <div className="font-mono text-[9px] opacity-30" style={{ color: "var(--accent, #00d4ff)" }}>{t.tag}</div>
              </div>
            ))}
          </div>
        </div>
      );
    case "project":
      return (
        <div>
          <h2 className="font-display text-xl mb-2" style={{ color: "#e0e4f0" }}>{projects[0]?.title}</h2>
          <div className="font-mono text-[10px] opacity-40 mb-4" style={{ color: "var(--accent, #00d4ff)" }}>{projects[0]?.description}</div>
          <div className="flex flex-wrap gap-2">
            {projects[0]?.tags?.map((t: string) => (
              <span key={t} className="font-mono text-[9px] px-2 py-1 rounded-sm" style={{ color: "var(--accent, #00d4ff)", border: "1px solid rgba(0,212,255,0.12)" }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      );
    case "perf":
      return (
        <div>
          <h2 className="font-display text-xl mb-4" style={{ color: "#e0e4f0" }}>PERFORMANCE METRICS</h2>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <MetricBox label="ACTIVE PROJECTS" value={String(projects.length)} />
            <MetricBox label="SYSTEM UPTIME" value="99.9%" />
            <MetricBox label="GIT COMMITS" value="500+" />
          </div>
          <div className="flex flex-wrap gap-2">
            {concepts.map((c) => (
              <span key={c} className="font-mono text-[9px] px-2 py-1 rounded-sm" style={{ color: "rgba(0,212,255,0.6)", border: "1px solid rgba(var(--accent-rgb, 0,212,255), 0.1)" }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

/* ── Metric display box ── */
function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-lg font-semibold" style={{ color: "var(--accent, #00d4ff)", opacity: 0.8 }}>
        {value}
      </div>
      <div className="font-mono text-[7px] tracking-wider opacity-30" style={{ color: "var(--accent, #00d4ff)" }}>
        {label}
      </div>
    </div>
  );
}
