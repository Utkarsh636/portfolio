import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";
import { profile } from "@/data/profile";
import GlitchText from "@/components/ui/GlitchText";
import FloatingCodePanel from "@/components/ui/FloatingCodePanel";

/* ═══════════════════════════════════════════════════════════════════
   FRIDAY AMBER PALETTE
   ═══════════════════════════════════════════════════════════════════ */
const AMBER = "#ff9e2c";
const AMBER_RGB = "255, 158, 44";
const a = (opacity: number) => `rgba(${AMBER_RGB}, ${opacity})`;

/* ═══════════════════════════════════════════════════════════════════
   CODE SNIPPETS
   ═══════════════════════════════════════════════════════════════════ */
const TCP_SERVER_CODE = `// ═══ STARK INDUSTRIES — COMMS BACKBONE v4.2 ═══
// Encrypted TCP relay — Project F.R.I.D.A.Y.

#include <sys/socket.h>
#include <netinet/in.h>
#include <thread>
#include <iostream>

int main() {
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        perror("socket failed");
        return 1;
    }

    struct sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(8080);
    addr.sin_addr.s_addr = INADDR_ANY;

    bind(server_fd, (struct sockaddr*)&addr,
         sizeof(addr));
    listen(server_fd, SOMAXCONN);

    std::cout << "[FRIDAY] Server online — "
              << "port 8080\\n";

    while (true) {
        int client = accept(server_fd,
                           nullptr, nullptr);
        std::thread([client] {
            char buf[4096];
            ssize_t n = recv(client, buf,
                            sizeof(buf), 0);
            // Process encrypted payload
            send(client, buf, n, 0);
            close(client);
        }).detach();
    }
    return 0;
}`;

const THREAD_POOL_CODE = `std::vector<std::thread> workers;
std::queue<std::function<void()>> tasks;
std::mutex mtx;
std::condition_variable cv;

for (int i = 0; i < num_threads; i++) {
  workers.emplace_back([this] {
    while (true) {
      std::unique_lock lock(mtx);
      cv.wait(lock, [&]{
        return !tasks.empty();
      });
      auto task = std::move(tasks.front());
      tasks.pop();
      lock.unlock();
      task();
    }
  });
}`;

const MEMORY_POOL_CODE = `template<typename T, size_t BlockSize>
class MemoryPool {
  union Block {
    T data;
    Block* next;
  };
  Block* free_list = nullptr;
  std::vector<Block*> chunks;

  T* allocate() {
    if (!free_list) expand();
    Block* block = free_list;
    free_list = block->next;
    return &block->data;
  }
};`;

/* ═══════════════════════════════════════════════════════════════════
   SPECIALIZATION TAGS
   ═══════════════════════════════════════════════════════════════════ */
const TAGS = [
  "Systems Programming",
  "Socket Programming",
  "Multi-threading",
  "Server Architecture",
  "Network Protocols",
  "Memory Management",
  "Linux Internals",
  "High-Performance C++",
  "Backend Infrastructure",
];

/* ═══════════════════════════════════════════════════════════════════
   STATS DATA
   ═══════════════════════════════════════════════════════════════════ */
const STATS = [
  { label: "PROJECTS DEPLOYED", value: "3+", icon: "◆" },
  { label: "GIT COMMITS", value: "500+", icon: "◈" },
  { label: "CLASSIFICATION", value: "B.TECH IT", icon: "◇" },
  { label: "PRIMARY LANG", value: "C++", icon: "◆" },
];

/* ═══════════════════════════════════════════════════════════════════
   C++ SYNTAX HIGHLIGHTING (simplified — visual, not a full parser)
   ═══════════════════════════════════════════════════════════════════ */
const CPP_KEYWORDS = new Set([
  "int", "void", "struct", "return", "for", "while", "if", "else",
  "class", "template", "typename", "size_t", "ssize_t", "auto", "true",
  "false", "bool", "using", "namespace", "this", "new", "delete",
  "const", "static", "union", "nullptr", "public", "private",
  "protected", "char", "main",
]);

