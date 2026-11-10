"use client";

import { motion } from "framer-motion";
import { profile } from "@/data/profile";
import GlitchText from "@/components/ui/GlitchText";

/* ═══════════════════════════════════════════════════════════
   CONTACT SECTION — "ESTABLISH CONNECTION"
   Cinematic Iron-Man junction-box + frosted-glass panel
   ═══════════════════════════════════════════════════════════ */

const CABLE_COLORS = {
  cyan: "#00d4ff",
  gold: "#ffd23f",
  red: "#ff1e2d",
  amber: "#ff9e2c",
} as const;

/* ── animation presets ── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ── keyframes injected via <style> ── */
const keyframes = `
@keyframes cableDash {
  to { stroke-dashoffset: -60; }
}
@keyframes cableDashReverse {
  to { stroke-dashoffset: 60; }
}
@keyframes energyPulse {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 0.9; }
}
@keyframes fogDrift {
  0% { transform: translateX(0); }
  100% { transform: translateX(80px); }
}
@keyframes scanLine {
  0% { top: -2px; }
  100% { top: 100%; }
}
@keyframes dataStream {
  0% { opacity: 0; transform: translateY(4px); }
  20% { opacity: 0.7; }
  100% { opacity: 0; transform: translateY(-16px); }
}
@keyframes terminalBlink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 12px rgba(0, 212, 255, 0.15); }
  50% { box-shadow: 0 0 28px rgba(0, 212, 255, 0.35); }
}
`;

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function ContactSection() {
  return (
    <section
      id="contact"
      className="section"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* injected keyframes */}
      <style>{keyframes}</style>

      {/* ── atmospheric fog overlays ── */}
      <FogOverlay position="top" />
      <FogOverlay position="bottom" />

      {/* ── ambient scan line ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "2px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.12) 30%, rgba(0,212,255,0.2) 50%, rgba(0,212,255,0.12) 70%, transparent 100%)",
            animation: "scanLine 6s linear infinite",
          }}
        />
      </div>

      {/* ── main content wrapper ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        style={{
          position: "relative",
          zIndex: 5,
          width: "100%",
          maxWidth: "1280px",
          padding: "0 24px",
        }}
      >
        {/* section label */}
        <motion.div
          variants={fadeUp}
          custom={0}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "11px",
              color: CABLE_COLORS.cyan,
              opacity: 0.5,
            }}
          >
            04
          </span>
          <span
            style={{
              width: "32px",
              height: "1px",
              background: CABLE_COLORS.cyan,
              opacity: 0.3,
            }}
          />
          <span
            style={{
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.12em",
              opacity: 0.5,
              color: "var(--text-primary, #fff)",
            }}
          >
            CONTACT
          </span>
        </motion.div>

        {/* ── two-column layout: junction box | panel ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "0",
            alignItems: "stretch",
          }}
          className="contact-layout"
        >
          {/* responsive style override */}
          <style>{`
            @media (min-width: 900px) {
              .contact-layout {
                grid-template-columns: 320px 1fr !important;
                gap: 0 !important;
              }
            }
          `}</style>

          {/* ═══ LEFT — Junction Box + Cables ═══ */}
          <motion.div
            variants={scaleIn}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "520px",
            }}
            className="junction-wrapper"
          >
            <style>{`
              @media (max-width: 899px) {
                .junction-wrapper { display: none !important; }
              }
            `}</style>
            <JunctionBoxWithCables />
          </motion.div>

          {/* ═══ RIGHT — Frosted Glass Panel ═══ */}
          <motion.div variants={fadeUp} custom={2}>
            <ContactPanel />
          </motion.div>
        </div>

        {/* ── footer ── */}
        <motion.footer
          variants={fadeUp}
          custom={6}
          style={{
            marginTop: "64px",
            paddingTop: "32px",
            borderTop: "1px solid rgba(0,212,255,0.06)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "10px",
              opacity: 0.2,
              letterSpacing: "0.12em",
              color: "var(--text-primary, #fff)",
              marginBottom: "8px",
            }}
          >
            &copy; 2026 UTKARSH SHARMA
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "9px",
              opacity: 0.12,
              letterSpacing: "0.2em",
              color: "var(--text-primary, #fff)",
            }}
          >
            ALL SYSTEMS NOMINAL &mdash; DESIGNED WITH THREE.JS + REACT
          </div>
        </motion.footer>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOG OVERLAY
   ═══════════════════════════════════════════════════════════ */
