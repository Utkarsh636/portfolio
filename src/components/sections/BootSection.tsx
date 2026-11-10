import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import GlitchText from "@/components/ui/GlitchText";
import ArcReactorHUD from "@/components/ui/ArcReactorHUD";
import { playSound } from "@/hooks/useSound";

/* ─────────────────────────────────────────────
   CODE SNIPPETS for the floating holo-screens
   ───────────────────────────────────────────── */
const CODE_SCREENS = [
  {
    title: "NEURAL_CORE.SYS",
    lines: [
      "class NeuralCore {",
      "  private threads: ThreadPool;",
      "  private memory: MemoryPool<64>;",
      "",
      "  async initialize() {",
      '    await this.threads.spawn(8);',
      "    this.memory.allocate(1024);",
      '    log("Core online");',
      "  }",
      "",
      "  process(signal: Signal) {",
      "    const buffer = this.memory.get();",
      "    return this.threads.dispatch(",
      "      signal, buffer",
      "    );",
      "  }",
      "};",
    ],
  },
  {
    title: "HOLOGRAPHIC_ENGINE",
    lines: [
      "#include <render/holo.h>",
      "#include <math/matrix4.h>",
      "",
      "void HoloEngine::render() {",
      "  mat4 proj = perspective(",
      "    fov, aspect, 0.1f, 1000.f",
      "  );",
      "  for (auto& layer : layers) {",
      "    layer.bind();",
      "    layer.setUniform(",
      '      "uProjection", proj',
      "    );",
      "    layer.draw();",
      "  }",
      "  postProcess(bloom, glow);",
      "}",
    ],
  },
  {
    title: "SECURITY_PROTOCOL",
    lines: [
      "fn verify_biometrics(",
      "  scan: &BiometricScan",
      ") -> Result<Auth> {",
      "  let hash = sha256(",
      "    &scan.fingerprint",
      "  );",
      '  let key = vault.get("master")?;',
      "  if crypto::verify(",
      "    &hash, &key",
      "  ) {",
      "    Ok(Auth::Granted)",
      "  } else {",
      "    Err(AuthError::Denied)",
      "  }",
      "}",
    ],
  },
  {
    title: "DATA_MATRIX",
    lines: [
      "SELECT s.name, s.level",
      "FROM skills s",
      "JOIN categories c",
      "  ON s.cat_id = c.id",
      "WHERE s.level > 60",
      "ORDER BY s.level DESC;",
      "",
      "-- RESULT:",
      "-- C++        | 92",
      "-- Linux      | 75",
      "-- Python     | 70",
      "-- C          | 68",
      "-- Docker     | 65",
      "-- Databases  | 65",
      "-- AWS        | 60",
    ],
  },
];

const BOOT_LINES = [
  "INITIALIZING NEURAL CORE...",
  "LOADING J.A.R.V.I.S. INTERFACE",
  "CALIBRATING HOLOGRAPHIC ENGINE",
  "MOUNTING 3D RENDER PIPELINE",
  "SYNCING PROJECT DATABASE",
  "ESTABLISHING SECURE CHANNELS",
  "VERIFYING BIOMETRIC PROTOCOLS",
  "ALL SYSTEMS NOMINAL",
];

/* ── Matrix rain column ── */
function MatrixRain({ delay, left, speed }: { delay: number; left: string; speed: number }) {
  const chars = "アイウエオカキクケコ01サシスセソタチツテト10ナニヌネノハヒフヘホ";
  const [col, setCol] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const iv = setInterval(() => {
        setCol((prev) => {
          const next = prev + chars[Math.floor(Math.random() * chars.length)] + "\n";
          return next.length > 200 ? next.slice(-200) : next;
        });
      }, speed);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay, speed]);

  return (
    <div
      className="absolute top-0 font-mono text-[10px] leading-[14px] whitespace-pre pointer-events-none select-none overflow-hidden"
      style={{
        left,
        color: "var(--accent)",
        opacity: 0.06,
        height: "100%",
        writingMode: "vertical-rl",
      }}
    >
      {col}
    </div>
  );
}