function tokenizeLine(line: string): { text: string; color: string }[] {
  const tokens: { text: string; color: string }[] = [];
  // Match tokens: comments, strings, preprocessor, std:: types, UPPER_CASE constants,
  // numbers, keywords, identifiers, punctuation, whitespace
  const regex =
    /(\/\/.*$|"[^"]*"|'[^']*'|#include\s*<[^>]+>|#\w+|\bstd::\w+\b|\b[A-Z][A-Z_0-9]{2,}\b|\b\d+\b|\b\w+\b|[^\w\s]|\s+)/g;
  let match;

  while ((match = regex.exec(line)) !== null) {
    const text = match[0];
    let color: string;

    if (text.startsWith("//")) {
      color = a(0.3);
    } else if (text.startsWith('"') || text.startsWith("'")) {
      color = "#e8a960";
    } else if (text.startsWith("#")) {
      color = "#c97030";
    } else if (text.startsWith("std::")) {
      color = "#d4943a";
    } else if (CPP_KEYWORDS.has(text)) {
      color = AMBER;
    } else if (/^[A-Z][A-Z_0-9]{2,}$/.test(text)) {
      color = "#e8b860";
    } else if (/^\d+$/.test(text)) {
      color = "#d4a03a";
    } else if (/^[^\w\s]$/.test(text)) {
      color = a(0.5);
    } else if (/^\s+$/.test(text)) {
      color = "";
    } else {
      color = a(0.65);
    }

    tokens.push({ text, color });
  }
  return tokens;
}

/* Build a flat colored-character array for the typing animation */
function buildColoredChars(code: string): { char: string; color: string }[] {
  const chars: { char: string; color: string }[] = [];
  const lines = code.split("\n");

  for (let li = 0; li < lines.length; li++) {
    const tokens = tokenizeLine(lines[li]);
    for (const token of tokens) {
      for (const ch of token.text) {
        chars.push({ char: ch, color: token.color });
      }
    }
    if (li < lines.length - 1) {
      chars.push({ char: "\n", color: "" });
    }
  }
  return chars;
}