function FogOverlay({ position }: { position: "top" | "bottom" }) {
  const isTop = position === "top";
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        [isTop ? "top" : "bottom"]: 0,
        height: "220px",
        pointerEvents: "none",
        zIndex: 2,
        background: isTop
          ? "linear-gradient(180deg, rgba(10,10,14,0.95) 0%, rgba(10,10,14,0.4) 40%, transparent 100%)"
          : "linear-gradient(0deg, rgba(10,10,14,0.95) 0%, rgba(10,10,14,0.4) 40%, transparent 100%)",
      }}
    >
      {/* drifting fog particles */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${20 + i * 30}%`,
            top: isTop ? `${30 + i * 15}%` : `${10 + i * 20}%`,
            width: `${180 + i * 60}px`,
            height: `${40 + i * 20}px`,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, rgba(0,212,255,${0.015 + i * 0.005}) 0%, transparent 70%)`,
            animation: `fogDrift ${8 + i * 3}s ease-in-out infinite alternate`,
            animationDelay: `${i * 2}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   JUNCTION BOX WITH ENERGY CABLES
   ═══════════════════════════════════════════════════════════ */
function JunctionBoxWithCables() {
  const colors = Object.values(CABLE_COLORS);
  const cableNames = ["JARVIS", "FRIDAY", "ULTRON", "VISION"];

  /* cable paths — originate from box center-right, sweep to the right edge */
  const paths = [
    "M 160 180 C 200 180, 220 100, 300 90",
    "M 160 210 C 210 210, 240 170, 300 190",
    "M 160 240 C 200 240, 230 290, 300 300",
    "M 160 270 C 210 270, 250 340, 300 380",
  ];

  return (
    <div style={{ position: "relative", width: "300px", height: "460px" }}>
      <svg
        viewBox="0 0 300 460"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        {/* ── ambient glow behind junction box ── */}
        <defs>
          <radialGradient id="jboxGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={CABLE_COLORS.cyan} stopOpacity="0.12" />
            <stop offset="100%" stopColor={CABLE_COLORS.cyan} stopOpacity="0" />
          </radialGradient>
          <filter id="cableGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="heavyGlow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* glow */}
        <ellipse cx="120" cy="230" rx="120" ry="140" fill="url(#jboxGlow)" />

        {/* ── Junction Box body ── */}
        {/* outer shell */}
        <rect
          x="60"
          y="150"
          width="100"
          height="160"
          rx="6"
          fill="#111318"
          stroke="#2a2e38"
          strokeWidth="2"
        />
        {/* inner panel */}
        <rect
          x="70"
          y="160"
          width="80"
          height="140"
          rx="3"
          fill="#0c0e12"
          stroke="#1e2028"
          strokeWidth="1"
        />

        {/* bolts — corners */}
        {[
          [68, 158],
          [152, 158],
          [68, 302],
          [152, 302],
        ].map(([cx, cy], i) => (
          <g key={`bolt-${i}`}>
            <circle cx={cx} cy={cy} r="5" fill="#1a1d24" stroke="#333842" strokeWidth="1" />
            <line
              x1={cx - 2}
              y1={cy}
              x2={cx + 2}
              y2={cy}
              stroke="#4a4f5c"
              strokeWidth="1"
            />
          </g>
        ))}

        {/* status indicator lights on box face */}
        {colors.map((color, i) => (
          <g key={`indicator-${i}`}>
            <circle
              cx={88 + i * 14}
              cy={175}
              r="3"
              fill={color}
              opacity="0.8"
              style={{ animation: `energyPulse ${2 + i * 0.5}s ease-in-out infinite` }}
            />
            <circle cx={88 + i * 14} cy={175} r="5" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
          </g>
        ))}

        {/* port labels */}
        {cableNames.map((name, i) => (
          <text
            key={`label-${i}`}
            x="82"
            y={200 + i * 28}
            fill={colors[i]}
            fontSize="7"
            fontFamily="monospace"
            opacity="0.6"
          >
            {name}
          </text>
        ))}

        {/* port outlets (small rectangles) */}
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={`port-${i}`}
            x="142"
            y={193 + i * 28}
            width="18"
            height="8"
            rx="2"
            fill="#0c0e12"
            stroke={colors[i]}
            strokeWidth="1"
            opacity="0.5"
          />
        ))}

        {/* STARK INDUSTRIES plate */}
        <rect x="78" y="284" width="64" height="12" rx="1" fill="#0f1116" stroke="#2a2e38" strokeWidth="0.5" />
        <text x="82" y="293" fill="#4a4f5c" fontSize="6" fontFamily="monospace" letterSpacing="1.5">
          STARK IND.
        </text>

        {/* ── Energy Cables ── */}
        {paths.map((d, i) => (
          <g key={`cable-${i}`} filter="url(#cableGlow)">
            {/* cable shadow/glow layer */}
            <path
              d={d}
              stroke={colors[i]}
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              opacity="0.08"
            />
            {/* cable body */}
            <path
              d={d}
              stroke={colors[i]}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.45"
            />
            {/* flowing energy dashes */}
            <path
              d={d}
              stroke={colors[i]}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
              strokeDasharray="8 12"
              style={{
                animation: `${i % 2 === 0 ? "cableDash" : "cableDashReverse"} ${1.5 + i * 0.3}s linear infinite`,
              }}
            />
          </g>
        ))}

        {/* energy node dots at cable endpoints (right side) */}
        {[
          [300, 90],
          [300, 190],
          [300, 300],
          [300, 380],
        ].map(([cx, cy], i) => (
          <circle
            key={`node-${i}`}
            cx={cx}
            cy={cy}
            r="4"
            fill={colors[i]}
            opacity="0.7"
            filter="url(#heavyGlow)"
            style={{ animation: `energyPulse ${2 + i * 0.4}s ease-in-out infinite` }}
          />
        ))}

        {/* decorative circuit traces */}
        <path
          d="M 110 315 L 110 340 L 90 340 L 90 360"
          stroke="#1e2028"
          strokeWidth="0.5"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M 130 315 L 130 350 L 150 350 L 150 370"
          stroke="#1e2028"
          strokeWidth="0.5"
          fill="none"
          opacity="0.5"
        />
      </svg>

      {/* ── System readout under the box ── */}
      <div
        style={{
          position: "absolute",
          bottom: "12px",
          left: "20px",
          right: "60px",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "8px",
          color: CABLE_COLORS.cyan,
          opacity: 0.3,
          lineHeight: 1.8,
        }}
      >
        <div>PWR: ████████░░ 82%</div>
        <div>SIG: NOMINAL</div>
        <div>UPLINK: ACTIVE</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FROSTED GLASS CONTACT PANEL
   ═══════════════════════════════════════════════════════════ */
function ContactPanel() {
  return (
    <div
      style={{
        position: "relative",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: "40px 36px 36px",
        overflow: "hidden",
        animation: "glowPulse 6s ease-in-out infinite",
      }}
    >
      {/* corner brackets */}
      <CornerBrackets />

      {/* scan line inside panel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          borderRadius: "12px",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(0,212,255,0.08), transparent)",
            animation: "scanLine 4s linear infinite",
            animationDelay: "2s",
          }}
        />
      </div>

      {/* ── Header area ── */}
      <div style={{ marginBottom: "8px" }}>
        <div
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "9px",
            color: CABLE_COLORS.cyan,
            opacity: 0.4,
            letterSpacing: "0.2em",
            marginBottom: "12px",
          }}
        >
          // STARK NETWORK v4.7.2 &mdash; SECURE CHANNEL
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display, sans-serif)",
            fontSize: "clamp(24px, 3.2vw, 36px)",
            fontWeight: 700,
            color: "var(--text-primary, #fff)",
            letterSpacing: "0.04em",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          <GlitchText text="ESTABLISH CONNECTION" speed={25} scrambleDuration={350} delay={300} />
        </h2>
      </div>

      {/* subheading */}
      <p
        style={{
          fontFamily: "var(--font-body, sans-serif)",
          fontSize: "13px",
          color: "var(--text-primary, #ccc)",
          opacity: 0.45,
          margin: "0 0 28px 0",
          maxWidth: "420px",
          lineHeight: 1.6,
        }}
      >
        Ready to discuss systems architecture, backend engineering, or your next big project?
        Open a secure channel below.
      </p>

      {/* system status bar */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "24px",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "9px",
          letterSpacing: "0.1em",
        }}
      >
        <StatusIndicator label="ENCRYPTION" value="AES-256" color="#4ade80" />
        <StatusIndicator label="LATENCY" value="12ms" color={CABLE_COLORS.cyan} />
        <StatusIndicator label="STATUS" value="ONLINE" color={CABLE_COLORS.gold} />
      </div>

      {/* ── Message textarea ── */}
      <div style={{ marginBottom: "28px" }}>
        <label
          style={{
            display: "block",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "9px",
            color: CABLE_COLORS.cyan,
            opacity: 0.5,
            letterSpacing: "0.15em",
            marginBottom: "8px",
          }}
        >
          TRANSMISSION MESSAGE
        </label>
        <div
          style={{
            position: "relative",
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(0,212,255,0.1)",
            borderRadius: "6px",
            padding: "16px",
            minHeight: "100px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "12px",
              color: "var(--text-primary, #ccc)",
              opacity: 0.3,
              lineHeight: 1.8,
              whiteSpace: "pre-line",
            }}
          >
            {`> SECURE CHANNEL ESTABLISHED\n> Awaiting transmission...\n> Use direct links below to connect`}
          </div>
          {/* blinking cursor */}
          <span
            style={{
              display: "inline-block",
              width: "7px",
              height: "14px",
              background: CABLE_COLORS.cyan,
              opacity: 0.6,
              verticalAlign: "text-bottom",
              marginLeft: "2px",
              animation: "terminalBlink 1s step-end infinite",
            }}
          />
          {/* corner accents */}
          <div style={{ position: "absolute", top: "6px", left: "6px", width: "8px", height: "8px", borderLeft: `1px solid ${CABLE_COLORS.cyan}`, borderTop: `1px solid ${CABLE_COLORS.cyan}`, opacity: 0.2 }} />
          <div style={{ position: "absolute", bottom: "6px", right: "6px", width: "8px", height: "8px", borderRight: `1px solid ${CABLE_COLORS.cyan}`, borderBottom: `1px solid ${CABLE_COLORS.cyan}`, opacity: 0.2 }} />
        </div>
      </div>

      {/* ── Link buttons ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <LinkButton
          href={profile.github}
          label="GITHUB"
          sublabel="Utkarsh636"
          color={CABLE_COLORS.cyan}
          icon={<GithubIcon />}
        />
        <LinkButton
          href={profile.linkedin}
          label="LINKEDIN"
          sublabel="utkarsh-sharma"
          color={CABLE_COLORS.gold}
          icon={<LinkedInIcon />}
        />
        <LinkButton
          href={`mailto:${profile.email}`}
          label="EMAIL"
          sublabel={profile.email}
          color={CABLE_COLORS.red}
          icon={<EmailIcon />}
        />
      </div>

      {/* availability */}
      <div
        style={{
          marginTop: "28px",
          padding: "14px 16px",
          background: "rgba(0,0,0,0.2)",
          border: "1px solid rgba(74,222,128,0.1)",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#4ade80",
            boxShadow: "0 0 12px rgba(74,222,128,0.5)",
            animation: "energyPulse 2s ease-in-out infinite",
          }}
        />
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "10px",
              color: "#4ade80",
              letterSpacing: "0.15em",
              marginBottom: "2px",
            }}
          >
            AVAILABLE FOR DEPLOYMENT
          </div>
          <div
            style={{
              fontFamily: "var(--font-body, sans-serif)",
              fontSize: "11px",
              color: "var(--text-primary, #ccc)",
              opacity: 0.35,
            }}
          >
            Open to internships &amp; collaborations
          </div>
        </div>
      </div>

      {/* bottom data readout */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "8px",
          color: "var(--text-primary, #ccc)",
          opacity: 0.15,
          letterSpacing: "0.1em",
        }}
      >
        <span>NODE: STARK-SEC-04</span>
        <span>FREQ: 2.4 GHz</span>
        <span>PING: OK</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LINK BUTTON
   ═══════════════════════════════════════════════════════════ */
function LinkButton({
  href,
  label,
  sublabel,
  color,
  icon,
}: {
  href: string;
  label: string;
  sublabel: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "18px 20px",
        background: "rgba(0,0,0,0.3)",
        border: `1px solid ${color}22`,
        borderRadius: "8px",
        textDecoration: "none",
        cursor: "pointer",
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = `${color}66`;
        el.style.boxShadow = `0 0 24px ${color}33, inset 0 0 24px ${color}08`;
        el.style.background = `${color}0a`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = `${color}22`;
        el.style.boxShadow = "none";
        el.style.background = "rgba(0,0,0,0.3)";
      }}
    >
      {/* left glow accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "15%",
          bottom: "15%",
          width: "2px",
          background: color,
          opacity: 0.4,
          borderRadius: "1px",
        }}
      />

      {/* icon container */}
      <div
        style={{
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${color}10`,
          border: `1px solid ${color}20`,
          borderRadius: "6px",
          flexShrink: 0,
        }}
      >
        <div style={{ color, width: "20px", height: "20px" }}>{icon}</div>
      </div>

      {/* text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-primary, #fff)",
            letterSpacing: "0.1em",
            marginBottom: "2px",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "10px",
            color: "var(--text-primary, #ccc)",
            opacity: 0.35,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {sublabel}
        </div>
      </div>

      {/* arrow */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        style={{ opacity: 0.3, flexShrink: 0 }}
      >
        <path
          d="M6 3L11 8L6 13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--text-primary, #ccc)" }}
        />
      </svg>
    </motion.a>
  );
}

