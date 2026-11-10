import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "@/hooks/useSound";

interface TerminalLine {
  type: "system" | "input" | "output" | "error";
  text: string;
}

const WELCOME_LINES: TerminalLine[] = [
  { type: "system", text: "STARK INDUSTRIES COMM TERMINAL v4.2.0" },
  { type: "system", text: "Encryption: AES-256 | Status: SECURE" },
  { type: "system", text: "─────────────────────────────────────" },
  { type: "output", text: "Available commands:" },
  { type: "output", text: "  email    — Open email client" },
  { type: "output", text: "  github   — Open GitHub profile" },
  { type: "output", text: "  linkedin — Open LinkedIn profile" },
  { type: "output", text: "  whoami   — About Utkarsh" },
  { type: "output", text: "  clear    — Clear terminal" },
  { type: "output", text: "  help     — Show this message" },
  { type: "system", text: "" },
];

const RESPONSES: Record<string, TerminalLine[]> = {
  email: [
    { type: "system", text: "Opening secure channel to us76201@gmail.com..." },
    { type: "output", text: "Email client launched. Standing by." },
  ],
  github: [
    { type: "system", text: "Accessing GitHub repository index..." },
    { type: "output", text: "Connection established: github.com/Utkarsh636" },
  ],
  linkedin: [
    { type: "system", text: "Connecting to LinkedIn neural network..." },
    { type: "output", text: "Profile link activated." },
  ],
  whoami: [
    { type: "output", text: "Utkarsh Sharma" },
    { type: "output", text: "Systems & Backend Engineer | C++ Specialist" },
    { type: "output", text: "B.Tech IT @ SRMS CET" },
    { type: "output", text: 'Specialisation: "Building the layer beneath everything."' },
  ],
  help: WELCOME_LINES.slice(3),
};

const URLS: Record<string, string> = {
  email: "mailto:us76201@gmail.com",
  github: "https://github.com/Utkarsh636",
  linkedin: "https://www.linkedin.com/in/utkarsh-sharma-ab12ba380/",
};

/**
 * Interactive terminal-style contact form.
 * Users type commands to open email / social links.
 */
export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>(WELCOME_LINES);
  const [input, setInput] = useState("");
  const [typingLine, setTypingLine] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, typingLine]);

  function processCommand(cmd: string) {
    const trimmed = cmd.trim().toLowerCase();
    playSound("click");

    // Echo the command
    const newLines: TerminalLine[] = [
      ...lines,
      { type: "input", text: `> ${cmd}` },
    ];

    if (trimmed === "clear") {
      setLines(WELCOME_LINES);
      return;
    }

    const response = RESPONSES[trimmed];
    if (response) {
      // Typewriter effect for response
      setLines(newLines);
      let i = 0;
      const interval = setInterval(() => {
        if (i < response.length) {
          setTypingLine(response[i].text);
          setLines((prev) => [...prev, response[i]]);
          playSound("type");
          i++;
        } else {
          setTypingLine(null);
          clearInterval(interval);
          // Open URL if applicable
          if (URLS[trimmed]) {
            setTimeout(() => {
              window.open(URLS[trimmed], trimmed === "email" ? "_self" : "_blank");
            }, 400);
          }
        }
      }, 150);
    } else {
      setLines([
        ...newLines,
        {
          type: "error",
          text: `Command not found: "${trimmed}". Type "help" for available commands.`,
        },
      ]);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && input.trim()) {
      processCommand(input);
      setInput("");
    }
  }

  return (
    <motion.div
      className="w-full rounded-sm overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: "rgba(5, 5, 8, 0.85)",
        border: "1px solid rgba(var(--accent-rgb), 0.15)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{ borderBottom: "1px solid rgba(var(--accent-rgb), 0.1)" }}
      >
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500/60" />
          <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
          <span className="w-2 h-2 rounded-full bg-green-500/60" />
        </div>
        <span
          className="font-mono text-[9px] tracking-[0.2em] uppercase opacity-40 ml-2"
          style={{ color: "var(--accent)" }}
        >
          COMM-TERMINAL
        </span>
        <span className="ml-auto font-mono text-[9px] opacity-25 animate-hud-blink"
          style={{ color: "var(--accent)" }}
        >
          SECURE
        </span>
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        className="p-4 font-mono text-xs leading-relaxed overflow-y-auto"
        style={{ maxHeight: 320, minHeight: 200 }}
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence>
          {lines.map((line, i) => (
            <motion.div
              key={`${i}-${line.text}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="mb-0.5"
              style={{
                color:
                  line.type === "system"
                    ? "rgba(var(--accent-rgb), 0.5)"
                    : line.type === "input"
                      ? "var(--accent)"
                      : line.type === "error"
                        ? "#ff4444"
                        : "rgba(224, 228, 240, 0.7)",
              }}
            >
              {line.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Input line */}
        <div className="flex items-center gap-2 mt-1">
          <span style={{ color: "var(--accent)" }} className="opacity-70">
            {">"}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none font-mono text-xs caret-[var(--accent)]"
            style={{ color: "var(--text-primary)" }}
            placeholder="type a command..."
            spellCheck={false}
            autoComplete="off"
          />
          <span
            className="w-2 h-4 animate-hud-blink"
            style={{ background: "var(--accent)", opacity: 0.6 }}
          />
        </div>
      </div>

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, var(--accent-glow), transparent)",
        }}
      />
    </motion.div>
  );
}