/* Render syntax-highlighted code up to N characters */
function HighlightedCode({ code, visibleChars }: { code: string; visibleChars: number }) {
  const coloredChars = useMemo(() => buildColoredChars(code), [code]);

  const visible = coloredChars.slice(0, visibleChars);

  // Group consecutive chars with same color for fewer DOM nodes
  const groups: { text: string; color: string }[] = [];
  for (const ch of visible) {
    const last = groups[groups.length - 1];
    if (last && last.color === ch.color) {
      last.text += ch.char;
    } else {
      groups.push({ text: ch.char, color: ch.color });
    }
  }

  return (
    <>
      {groups.map((g, i) => (
        <span key={i} style={g.color ? { color: g.color } : undefined}>
          {g.text}
        </span>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TYPING ANIMATION HOOK (requestAnimationFrame-based)
   ═══════════════════════════════════════════════════════════════════ */
function useTypingAnimation(
  totalChars: number,
  charsPerSecond: number,
  startDelay: number,
  active: boolean,
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;

    let rafId = 0;
    const msPerChar = 1000 / charsPerSecond;

    const timeout = setTimeout(() => {
      const startTime = performance.now();

      function tick() {
        const elapsed = performance.now() - startTime;
        const chars = Math.min(Math.floor(elapsed / msPerChar), totalChars);
        setCount(chars);
        if (chars < totalChars) {
          rafId = requestAnimationFrame(tick);
        }
      }

      rafId = requestAnimationFrame(tick);
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafId);
    };
  }, [totalChars, charsPerSecond, startDelay, active]);

  return count;
}

/* ═══════════════════════════════════════════════════════════════════
   LINE NUMBERS
   ═══════════════════════════════════════════════════════════════════ */
function LineNumbers({ count, activeUpTo }: { count: number; activeUpTo: number }) {
  return (
    <div
      className="select-none pr-3 text-right border-r shrink-0"
      style={{ borderColor: a(0.1), minWidth: "2.5rem" }}
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="font-mono leading-relaxed transition-colors duration-300"
          style={{
            fontSize: "10px",
            color: i < activeUpTo ? a(0.4) : a(0.1),
          }}
        >
          {String(i + 1).padStart(2, " ")}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STATUS READOUT ITEM
   ═══════════════════════════════════════════════════════════════════ */
function StatusItem({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div
      className="text-center py-2 px-2 rounded-sm"
      style={{ background: a(0.03), border: `1px solid ${a(0.08)}` }}
    >
      <div
        className="font-mono tracking-[0.12em] mb-0.5"
        style={{ fontSize: "7px", color: a(0.3) }}
      >
        {label}
      </div>
      <div className="flex items-center justify-center gap-1">
        {active && (
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-1 rounded-full"
            style={{ background: "#28ca41" }}
          />
        )}
        <span
          className="font-mono font-bold tracking-wider"
          style={{
            fontSize: "10px",
            color: active ? "#28ca41" : a(0.6),
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════ */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.2 } },
};

/* ═══════════════════════════════════════════════════════════════════
   ABOUT SECTION
   ═══════════════════════════════════════════════════════════════════ */
export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.08 });
  const codeInView = useInView(codeRef, { once: true, amount: 0.15 });

  /* Typing animation state */
  const totalChars = TCP_SERVER_CODE.length;
  const visibleChars = useTypingAnimation(totalChars, 70, 800, codeInView);
  const lineCount = TCP_SERVER_CODE.split("\n").length;
  const visibleText = TCP_SERVER_CODE.slice(0, visibleChars);
  const activeLineCount = visibleText.split("\n").length;
  const cursorCol = visibleText.split("\n").pop()?.length ?? 0;

  /* Scan line sweep */
  const [scanY, setScanY] = useState(0);
  useEffect(() => {
    if (!codeInView) return;
    const id = setInterval(() => {
      setScanY((p) => (p >= 100 ? 0 : p + 0.25));
    }, 50);
    return () => clearInterval(id);
  }, [codeInView]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="section"
      style={
        {
          position: "relative",
          overflow: "hidden",
          /* Override theme variables for FRIDAY amber within this section */
          "--accent": AMBER,
          "--accent-rgb": AMBER_RGB,
          "--accent-dim": a(0.12),
          "--accent-glow": a(0.35),
          "--hud-border": a(0.2),
        } as React.CSSProperties
      }
    >
      {/* ────────────────────────── Atmospheric fog layers ────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 90% 50% at 15% 50%, ${a(0.07)} 0%, transparent 70%),
            radial-gradient(ellipse 70% 45% at 85% 35%, ${a(0.05)} 0%, transparent 60%),
            radial-gradient(ellipse 100% 60% at 50% 100%, ${a(0.035)} 0%, transparent 50%)
          `,
        }}
      />
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: "35%",
          height: "30%",
          background: `linear-gradient(180deg, transparent, ${a(0.015)}, transparent)`,
          filter: "blur(60px)",
        }}
      />
      {/* Subtle horizontal amber streaks */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "20%",
          left: "5%",
          width: "40%",
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${a(0.08)}, transparent)`,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: "75%",
          right: "5%",
          width: "35%",
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${a(0.06)}, transparent)`,
        }}
      />

      {/* ────────────────────────── Main content ────────────────────────── */}
      <motion.div
        className="max-w-7xl w-full px-6 md:px-12 relative z-10"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={stagger}
      >
        {/* ── Section header ── */}
        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-12">
          <span
            className="font-mono text-xs"
            style={{ color: AMBER, opacity: 0.5 }}
          >
            01
          </span>
          <span
            className="w-10 h-px"
            style={{ background: AMBER, opacity: 0.3 }}
          />
          <GlitchText
            text="ABOUT // OPERATOR DOSSIER"
            className="text-xs font-mono tracking-[0.15em]"
            style={{ color: a(0.6) }}
            delay={400}
          />
          <span
            className="flex-1 h-px hidden md:block"
            style={{
              background: `linear-gradient(90deg, ${a(0.2)}, transparent)`,
            }}
          />
          <span
            className="font-mono hidden md:block"
            style={{ fontSize: "9px", color: a(0.25), letterSpacing: "0.12em" }}
          >
            CLEARANCE: LEVEL 5
          </span>
        </motion.div>

        {/* ── Two-column layout: Code Panel + Dossier ── */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* ═══════════════ LEFT: IDE CODE PANEL ═══════════════ */}
          <motion.div ref={codeRef} variants={fadeUp} className="relative">
            <div
              className="relative overflow-hidden rounded-md"
              style={{
                background:
                  "linear-gradient(180deg, rgba(12,10,5,0.96), rgba(6,5,3,0.98))",
                border: `1px solid ${a(0.2)}`,
                boxShadow: `
                  0 0 80px ${a(0.08)},
                  0 0 160px ${a(0.03)},
                  inset 0 1px 0 ${a(0.1)}
                `,
              }}
            >
              {/* Title bar with window controls */}
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{
                  background: a(0.05),
                  borderBottom: `1px solid ${a(0.12)}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: "#ff5f57" }}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: "#ffbd2e" }}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: "#28ca41" }}
                    />
                  </div>
                  <span
                    className="ml-3 font-mono tracking-wider"
                    style={{ fontSize: "10px", color: a(0.5) }}
                  >
                    friday_server.cpp
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono tracking-widest"
                    style={{ fontSize: "8px", color: a(0.3) }}
                  >
                    UTF-8
                  </span>
                  <span
                    className="font-mono tracking-widest"
                    style={{ fontSize: "8px", color: a(0.3) }}
                  >
                    C++17
                  </span>
                  <motion.span
                    animate={{
                      background:
                        visibleChars < totalChars
                          ? ["#ffbd2e", "#ffbd2eaa", "#ffbd2e"]
                          : "#28ca41",
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      boxShadow: `0 0 4px ${
                        visibleChars < totalChars ? "#ffbd2e" : "#28ca41"
                      }`,
                    }}
                  />
                </div>
              </div>

              {/* Tab bar */}
              <div
                className="flex"
                style={{ borderBottom: `1px solid ${a(0.08)}` }}
              >
                <div
                  className="px-4 py-1.5 font-mono tracking-wider"
                  style={{
                    fontSize: "9px",
                    color: AMBER,
                    borderBottom: `2px solid ${AMBER}`,
                    background: a(0.04),
                  }}
                >
                  friday_server.cpp
                </div>
                <div
                  className="px-4 py-1.5 font-mono tracking-wider"
                  style={{ fontSize: "9px", color: a(0.2) }}
                >
                  thread_pool.h
                </div>
                <div
                  className="px-4 py-1.5 font-mono tracking-wider hidden sm:block"
                  style={{ fontSize: "9px", color: a(0.2) }}
                >
                  memory_pool.h
                </div>
              </div>

              {/* Code area */}
              <div
                className="flex p-3 overflow-hidden"
                style={{ minHeight: "360px", maxHeight: "480px" }}
              >
                <LineNumbers count={lineCount} activeUpTo={activeLineCount} />
                <pre
                  className="pl-3 font-mono leading-relaxed whitespace-pre overflow-hidden flex-1"
                  style={{ fontSize: "10px", color: a(0.6) }}
                >
                  <HighlightedCode
                    code={TCP_SERVER_CODE}
                    visibleChars={visibleChars}
                  />
                  {/* Blinking cursor */}
                  {visibleChars < totalChars && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                      style={{
                        display: "inline-block",
                        width: "7px",
                        height: "13px",
                        background: AMBER,
                        verticalAlign: "middle",
                        marginLeft: "1px",
                        boxShadow: `0 0 8px ${AMBER}`,
                      }}
                    />
                  )}
                </pre>
              </div>

              {/* Bottom status bar */}
              <div
                className="flex items-center justify-between px-4 py-1.5"
                style={{
                  borderTop: `1px solid ${a(0.08)}`,
                  background: a(0.03),
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono"
                    style={{ fontSize: "8px", color: a(0.3) }}
                  >
                    Ln {activeLineCount}, Col {cursorCol}
                  </span>
                  <span
                    className="w-px h-2.5"
                    style={{ background: a(0.15) }}
                  />
                  <span
                    className="font-mono"
                    style={{ fontSize: "8px", color: a(0.25) }}
                  >
                    {visibleChars}/{totalChars} chars
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono hidden sm:block"
                    style={{ fontSize: "8px", color: a(0.2) }}
                  >
                    {visibleChars >= totalChars
                      ? "COMPILATION: READY"
                      : "WRITING..."}
                  </span>
                  <span
                    className="font-mono"
                    style={{ fontSize: "8px", color: a(0.3) }}
                  >
                    STARK OS v7.4
                  </span>
                </div>
              </div>

              {/* Scan line sweep */}
              <div
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                  top: `${scanY}%`,
                  height: "2px",
                  background: `linear-gradient(90deg, transparent, ${a(0.15)}, ${a(0.25)}, ${a(0.15)}, transparent)`,
                  boxShadow: `0 0 12px ${a(0.1)}`,
                  transition: "top 0.05s linear",
                }}
              />

              {/* Subtle inner glow */}
              <div
                className="absolute inset-0 pointer-events-none rounded-md"
                style={{ boxShadow: `inset 0 0 40px ${a(0.025)}` }}
              />

              {/* Corner brackets */}
              <span
                className="corner-bracket corner-tl"
                style={{ width: 14, height: 14 }}
              />
              <span
                className="corner-bracket corner-tr"
                style={{ width: 14, height: 14 }}
              />
              <span
                className="corner-bracket corner-bl"
                style={{ width: 14, height: 14 }}
              />
              <span
                className="corner-bracket corner-br"
                style={{ width: 14, height: 14 }}
              />
            </div>

            {/* Reflection glow beneath the panel */}
            <div
              className="absolute -bottom-8 left-[15%] right-[15%] h-16 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse, ${a(0.06)} 0%, transparent 70%)`,
                filter: "blur(12px)",
              }}
            />
          </motion.div>

          {/* ═══════════════ RIGHT: OPERATOR DOSSIER PANEL ═══════════════ */}
          <motion.div variants={fadeUp} className="relative">
            <div
              className="relative overflow-hidden rounded-md"
              style={{
                background:
                  "linear-gradient(180deg, rgba(12,10,5,0.92), rgba(6,5,3,0.96))",
                border: `1px solid ${a(0.15)}`,
                boxShadow: `0 0 50px ${a(0.05)}, inset 0 1px 0 ${a(0.08)}`,
              }}
            >
              {/* Dossier header bar */}
              <div
                className="px-5 py-3"
                style={{
                  background: a(0.05),
                  borderBottom: `1px solid ${a(0.12)}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: AMBER,
                        boxShadow: `0 0 8px ${AMBER}`,
                      }}
                    />
                    <GlitchText
                      text="OPERATOR PROFILE"
                      className="font-mono font-bold tracking-[0.2em]"
                      style={{ fontSize: "10px", color: AMBER }}
                      delay={600}
                    />
                  </div>
                  <span
                    className="font-mono"
                    style={{ fontSize: "8px", color: a(0.3) }}
                  >
                    FILE #0076-US
                  </span>
                </div>
              </div>

              {/* Top accent line */}
              <div
                className="h-px w-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${AMBER}, transparent)`,
                  opacity: 0.3,
                }}
              />

              <div className="p-5 space-y-5">
                {/* Subject name */}
                <div>
                  <div
                    className="font-mono tracking-[0.15em] mb-1.5"
                    style={{ fontSize: "9px", color: a(0.4) }}
                  >
                    SUBJECT NAME
                  </div>
                  <GlitchText
                    text="UTKARSH SHARMA"
                    as="h2"
                    className="font-display text-2xl md:text-3xl font-bold tracking-wider"
                    style={{ color: "#fff" }}
                    delay={800}
                    speed={40}
                  />
                  <div
                    className="mt-1 h-px"
                    style={{
                      background: `linear-gradient(90deg, ${AMBER}, transparent 60%)`,
                      opacity: 0.25,
                    }}
                  />
                </div>

                {/* Designation + Classification */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div
                      className="font-mono tracking-[0.15em] mb-1"
                      style={{ fontSize: "8px", color: a(0.35) }}
                    >
                      DESIGNATION
                    </div>
                    <div
                      className="font-mono font-semibold tracking-wider leading-tight"
                      style={{ fontSize: "11px", color: AMBER }}
                    >
                      SYSTEMS &amp; BACKEND
                      <br />
                      ENGINEER
                    </div>
                  </div>
                  <div>
                    <div
                      className="font-mono tracking-[0.15em] mb-1"
                      style={{ fontSize: "8px", color: a(0.35) }}
                    >
                      CLASSIFICATION
                    </div>
                    <div
                      className="font-mono tracking-wider leading-tight"
                      style={{ fontSize: "11px", color: a(0.7) }}
                    >
                      B.TECH
                      <br />
                      INFORMATION TECHNOLOGY
                    </div>
                  </div>
                </div>

                {/* Divider with label */}
                <div className="flex items-center gap-3">
                  <span
                    className="flex-1 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${a(0.15)}, transparent)`,
                    }}
                  />
                  <span
                    className="font-mono tracking-[0.15em] shrink-0"
                    style={{ fontSize: "7px", color: a(0.2) }}
                  >
                    PROFILE SUMMARY
                  </span>
                  <span
                    className="flex-1 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${a(0.15)}, transparent)`,
                    }}
                  />
                </div>

                {/* Bio paragraphs */}
                <div>
                  {profile.bio.map((para, i) => (
                    <motion.p
                      key={i}
                      variants={fadeUp}
                      className="font-body text-sm leading-relaxed mb-2.5"
                      style={{ color: a(0.6) }}
                    >
                      {para}
                    </motion.p>
                  ))}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  {STATS.map((stat) => (
                    <motion.div
                      key={stat.label}
                      variants={fadeUp}
                      className="relative p-3 rounded-sm overflow-hidden group"
                      style={{
                        background: a(0.04),
                        border: `1px solid ${a(0.1)}`,
                      }}
                    >
                      <div
                        className="font-mono tracking-[0.12em] mb-1"
                        style={{ fontSize: "7px", color: a(0.35) }}
                      >
                        {stat.icon} {stat.label}
                      </div>
                      <div
                        className="font-display text-lg font-bold"
                        style={{ color: AMBER }}
                      >
                        {stat.value}
                      </div>
                      {/* Corner accent */}
                      <div
                        className="absolute top-0 right-0 w-5 h-5"
                        style={{
                          borderRight: `1px solid ${a(0.15)}`,
                          borderTop: `1px solid ${a(0.15)}`,
                        }}
                      />
                      {/* Bottom fill on hover */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${a(0.15)}, transparent)`,
                        }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Specialization tags */}
                <div>
                  <div
                    className="font-mono tracking-[0.15em] mb-2.5"
                    style={{ fontSize: "8px", color: a(0.35) }}
                  >
                    SPECIALIZATIONS
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {TAGS.map((tag, i) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{
                          delay: 1.2 + i * 0.06,
                          duration: 0.4,
                        }}
                        className="font-mono px-2.5 py-1 rounded-sm cursor-default"
                        style={{
                          fontSize: "9px",
                          color: a(0.65),
                          background: a(0.06),
                          border: `1px solid ${a(0.1)}`,
                          transition:
                            "border-color 0.3s, color 0.3s, background 0.3s, box-shadow 0.3s",
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget;
                          el.style.borderColor = AMBER;
                          el.style.color = AMBER;
                          el.style.background = a(0.12);
                          el.style.boxShadow = `0 0 14px ${a(0.12)}`;
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget;
                          el.style.borderColor = a(0.1);
                          el.style.color = a(0.65);
                          el.style.background = a(0.06);
                          el.style.boxShadow = "none";
                        }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div
                  className="h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${a(0.15)}, transparent)`,
                  }}
                />

                {/* Status readout row */}
                <div className="grid grid-cols-3 gap-2">
                  <StatusItem label="CLEARANCE" value="ALPHA" />
                  <StatusItem label="STATUS" value="ACTIVE" active />
                  <StatusItem label="THREAT LVL" value="MINIMAL" />
                </div>

                {/* Micro system readout */}
                <div
                  className="flex items-center justify-between pt-2"
                  style={{ borderTop: `1px solid ${a(0.06)}` }}
                >
                  <span
                    className="font-mono"
                    style={{ fontSize: "7px", color: a(0.2), letterSpacing: "0.1em" }}
                  >
                    BIOMETRIC SCAN: VERIFIED
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-mono"
                      style={{ fontSize: "7px", color: a(0.2), letterSpacing: "0.1em" }}
                    >
                      UPLINK
                    </span>
                    <motion.span
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="w-1 h-1 rounded-full"
                      style={{ background: "#28ca41" }}
                    />
                  </div>
                </div>
              </div>

              {/* Corner brackets */}
              <span
                className="corner-bracket corner-tl"
                style={{ width: 14, height: 14 }}
              />
              <span
                className="corner-bracket corner-tr"
                style={{ width: 14, height: 14 }}
              />
              <span
                className="corner-bracket corner-bl"
                style={{ width: 14, height: 14 }}
              />
              <span
                className="corner-bracket corner-br"
                style={{ width: 14, height: 14 }}
              />

              {/* Dossier panel scan line */}
              <motion.div
                animate={{ top: ["0%", "100%"] }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                  height: "1px",
                  background: `linear-gradient(90deg, transparent, ${a(0.12)}, transparent)`,
                }}
              />
            </div>

            {/* Reflection glow */}
            <div
              className="absolute -bottom-6 left-[20%] right-[20%] h-12 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse, ${a(0.05)} 0%, transparent 70%)`,
                filter: "blur(10px)",
              }}
            />
          </motion.div>
        </div>

        {/* ═══════════════ BELOW: Auxiliary Code Modules (3D perspective) ═══════════════ */}
        <motion.div variants={fadeUp} className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <span
              className="font-mono tracking-[0.15em]"
              style={{ fontSize: "9px", color: a(0.35) }}
            >
              AUXILIARY CODE MODULES
            </span>
            <span
              className="flex-1 h-px"
              style={{
                background: `linear-gradient(90deg, ${a(0.15)}, transparent)`,
              }}
            />
            <span
              className="font-mono tracking-widest"
              style={{ fontSize: "7px", color: a(0.2) }}
            >
              2 MODULES LOADED
            </span>
          </div>

          <div
            className="grid md:grid-cols-2 gap-6"
            style={{ perspective: "1000px" }}
          >
            <FloatingCodePanel
              code={THREAD_POOL_CODE}
              label="THREAD POOL // concurrency.h"
              delay={0.3}
              rotateY={-5}
              rotateX={3}
            />
            <FloatingCodePanel
              code={MEMORY_POOL_CODE}
              label="MEMORY POOL // allocator.h"
              delay={0.5}
              rotateY={5}
              rotateX={-2}
            />
          </div>
        </motion.div>

        {/* ── Bottom system readout ── */}
        <motion.div
          variants={fadeIn}
          className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
          style={{ borderTop: `1px solid ${a(0.08)}`, paddingTop: "1rem" }}
        >
          <div className="flex items-center gap-4">
            <span
              className="font-mono tracking-widest"
              style={{ fontSize: "8px", color: a(0.2) }}
            >
              F.R.I.D.A.Y. OS v7.4.2
            </span>
            <span
              className="w-1 h-1 rounded-full hidden sm:block"
              style={{ background: a(0.2) }}
            />
            <span
              className="font-mono tracking-widest hidden sm:block"
              style={{ fontSize: "8px", color: a(0.2) }}
            >
              OPERATOR DOSSIER LOADED
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="font-mono tracking-widest"
              style={{ fontSize: "8px", color: a(0.2) }}
            >
              SEC PROTOCOL: ACTIVE
            </span>
            <motion.span
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#28ca41" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