/* ═══════════════════════════════════════════════════════════
   CORNER BRACKETS
   ═══════════════════════════════════════════════════════════ */
function CornerBrackets() {
  const style = (
    top?: string,
    right?: string,
    bottom?: string,
    left?: string,
    bTop?: boolean,
    bRight?: boolean,
    bBottom?: boolean,
    bLeft?: boolean
  ): React.CSSProperties => ({
    position: "absolute",
    top,
    right,
    bottom,
    left,
    width: "20px",
    height: "20px",
    borderTop: bTop ? `1px solid rgba(0,212,255,0.2)` : "none",
    borderRight: bRight ? `1px solid rgba(0,212,255,0.2)` : "none",
    borderBottom: bBottom ? `1px solid rgba(0,212,255,0.2)` : "none",
    borderLeft: bLeft ? `1px solid rgba(0,212,255,0.2)` : "none",
    pointerEvents: "none",
  });

  return (
    <>
      <div style={style("10px", undefined, undefined, "10px", true, false, false, true)} />
      <div style={style("10px", "10px", undefined, undefined, true, true, false, false)} />
      <div style={style(undefined, undefined, "10px", "10px", false, false, true, true)} />
      <div style={style(undefined, "10px", "10px", undefined, false, true, true, false)} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   STATUS INDICATOR
   ═══════════════════════════════════════════════════════════ */
function StatusIndicator({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span
        style={{
          width: "4px",
          height: "4px",
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 6px ${color}`,
        }}
      />
      <span style={{ color: "var(--text-primary, #ccc)", opacity: 0.3 }}>{label}:</span>
      <span style={{ color, opacity: 0.7 }}>{value}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INLINE SVG ICONS
   ═══════════════════════════════════════════════════════════ */
function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 4L12 13L2 4" />
    </svg>
  );
}