/* ── Floating holographic code screen ── */
function HoloScreen({
  data,
  style,
  animDelay,
}: {
  data: (typeof CODE_SCREENS)[0];
  style: React.CSSProperties;
  animDelay: number;
}) {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const iv = setInterval(() => {
        setVisibleLines((prev) => {
          if (prev >= data.lines.length) {
            clearInterval(iv);
            return prev;
          }
          return prev + 1;
        });
      }, 120 + Math.random() * 80);
      return () => clearInterval(iv);
    }, animDelay);
    return () => clearTimeout(timeout);
  }, [data.lines.length, animDelay]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 1, delay: animDelay / 1000, ease: [0.16, 1, 0.3, 1] }}
      className="absolute overflow-hidden"
      style={{
        ...style,
        background: "rgba(0, 212, 255, 0.03)",
        border: "1px solid rgba(0, 212, 255, 0.12)",
        backdropFilter: "blur(4px)",
        borderRadius: "2px",
      }}
    >
      {/* Top glow line */}
      <div
        className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)" }}
      />

      {/* Header bar */}
      <div
        className="flex items-center gap-2 px-3 py-1.5"
        style={{ borderBottom: "1px solid rgba(0,212,255,0.06)" }}
      >
        <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: "#00d4ff" }} />
        <span className="font-mono text-[8px] tracking-[0.15em] opacity-50" style={{ color: "#00d4ff" }}>
          {data.title}
        </span>
      </div>

      {/* Scrolling code body */}
      <div className="px-3 py-2 overflow-hidden" style={{ maxHeight: 200 }}>
        {data.lines.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className="font-mono text-[9px] leading-[15px] whitespace-pre"
            style={{ color: "rgba(0, 212, 255, 0.55)" }}
          >
            <span className="opacity-30 mr-2 select-none">{String(i + 1).padStart(2, "0")}</span>
            {line}
          </div>
        ))}
        {visibleLines < data.lines.length && (
          <span
            className="inline-block w-[6px] h-[12px] animate-pulse"
            style={{ background: "#00d4ff", opacity: 0.6 }}
          />
        )}
      </div>

      {/* Scan line */}
      <motion.div
        className="absolute left-0 w-full h-px pointer-events-none"
        style={{ background: "#00d4ff", opacity: 0.15 }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      />

      {/* Corner brackets */}
      <span className="corner-bracket corner-tl" style={{ width: 8, height: 8 }} />
      <span className="corner-bracket corner-tr" style={{ width: 8, height: 8 }} />
      <span className="corner-bracket corner-bl" style={{ width: 8, height: 8 }} />
      <span className="corner-bracket corner-br" style={{ width: 8, height: 8 }} />
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   MAIN BOOT SECTION
   ══════════════════════════════════════════ */
export default function BootSection() {
  const booted = useStore((s) => s.booted);
  const setBoot = useStore((s) => s.setBoot);
  const setSection = useStore((s) => s.setSection);

  const [clicked, setClicked] = useState(false);
  const [bootLine, setBootLine] = useState(0);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const handleInit = useCallback(() => {
    if (clicked) return;
    setClicked(true);
    playSound("boot");

    let line = 0;
    let prog = 0;

    intervalRef.current = setInterval(() => {
      prog += Math.random() * 8 + 2;
      if (prog >= 100) prog = 100;
      setProgress(Math.round(prog));

      const nextLine = Math.min(
        Math.floor((prog / 100) * BOOT_LINES.length),
        BOOT_LINES.length - 1,
      );
      if (nextLine !== line) {
        line = nextLine;
        setBootLine(line);
        playSound("type");
      }

      if (prog >= 100) {
        clearInterval(intervalRef.current);
        setComplete(true);
        playSound("success");
        setTimeout(() => {
          setBoot(true);
          setSection("hero");
        }, 1200);
      }
    }, 140);
  }, [clicked, setBoot, setSection]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  if (booted) return null;

  return (
    <section
      id="boot"
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{ background: "radial-gradient(ellipse at center, #0a0a12 0%, #050508 70%)" }}
    >
      {/* Matrix rain background */}
      {Array.from({ length: 20 }).map((_, i) => (
        <MatrixRain
          key={i}
          left={`${(i / 20) * 100}%`}
          delay={i * 200}
          speed={80 + Math.random() * 120}
        />
      ))}

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(5,5,8,0.8) 100%)",
        }}
      />

      <AnimatePresence mode="wait">
        {!clicked ? (
          /* ═══════════ PRE-INIT — Reactor + floating screens + button ═══════════ */
          <motion.div
            key="init"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(8px)" }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Center: Arc Reactor — big and dominant */}
            <div className="relative z-10">
              <ArcReactorHUD size={480} />
            </div>

            {/* Left floating screens */}
            <HoloScreen
              data={CODE_SCREENS[0]}
              style={{
                left: "3%",
                top: "12%",
                width: 260,
                transform: "perspective(800px) rotateY(12deg)",
              }}
              animDelay={300}
            />
            <HoloScreen
              data={CODE_SCREENS[1]}
              style={{
                left: "5%",
                bottom: "15%",
                width: 240,
                transform: "perspective(800px) rotateY(8deg)",
              }}
              animDelay={800}
            />

            {/* Right floating screens */}
            <HoloScreen
              data={CODE_SCREENS[2]}
              style={{
                right: "3%",
                top: "10%",
                width: 250,
                transform: "perspective(800px) rotateY(-12deg)",
              }}
              animDelay={500}
            />
            <HoloScreen
              data={CODE_SCREENS[3]}
              style={{
                right: "5%",
                bottom: "18%",
                width: 230,
                transform: "perspective(800px) rotateY(-8deg)",
              }}
              animDelay={1000}
            />

            {/* Top label */}
            <motion.div
              className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-20"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="hud-text text-[10px] opacity-30 tracking-[0.4em] mb-1">
                STARK INDUSTRIES
              </div>
              <div className="hud-text text-[8px] opacity-20 tracking-[0.3em]">
                NEURAL INTERFACE v4.2.0
              </div>
            </motion.div>

            {/* INITIALIZE SYSTEM button — bottom center */}
            <motion.div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <button
                onClick={handleInit}
                className="relative group"
              >
                {/* Outer glow ring */}
                <motion.span
                  className="absolute -inset-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "radial-gradient(ellipse, rgba(0,212,255,0.15), transparent 70%)",
                  }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Button body */}
                <span
                  className="relative block px-10 py-4 font-display text-sm tracking-[0.25em] uppercase rounded-sm transition-all duration-300 group-hover:scale-105"
                  style={{
                    color: "#00d4ff",
                    background: "linear-gradient(180deg, rgba(0,212,255,0.08) 0%, rgba(0,212,255,0.02) 100%)",
                    border: "1px solid rgba(0,212,255,0.25)",
                    boxShadow: "0 0 20px rgba(0,212,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
                    textShadow: "0 0 10px rgba(0,212,255,0.5)",
                  }}
                >
                  Initialize System
                </span>

                {/* Pulse ring animation */}
                <motion.span
                  className="absolute inset-0 rounded-sm"
                  style={{ border: "1px solid rgba(0,212,255,0.15)" }}
                  animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.08, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </button>

              <span className="hud-text text-[8px] opacity-20 tracking-[0.2em]">
                CLICK TO ACTIVATE HOLOGRAPHIC HUD
              </span>
            </motion.div>

            {/* Decorative side lines */}
            <div className="absolute left-3 top-12 bottom-12 w-px opacity-[0.06]" style={{ background: "#00d4ff" }} />
            <div className="absolute right-3 top-12 bottom-12 w-px opacity-[0.06]" style={{ background: "#00d4ff" }} />

            {/* Corner brackets */}
            <div className="absolute inset-4 pointer-events-none">
              <span className="corner-bracket corner-tl" />
              <span className="corner-bracket corner-tr" />
              <span className="corner-bracket corner-bl" />
              <span className="corner-bracket corner-br" />
            </div>
          </motion.div>
        ) : (
          /* ═══════════ BOOT SEQUENCE ═══════════ */
          <motion.div
            key="booting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.08, filter: "blur(16px)" }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Reactor stays visible but dims during boot */}
            <motion.div
              className="absolute z-0"
              animate={{ opacity: [0.3, 0.5, 0.3], scale: [0.6, 0.65, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArcReactorHUD size={400} />
            </motion.div>

            {/* Boot log overlay */}
            <div className="relative z-10 w-full max-w-xl px-8 flex flex-col gap-3">
              {/* Title */}
              <div className="flex items-center gap-3 mb-3">
                <motion.span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#00d4ff" }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="hud-text text-[10px] opacity-60 tracking-[0.2em]">
                  SYSTEM BOOT SEQUENCE
                </span>
                <span className="flex-1 h-px" style={{ background: "rgba(0,212,255,0.1)" }} />
                <span className="hud-text text-[10px] tabular-nums opacity-60">{progress}%</span>
              </div>

              {/* Log lines */}
              {BOOT_LINES.slice(0, bootLine + 1).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: i === bootLine ? 1 : 0.2, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 px-4 py-2 rounded-sm"
                  style={{
                    background: i === bootLine ? "rgba(0,212,255,0.04)" : "transparent",
                    border: i === bootLine ? "1px solid rgba(0,212,255,0.1)" : "1px solid transparent",
                  }}
                >
                  <span className="font-mono text-[10px] opacity-30 tabular-nums w-5" style={{ color: "#00d4ff" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <GlitchText
                    text={line}
                    className="hud-text text-[11px] flex-1"
                    speed={10}
                    scrambleDuration={150}
                  />
                  {i < bootLine && (
                    <span className="text-[10px] font-mono" style={{ color: "#4ade80", opacity: 0.6 }}>
                      [OK]
                    </span>
                  )}
                </motion.div>
              ))}

              {/* Progress bar */}
              <div className="mt-2">
                <div className="w-full h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(0,212,255,0.06)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #00d4ff, rgba(0,212,255,0.3))" }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeOut", duration: 0.2 }}
                  />
                </div>
              </div>

              {/* System online flash */}
              {complete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center mt-4"
                >
                  <GlitchText
                    text="SYSTEM ONLINE"
                    className="font-display text-2xl tracking-[0.35em]"
                    style={{ color: "#00d4ff", textShadow: "0 0 20px rgba(0,212,255,0.5)" }}
                    speed={18}
                    scrambleDuration={300}
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
