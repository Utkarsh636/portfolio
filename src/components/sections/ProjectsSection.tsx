import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { projects } from "@/data/projects";
import GlitchText from "@/components/ui/GlitchText";

/* ================================================================
   ULTRON PROJECTS SECTION
   Crimson/red themed with architecture diagrams, floating 3D panels,
   ember particles, atmospheric fog, and dense HUD telemetry.
   ================================================================ */

// ── Crimson palette ──
const CRIMSON = "#ff1e2d";
const CRIMSON_DIM = "rgba(255,30,45,0.12)";
const CRIMSON_GLOW = "rgba(255,30,45,0.35)";
const CRIMSON_RGB = "255,30,45";

// ── Animation variants ──
const sectionFade = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, staggerChildren: 0.2 },
  },
};

const panelVariant = (tiltY: number, delay: number, isCenter: boolean) => ({
  hidden: {
    opacity: 0,
    y: 120,
    scale: 0.85,
    rotateY: tiltY * 2,
    rotateX: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: isCenter ? 1.02 : 1,
    rotateY: tiltY,
    rotateX: 0,
    transition: {
      duration: 1.2,
      delay,
      ease: [0.16, 1, 0.3, 1],
    },
  },
});

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

// ── Ember particle component (CSS animated) ──
function EmberParticles() {
  const embers = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 4 + Math.random() * 5,
      size: 1 + Math.random() * 3,
      drift: (Math.random() - 0.5) * 80,
      opacity: 0.3 + Math.random() * 0.7,
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {embers.map((e) => (
        <div
          key={e.id}
          style={{
            position: "absolute",
            bottom: "-5%",
            left: `${e.left}%`,
            width: `${e.size}px`,
            height: `${e.size}px`,
            borderRadius: "50%",
            background: CRIMSON,
            boxShadow: `0 0 ${e.size * 3}px ${CRIMSON}, 0 0 ${e.size * 6}px rgba(${CRIMSON_RGB},0.4)`,
            opacity: e.opacity,
            animation: `emberFloat ${e.duration}s ${e.delay}s ease-out infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes emberFloat {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          70% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-110vh) translateX(var(--drift, 40px)) scale(0.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// ── Reactor glow behind center panel ──
function ReactorGlow() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
      {/* Outer glow */}
      <div
        style={{
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${CRIMSON_RGB},0.18) 0%, rgba(${CRIMSON_RGB},0.06) 40%, transparent 70%)`,
          filter: "blur(40px)",
          animation: "reactorPulse 3s ease-in-out infinite",
        }}
      />
      {/* Core */}
      <div
        style={{
          position: "absolute",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${CRIMSON_RGB},0.5) 0%, rgba(${CRIMSON_RGB},0.15) 50%, transparent 70%)`,
          boxShadow: `0 0 80px rgba(${CRIMSON_RGB},0.4), 0 0 160px rgba(${CRIMSON_RGB},0.15)`,
          animation: "reactorPulse 2s ease-in-out infinite alternate",
        }}
      />
      {/* Ring */}
      <div
        style={{
          position: "absolute",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          border: `1px solid rgba(${CRIMSON_RGB},0.15)`,
          animation: "reactorRingSpin 12s linear infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          border: `1px solid rgba(${CRIMSON_RGB},0.08)`,
          animation: "reactorRingSpin 18s linear infinite reverse",
        }}
      />
      <style>{`
        @keyframes reactorPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes reactorRingSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ── Horizontal data strip ──
function DataStrip({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-2" style={{ fontFamily: "var(--font-mono)" }}>
      <span style={{ fontSize: "8px", color: `rgba(${CRIMSON_RGB},0.4)`, letterSpacing: "0.1em" }}>
        {label}
      </span>
      <span
        style={{
          flex: 1,
          height: "1px",
          background: `linear-gradient(90deg, rgba(${CRIMSON_RGB},0.15), transparent)`,
        }}
      />
      <span style={{ fontSize: "9px", color: color || CRIMSON, opacity: 0.8 }}>{value}</span>
    </div>
  );
}

// ── Connection line between panels ──
function ConnectionLine({ from, to }: { from: "left" | "center"; to: "center" | "right" }) {
  const isLeft = from === "left";
  return (
    <div
      className="hidden lg:flex items-center justify-center"
      style={{
        position: "relative",
        width: "40px",
        flexShrink: 0,
        alignSelf: "center",
      }}
    >
      {/* Main line */}
      <svg width="40" height="80" viewBox="0 0 40 80" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient
            id={`connGrad-${from}-${to}`}
            x1={isLeft ? "0" : "1"}
            y1="0"
            x2={isLeft ? "1" : "0"}
            y2="0"
          >
            <stop offset="0%" stopColor={CRIMSON} stopOpacity="0.5" />
            <stop offset="100%" stopColor={CRIMSON} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1="40"
          x2="40"
          y2="40"
          stroke={`url(#connGrad-${from}-${to})`}
          strokeWidth="1"
        />
        {/* Data flow dots */}
        <circle r="2" fill={CRIMSON} opacity="0.8">
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            path={isLeft ? "M 0 40 L 40 40" : "M 40 40 L 0 40"}
          />
          <animate attributeName="opacity" values="0;0.8;0" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle r="1.5" fill={CRIMSON} opacity="0.5">
          <animateMotion
            dur="2s"
            begin="0.7s"
            repeatCount="indefinite"
            path={isLeft ? "M 0 40 L 40 40" : "M 40 40 L 0 40"}
          />
          <animate
            attributeName="opacity"
            values="0;0.5;0"
            dur="2s"
            begin="0.7s"
            repeatCount="indefinite"
          />
        </circle>
        {/* Node dots */}
        <circle cx="0" cy="40" r="3" fill="none" stroke={CRIMSON} strokeWidth="1" opacity="0.4" />
        <circle cx="40" cy="40" r="3" fill="none" stroke={CRIMSON} strokeWidth="1" opacity="0.4" />
      </svg>
    </div>
  );
}

// ── SVG Architecture Diagram: SAMBAL (mobile app flow) ──
function SambalDiagram() {
  return (
    <svg
      viewBox="0 0 360 200"
      width="100%"
      height="100%"
      style={{ maxHeight: "220px" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="sambalGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="sambalLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={CRIMSON} stopOpacity="0.8" />
          <stop offset="100%" stopColor={CRIMSON} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* USER node */}
      <rect x="10" y="75" width="60" height="50" rx="4" fill={`rgba(${CRIMSON_RGB},0.08)`} stroke={CRIMSON} strokeWidth="0.8" strokeOpacity="0.5" />
      <circle cx="40" cy="88" r="8" fill="none" stroke={CRIMSON} strokeWidth="0.6" opacity="0.6" />
      <circle cx="40" cy="86" r="3" fill={CRIMSON} opacity="0.4" />
      <line x1="40" y1="92" x2="40" y2="100" stroke={CRIMSON} strokeWidth="0.6" opacity="0.4" />
      <line x1="34" y1="96" x2="46" y2="96" stroke={CRIMSON} strokeWidth="0.6" opacity="0.4" />
      <text x="40" y="118" fill={CRIMSON} fontSize="7" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.9">USER</text>

      {/* Arrow User -> App */}
      <line x1="70" y1="100" x2="105" y2="100" stroke="url(#sambalLine)" strokeWidth="1" filter="url(#sambalGlow)" />
      <polygon points="103,96 111,100 103,104" fill={CRIMSON} opacity="0.6" />
      <circle r="2" fill={CRIMSON} opacity="0.7">
        <animateMotion dur="2s" repeatCount="indefinite" path="M 70 100 L 105 100" />
      </circle>

      {/* FLUTTER APP node (phone shape) */}
      <rect x="112" y="60" width="56" height="80" rx="8" fill={`rgba(${CRIMSON_RGB},0.06)`} stroke={CRIMSON} strokeWidth="0.8" strokeOpacity="0.5" />
      <rect x="118" y="72" width="44" height="52" rx="2" fill={`rgba(${CRIMSON_RGB},0.04)`} stroke={CRIMSON} strokeWidth="0.4" strokeOpacity="0.3" />
      {/* Screen lines */}
      <line x1="122" y1="80" x2="148" y2="80" stroke={CRIMSON} strokeWidth="0.4" opacity="0.3" />
      <line x1="122" y1="86" x2="155" y2="86" stroke={CRIMSON} strokeWidth="0.4" opacity="0.2" />
      <line x1="122" y1="92" x2="150" y2="92" stroke={CRIMSON} strokeWidth="0.4" opacity="0.2" />
      <line x1="122" y1="98" x2="145" y2="98" stroke={CRIMSON} strokeWidth="0.4" opacity="0.15" />
      <rect x="122" y="104" width="36" height="12" rx="2" fill={`rgba(${CRIMSON_RGB},0.12)`} stroke={CRIMSON} strokeWidth="0.3" strokeOpacity="0.3" />
      <text x="140" y="113" fill={CRIMSON} fontSize="5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.5">SUBMIT</text>
      <circle cx="140" cy="134" r="3" fill="none" stroke={CRIMSON} strokeWidth="0.5" opacity="0.3" />
      <text x="140" y="152" fill={CRIMSON} fontSize="7" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.9">FLUTTER</text>

      {/* Arrow App -> Services */}
      <line x1="168" y1="100" x2="205" y2="85" stroke="url(#sambalLine)" strokeWidth="1" filter="url(#sambalGlow)" />
      <polygon points="202,81 210,84 203,88" fill={CRIMSON} opacity="0.6" />
      <line x1="168" y1="100" x2="205" y2="115" stroke="url(#sambalLine)" strokeWidth="1" filter="url(#sambalGlow)" />
      <polygon points="202,112 210,116 203,119" fill={CRIMSON} opacity="0.6" />

      {/* SERVICES */}
      <rect x="210" y="55" width="70" height="30" rx="3" fill={`rgba(${CRIMSON_RGB},0.08)`} stroke={CRIMSON} strokeWidth="0.8" strokeOpacity="0.5" />
      <text x="245" y="68" fill={CRIMSON} fontSize="6" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.7">GRIEF FLOW</text>
      <text x="245" y="78" fill={CRIMSON} fontSize="5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.4">PF / CERT / INS</text>

      <rect x="210" y="100" width="70" height="30" rx="3" fill={`rgba(${CRIMSON_RGB},0.08)`} stroke={CRIMSON} strokeWidth="0.8" strokeOpacity="0.5" />
      <text x="245" y="113" fill={CRIMSON} fontSize="6" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.7">DOC ENGINE</text>
      <text x="245" y="123" fill={CRIMSON} fontSize="5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.4">TEMPLATES</text>

      {/* Arrow Services -> DB */}
      <line x1="280" y1="70" x2="305" y2="90" stroke="url(#sambalLine)" strokeWidth="1" filter="url(#sambalGlow)" />
      <line x1="280" y1="115" x2="305" y2="95" stroke="url(#sambalLine)" strokeWidth="1" filter="url(#sambalGlow)" />
      <polygon points="302,87 310,90 303,94" fill={CRIMSON} opacity="0.6" />

      {/* DATABASE */}
      <ellipse cx="330" cy="82" rx="22" ry="8" fill={`rgba(${CRIMSON_RGB},0.06)`} stroke={CRIMSON} strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="308" y1="82" x2="308" y2="108" stroke={CRIMSON} strokeWidth="0.8" opacity="0.5" />
      <line x1="352" y1="82" x2="352" y2="108" stroke={CRIMSON} strokeWidth="0.8" opacity="0.5" />
      <ellipse cx="330" cy="108" rx="22" ry="8" fill={`rgba(${CRIMSON_RGB},0.06)`} stroke={CRIMSON} strokeWidth="0.8" strokeOpacity="0.5" />
      <text x="330" y="125" fill={CRIMSON} fontSize="7" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.9">FIRESTORE</text>

      {/* Flow label */}
      <text x="180" y="20" fill={CRIMSON} fontSize="6" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.3">MOBILE APP SERVICE FLOW</text>
      <line x1="10" y1="26" x2="350" y2="26" stroke={CRIMSON} strokeWidth="0.3" opacity="0.1" />
    </svg>
  );
}

// ── SVG Architecture Diagram: Jaldrisht (simulation pipeline) ──
function JaldrishtDiagram() {
  return (
    <svg
      viewBox="0 0 380 220"
      width="100%"
      height="100%"
      style={{ maxHeight: "240px" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="jaldGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="jaldLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={CRIMSON} stopOpacity="0.8" />
          <stop offset="100%" stopColor={CRIMSON} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Pipeline title */}
      <text x="190" y="16" fill={CRIMSON} fontSize="6" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.3">
        DAM-BREAK INUNDATION SIMULATION PIPELINE
      </text>
      <line x1="10" y1="22" x2="370" y2="22" stroke={CRIMSON} strokeWidth="0.3" opacity="0.1" />

      {/* DATA INPUT */}
      <rect x="10" y="40" width="66" height="55" rx="3" fill={`rgba(${CRIMSON_RGB},0.08)`} stroke={CRIMSON} strokeWidth="0.8" strokeOpacity="0.5" />
      <text x="43" y="56" fill={CRIMSON} fontSize="7" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.9">DATA INPUT</text>
      {/* Mini data icons */}
      <rect x="18" y="62" width="18" height="10" rx="1" fill={`rgba(${CRIMSON_RGB},0.1)`} stroke={CRIMSON} strokeWidth="0.3" opacity="0.4" />
      <text x="27" y="70" fill={CRIMSON} fontSize="4" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.4">DEM</text>
      <rect x="40" y="62" width="18" height="10" rx="1" fill={`rgba(${CRIMSON_RGB},0.1)`} stroke={CRIMSON} strokeWidth="0.3" opacity="0.4" />
      <text x="49" y="70" fill={CRIMSON} fontSize="4" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.4">DAM</text>
      <rect x="18" y="76" width="40" height="10" rx="1" fill={`rgba(${CRIMSON_RGB},0.1)`} stroke={CRIMSON} strokeWidth="0.3" opacity="0.4" />
      <text x="38" y="84" fill={CRIMSON} fontSize="4" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.4">HYDROLOGY</text>

      {/* Arrow Data -> Solver */}
      <line x1="76" y1="67" x2="99" y2="67" stroke="url(#jaldLine)" strokeWidth="1.2" filter="url(#jaldGlow)" />
      <polygon points="96,63 104,67 96,71" fill={CRIMSON} opacity="0.7" />
      <circle r="2" fill={CRIMSON} opacity="0.8">
        <animateMotion dur="1.8s" repeatCount="indefinite" path="M 76 67 L 99 67" />
      </circle>

      {/* SOLVER (larger, center-ish) */}
      <rect x="104" y="35" width="72" height="65" rx="4" fill={`rgba(${CRIMSON_RGB},0.1)`} stroke={CRIMSON} strokeWidth="1" strokeOpacity="0.6" />
      <text x="140" y="52" fill={CRIMSON} fontSize="7" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.9">SOLVER</text>
      {/* Solver internals */}
      <rect x="112" y="58" width="56" height="14" rx="2" fill={`rgba(${CRIMSON_RGB},0.06)`} stroke={CRIMSON} strokeWidth="0.4" opacity="0.4" />
      <text x="140" y="68" fill={CRIMSON} fontSize="5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.5">SHALLOW WATER</text>
      <rect x="112" y="76" width="56" height="14" rx="2" fill={`rgba(${CRIMSON_RGB},0.06)`} stroke={CRIMSON} strokeWidth="0.4" opacity="0.4" />
      <text x="140" y="86" fill={CRIMSON} fontSize="5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.5">2D SWE / SPH</text>

      {/* Arrow Solver -> Mesh */}
      <line x1="176" y1="67" x2="199" y2="67" stroke="url(#jaldLine)" strokeWidth="1.2" filter="url(#jaldGlow)" />
      <polygon points="196,63 204,67 196,71" fill={CRIMSON} opacity="0.7" />
      <circle r="2" fill={CRIMSON} opacity="0.8">
        <animateMotion dur="1.8s" begin="0.3s" repeatCount="indefinite" path="M 176 67 L 199 67" />
      </circle>

      {/* MESH */}
      <rect x="204" y="40" width="60" height="55" rx="3" fill={`rgba(${CRIMSON_RGB},0.08)`} stroke={CRIMSON} strokeWidth="0.8" strokeOpacity="0.5" />
      <text x="234" y="56" fill={CRIMSON} fontSize="7" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.9">MESH GEN</text>
      {/* Mini mesh grid */}
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <rect
            key={`${r}-${c}`}
            x={214 + c * 10}
            y={62 + r * 7}
            width="8"
            height="5"
            fill="none"
            stroke={CRIMSON}
            strokeWidth="0.3"
            opacity={0.15 + Math.random() * 0.2}
          />
        ))
      )}

      {/* Arrow Mesh -> Viz (goes down then right) */}
      <line x1="234" y1="95" x2="234" y2="130" stroke="url(#jaldLine)" strokeWidth="1" filter="url(#jaldGlow)" />
      <polygon points="230,127 234,135 238,127" fill={CRIMSON} opacity="0.6" />

      {/* VISUALIZATION */}
      <rect x="190" y="138" width="88" height="55" rx="3" fill={`rgba(${CRIMSON_RGB},0.08)`} stroke={CRIMSON} strokeWidth="0.8" strokeOpacity="0.5" />
      <text x="234" y="153" fill={CRIMSON} fontSize="7" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.9">VISUALIZATION</text>
      {/* Mini map visualization */}
      <rect x="198" y="158" width="40" height="28" rx="2" fill={`rgba(${CRIMSON_RGB},0.06)`} stroke={CRIMSON} strokeWidth="0.3" opacity="0.4" />
      {/* Water spread visualization lines */}
      <path d="M 202 180 Q 210 168 218 175 Q 226 168 234 180" fill="none" stroke={CRIMSON} strokeWidth="0.5" opacity="0.4" />
      <path d="M 205 178 Q 212 170 220 176 Q 228 170 232 178" fill={`rgba(${CRIMSON_RGB},0.08)`} stroke="none" />
      {/* MapLibre label */}
      <text x="258" y="170" fill={CRIMSON} fontSize="5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.4">MAPLIBRE</text>
      <text x="258" y="180" fill={CRIMSON} fontSize="5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.4">POSTGIS</text>

      {/* Arrow Viz -> Report */}
      <line x1="278" y1="165" x2="305" y2="165" stroke="url(#jaldLine)" strokeWidth="1" filter="url(#jaldGlow)" />
      <polygon points="302,161 310,165 302,169" fill={CRIMSON} opacity="0.6" />
      <circle r="2" fill={CRIMSON} opacity="0.8">
        <animateMotion dur="2s" begin="0.5s" repeatCount="indefinite" path="M 278 165 L 305 165" />
      </circle>

      {/* HADR REPORT */}
      <rect x="310" y="138" width="60" height="55" rx="3" fill={`rgba(${CRIMSON_RGB},0.08)`} stroke={CRIMSON} strokeWidth="0.8" strokeOpacity="0.5" />
      <text x="340" y="153" fill={CRIMSON} fontSize="7" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.9">HADR</text>
      <text x="340" y="162" fill={CRIMSON} fontSize="6" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.6">REPORT</text>
      {/* Doc icon */}
      <rect x="325" y="168" width="14" height="18" rx="1" fill={`rgba(${CRIMSON_RGB},0.08)`} stroke={CRIMSON} strokeWidth="0.4" opacity="0.4" />
      <line x1="328" y1="173" x2="336" y2="173" stroke={CRIMSON} strokeWidth="0.3" opacity="0.3" />
      <line x1="328" y1="177" x2="336" y2="177" stroke={CRIMSON} strokeWidth="0.3" opacity="0.3" />
      <line x1="328" y1="181" x2="334" y2="181" stroke={CRIMSON} strokeWidth="0.3" opacity="0.3" />
      {/* PDF icon */}
      <rect x="345" y="168" width="14" height="18" rx="1" fill={`rgba(${CRIMSON_RGB},0.12)`} stroke={CRIMSON} strokeWidth="0.4" opacity="0.5" />
      <text x="352" y="180" fill={CRIMSON} fontSize="5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.5">PDF</text>
    </svg>
  );
}

// ── SVG Architecture Diagram: TCP Chat (server architecture) ──
function TcpChatDiagram() {
  return (
    <svg
      viewBox="0 0 360 210"
      width="100%"
      height="100%"
      style={{ maxHeight: "230px" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="tcpGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="tcpLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={CRIMSON} stopOpacity="0.8" />
          <stop offset="100%" stopColor={CRIMSON} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Title */}
      <text x="180" y="16" fill={CRIMSON} fontSize="6" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.3">
        MULTI-CLIENT TCP SOCKET ARCHITECTURE
      </text>
      <line x1="10" y1="22" x2="350" y2="22" stroke={CRIMSON} strokeWidth="0.3" opacity="0.1" />

      {/* CLIENT 1 */}
      <rect x="10" y="35" width="54" height="36" rx="3" fill={`rgba(${CRIMSON_RGB},0.08)`} stroke={CRIMSON} strokeWidth="0.8" strokeOpacity="0.5" />
      <text x="37" y="50" fill={CRIMSON} fontSize="6" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.7">CLIENT_1</text>
      <text x="37" y="60" fill={CRIMSON} fontSize="4.5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.35">:8080</text>

      {/* CLIENT 2 */}
      <rect x="10" y="80" width="54" height="36" rx="3" fill={`rgba(${CRIMSON_RGB},0.08)`} stroke={CRIMSON} strokeWidth="0.8" strokeOpacity="0.5" />
      <text x="37" y="95" fill={CRIMSON} fontSize="6" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.7">CLIENT_2</text>
      <text x="37" y="105" fill={CRIMSON} fontSize="4.5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.35">:8080</text>

      {/* CLIENT 3 */}
      <rect x="10" y="125" width="54" height="36" rx="3" fill={`rgba(${CRIMSON_RGB},0.08)`} stroke={CRIMSON} strokeWidth="0.8" strokeOpacity="0.5" />
      <text x="37" y="140" fill={CRIMSON} fontSize="6" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.7">CLIENT_3</text>
      <text x="37" y="150" fill={CRIMSON} fontSize="4.5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.35">:8080</text>

      {/* CLIENT N */}
      <rect x="10" y="170" width="54" height="28" rx="3" fill={`rgba(${CRIMSON_RGB},0.04)`} stroke={CRIMSON} strokeWidth="0.5" strokeOpacity="0.25" strokeDasharray="3,3" />
      <text x="37" y="188" fill={CRIMSON} fontSize="6" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.3">CLIENT_N</text>

      {/* Connection lines to TCP Server */}
      {[53, 98, 143].map((y, i) => (
        <g key={`conn-${i}`}>
          <line x1="64" y1={y} x2="115" y2="100" stroke="url(#tcpLine)" strokeWidth="0.8" filter="url(#tcpGlow)" />
          <circle r="1.5" fill={CRIMSON} opacity="0.7">
            <animateMotion dur="1.5s" begin={`${i * 0.3}s`} repeatCount="indefinite" path={`M 64 ${y} L 115 100`} />
          </circle>
        </g>
      ))}
      <line x1="64" y1="184" x2="115" y2="105" stroke={CRIMSON} strokeWidth="0.4" strokeDasharray="3,2" opacity="0.2" />

      {/* TCP SERVER (main node) */}
      <rect x="118" y="55" width="80" height="90" rx="4" fill={`rgba(${CRIMSON_RGB},0.1)`} stroke={CRIMSON} strokeWidth="1" strokeOpacity="0.6" />
      <text x="158" y="72" fill={CRIMSON} fontSize="7.5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.9" fontWeight="bold">TCP SERVER</text>

      {/* Accept loop */}
      <rect x="126" y="78" width="64" height="16" rx="2" fill={`rgba(${CRIMSON_RGB},0.06)`} stroke={CRIMSON} strokeWidth="0.4" opacity="0.4" />
      <text x="158" y="89" fill={CRIMSON} fontSize="5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.5">ACCEPT LOOP</text>

      {/* Socket handler */}
      <rect x="126" y="98" width="64" height="16" rx="2" fill={`rgba(${CRIMSON_RGB},0.06)`} stroke={CRIMSON} strokeWidth="0.4" opacity="0.4" />
      <text x="158" y="109" fill={CRIMSON} fontSize="5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.5">FD HANDLER</text>

      {/* Mutex */}
      <rect x="126" y="118" width="64" height="16" rx="2" fill={`rgba(${CRIMSON_RGB},0.08)`} stroke={CRIMSON} strokeWidth="0.4" opacity="0.5" />
      <text x="158" y="129" fill={CRIMSON} fontSize="5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.6">MUTEX LOCK</text>

      {/* Arrow Server -> Thread Pool */}
      <line x1="198" y1="80" x2="230" y2="65" stroke="url(#tcpLine)" strokeWidth="1" filter="url(#tcpGlow)" />
      <polygon points="227,61 235,64 228,68" fill={CRIMSON} opacity="0.6" />
      <circle r="2" fill={CRIMSON} opacity="0.7">
        <animateMotion dur="1.5s" repeatCount="indefinite" path="M 198 80 L 230 65" />
      </circle>

      {/* THREAD POOL */}
      <rect x="234" y="35" width="60" height="60" rx="3" fill={`rgba(${CRIMSON_RGB},0.08)`} stroke={CRIMSON} strokeWidth="0.8" strokeOpacity="0.5" />
      <text x="264" y="50" fill={CRIMSON} fontSize="6.5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.8">THREAD</text>
      <text x="264" y="60" fill={CRIMSON} fontSize="6.5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.8">POOL</text>
      {/* Thread indicators */}
      {[0, 1, 2].map((i) => (
        <g key={`thread-${i}`}>
          <rect x={242 + i * 16} y={68} width="12" height="18" rx="1" fill={`rgba(${CRIMSON_RGB},0.06)`} stroke={CRIMSON} strokeWidth="0.3" opacity="0.4" />
          <text x={248 + i * 16} y={80} fill={CRIMSON} fontSize="4" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.4">T{i + 1}</text>
        </g>
      ))}

      {/* Arrow Server -> Message Queue */}
      <line x1="198" y1="120" x2="230" y2="135" stroke="url(#tcpLine)" strokeWidth="1" filter="url(#tcpGlow)" />
      <polygon points="227,131 235,135 228,139" fill={CRIMSON} opacity="0.6" />

      {/* MESSAGE QUEUE */}
      <rect x="234" y="110" width="60" height="52" rx="3" fill={`rgba(${CRIMSON_RGB},0.08)`} stroke={CRIMSON} strokeWidth="0.8" strokeOpacity="0.5" />
      <text x="264" y="125" fill={CRIMSON} fontSize="6" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.8">MSG QUEUE</text>
      {/* Queue items */}
      {[0, 1, 2].map((i) => (
        <rect
          key={`q-${i}`}
          x={240}
          y={132 + i * 9}
          width={48}
          height={7}
          rx={1}
          fill={`rgba(${CRIMSON_RGB},${0.04 + i * 0.03})`}
          stroke={CRIMSON}
          strokeWidth="0.3"
          opacity={0.5 - i * 0.1}
        />
      ))}

      {/* Arrow Thread Pool -> Broadcast */}
      <line x1="294" y1="65" x2="310" y2="90" stroke="url(#tcpLine)" strokeWidth="0.8" />
      {/* Arrow Queue -> Broadcast */}
      <line x1="294" y1="136" x2="310" y2="110" stroke="url(#tcpLine)" strokeWidth="0.8" />

      {/* BROADCAST */}
      <rect x="312" y="80" width="42" height="40" rx="3" fill={`rgba(${CRIMSON_RGB},0.12)`} stroke={CRIMSON} strokeWidth="0.8" strokeOpacity="0.6" />
      <text x="333" y="97" fill={CRIMSON} fontSize="5.5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.9">BROAD</text>
      <text x="333" y="107" fill={CRIMSON} fontSize="5.5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.9">CAST</text>
      {/* Broadcast lines */}
      <line x1="333" y1="120" x2="320" y2="140" stroke={CRIMSON} strokeWidth="0.4" opacity="0.3" />
      <line x1="333" y1="120" x2="333" y2="145" stroke={CRIMSON} strokeWidth="0.4" opacity="0.3" />
      <line x1="333" y1="120" x2="346" y2="140" stroke={CRIMSON} strokeWidth="0.4" opacity="0.3" />
      <circle cx="320" cy="142" r="2" fill={CRIMSON} opacity="0.25" />
      <circle cx="333" cy="147" r="2" fill={CRIMSON} opacity="0.25" />
      <circle cx="346" cy="142" r="2" fill={CRIMSON} opacity="0.25" />

      {/* Protocol label */}
      <text x="158" y="200" fill={CRIMSON} fontSize="5" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.2">
        PROTOCOL: RAW TCP | LANG: C++ | THREADING: POSIX
      </text>
    </svg>
  );
}

// ── Status badge ──
function StatusBadge({ status }: { status: string }) {
  const config =
    status === "wip"
      ? { label: "IN DEVELOPMENT", bg: "rgba(255,158,44,0.12)", color: "#ff9e2c", pulse: true }
      : status === "deployed"
        ? { label: "DEPLOYED", bg: `rgba(${CRIMSON_RGB},0.15)`, color: CRIMSON, pulse: false }
        : { label: "LIVE", bg: `rgba(${CRIMSON_RGB},0.15)`, color: CRIMSON, pulse: false };

  return (
    <div className="flex items-center gap-2">
      <span
        className="relative flex h-2 w-2"
      >
        {config.pulse && (
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: config.color }}
          />
        )}
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ backgroundColor: config.color }}
        />
      </span>
      <span
        className="font-mono text-[9px] px-2 py-0.5 rounded-sm tracking-wider"
        style={{ background: config.bg, color: config.color }}
      >
        {config.label}
      </span>
    </div>
  );
}

// ── System status readout bar ──
function SystemReadout() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  const uptime = `${Math.floor(tick / 30)}h ${tick % 60}m`;
  const load = (0.4 + Math.sin(tick * 0.3) * 0.3).toFixed(2);
  const mem = `${(62 + Math.sin(tick * 0.5) * 8).toFixed(0)}%`;

  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-3 px-4 rounded-sm"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "9px",
        color: `rgba(${CRIMSON_RGB},0.4)`,
        background: `rgba(${CRIMSON_RGB},0.02)`,
        border: `1px solid rgba(${CRIMSON_RGB},0.06)`,
        letterSpacing: "0.08em",
      }}
    >
      <span>SYS.UPTIME: {uptime}</span>
      <span style={{ color: `rgba(${CRIMSON_RGB},0.15)` }}>|</span>
      <span>LOAD: {load}</span>
      <span style={{ color: `rgba(${CRIMSON_RGB},0.15)` }}>|</span>
      <span>MEM: {mem}</span>
      <span style={{ color: `rgba(${CRIMSON_RGB},0.15)` }}>|</span>
      <span>THREAT.LEVEL: <span style={{ color: CRIMSON, opacity: 0.7 }}>ULTRON</span></span>
      <span style={{ color: `rgba(${CRIMSON_RGB},0.15)` }}>|</span>
      <span>PROJECTS.INDEXED: {projects.length}</span>
      <span style={{ color: `rgba(${CRIMSON_RGB},0.15)` }}>|</span>
      <span>DEPLOYED: {projects.filter((p) => p.status !== "wip").length}</span>
    </motion.div>
  );
}

// ── Scan line animation ──
function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 w-full pointer-events-none z-30"
      style={{
        height: "1px",
        background: `linear-gradient(90deg, transparent, ${CRIMSON}, transparent)`,
        boxShadow: `0 0 15px ${CRIMSON}, 0 0 30px rgba(${CRIMSON_RGB},0.3)`,
      }}
      animate={{ top: ["0%", "100%"] }}
      transition={{ duration: 8, ease: "linear", repeat: Infinity, repeatDelay: 3 }}
    />
  );
}

// ================================================================
//   MAIN COMPONENT
// ================================================================
export default function ProjectsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  // Panel configs: [tiltY, diagram component, project index]
  const panelConfigs: { tiltY: number; Diagram: React.FC; projectIdx: number; isCenter: boolean }[] = [
    { tiltY: 5, Diagram: SambalDiagram, projectIdx: 0, isCenter: false },
    { tiltY: 0, Diagram: JaldrishtDiagram, projectIdx: 1, isCenter: true },
    { tiltY: -5, Diagram: TcpChatDiagram, projectIdx: 2, isCenter: false },
  ];

  return (
    <section
      id="projects"
      className="section"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        background: `linear-gradient(180deg, var(--bg) 0%, rgba(15,2,4,1) 30%, rgba(20,3,5,1) 70%, var(--bg) 100%)`,
      }}
    >
      {/* Atmospheric red fog - top */}
      <div
        className="absolute top-0 left-0 w-full pointer-events-none z-0"
        style={{
          height: "300px",
          background: `linear-gradient(180deg, rgba(${CRIMSON_RGB},0.06) 0%, transparent 100%)`,
        }}
      />

      {/* Atmospheric red fog - bottom */}
      <div
        className="absolute bottom-0 left-0 w-full pointer-events-none z-0"
        style={{
          height: "300px",
          background: `linear-gradient(0deg, rgba(${CRIMSON_RGB},0.06) 0%, transparent 100%)`,
        }}
      />

      {/* Reactor glow */}
      <ReactorGlow />

      {/* Ember particles */}
      <EmberParticles />

      {/* Scan line */}
      <ScanLine />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(${CRIMSON_RGB},0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(${CRIMSON_RGB},0.02) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main content */}
      <motion.div
        ref={containerRef}
        className="relative z-20 w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-16"
        variants={sectionFade}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Section label */}
        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
          <span
            className="font-mono text-xs"
            style={{ color: CRIMSON, opacity: 0.5 }}
          >
            03
          </span>
          <span className="w-8 h-px" style={{ background: CRIMSON, opacity: 0.3 }} />
          <span className="text-xs font-medium tracking-[0.12em] opacity-50">PROJECTS</span>
          <span className="flex-1 h-px" style={{ background: `rgba(${CRIMSON_RGB},0.1)` }} />
          <span
            className="font-mono text-[9px] tracking-widest"
            style={{ color: CRIMSON, opacity: 0.3 }}
          >
            ULTRON.SYS // PROJECT_DATABASE
          </span>
        </motion.div>

        {/* Section heading */}
        <motion.h2
          variants={fadeUp}
          className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-3"
          style={{ color: CRIMSON, textShadow: `0 0 40px rgba(${CRIMSON_RGB},0.3)` }}
        >
          <GlitchText text="DEPLOYED SYSTEMS" speed={30} scrambleDuration={400} delay={200} />
        </motion.h2>

        {/* Sub-heading telemetry */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center gap-4 mb-8"
          style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: `rgba(${CRIMSON_RGB},0.35)` }}
        >
          <span>CLASSIFICATION: OPEN-SOURCE</span>
          <span style={{ color: `rgba(${CRIMSON_RGB},0.15)` }}>|</span>
          <span>CLEARANCE: PUBLIC</span>
          <span style={{ color: `rgba(${CRIMSON_RGB},0.15)` }}>|</span>
          <span>INTEGRITY: VERIFIED</span>
          <span style={{ color: `rgba(${CRIMSON_RGB},0.15)` }}>|</span>
          <span>RENDER.MODE: ARCHITECTURE_SCHEMATIC</span>
        </motion.div>

        {/* Horizontal divider with data flow */}
        <motion.div variants={fadeUp} className="relative mb-10">
          <div
            style={{
              height: "1px",
              background: `linear-gradient(90deg, transparent, rgba(${CRIMSON_RGB},0.3), rgba(${CRIMSON_RGB},0.6), rgba(${CRIMSON_RGB},0.3), transparent)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-3px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "6px",
              height: "6px",
              background: CRIMSON,
              borderRadius: "50%",
              boxShadow: `0 0 8px ${CRIMSON}`,
            }}
          />
        </motion.div>

        {/* ──────── PANEL ROW ──────── */}
        <div
          className="flex flex-col lg:flex-row items-stretch justify-center gap-4 lg:gap-0"
          style={{ perspective: "1200px" }}
        >
          {panelConfigs.map(({ tiltY, Diagram, projectIdx, isCenter }, i) => {
            const project = projects[projectIdx];
            if (!project) return null;

            return (
              <div key={project.id} className="flex items-stretch">
                {/* Connection line before center and right panels */}
                {i > 0 && <ConnectionLine from={i === 1 ? "left" : "center"} to={i === 1 ? "center" : "right"} />}

                <motion.div
                  variants={panelVariant(tiltY, i * 0.25, isCenter)}
                  className="relative flex-1"
                  style={{
                    transformStyle: "preserve-3d",
                    minWidth: isCenter ? "380px" : "320px",
                    maxWidth: isCenter ? "440px" : "380px",
                    zIndex: isCenter ? 10 : 5,
                  }}
                  whileHover={{
                    scale: 1.03,
                    rotateY: tiltY * 0.5,
                    transition: { duration: 0.4 },
                  }}
                >
                  {/* Panel container */}
                  <div
                    className="relative h-full rounded-sm overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, rgba(${CRIMSON_RGB},0.04) 0%, rgba(${CRIMSON_RGB},0.08) 50%, rgba(${CRIMSON_RGB},0.04) 100%)`,
                      border: `1px solid rgba(${CRIMSON_RGB},${isCenter ? 0.3 : 0.18})`,
                      backdropFilter: "blur(12px) saturate(130%)",
                      boxShadow: isCenter
                        ? `0 0 40px rgba(${CRIMSON_RGB},0.15), 0 20px 60px rgba(0,0,0,0.5), inset 0 0 40px rgba(${CRIMSON_RGB},0.03)`
                        : `0 0 20px rgba(${CRIMSON_RGB},0.08), 0 10px 40px rgba(0,0,0,0.4)`,
                    }}
                  >
                    {/* Top accent glow line */}
                    <div
                      style={{
                        height: "2px",
                        background: `linear-gradient(90deg, transparent, ${CRIMSON}, transparent)`,
                        opacity: isCenter ? 0.8 : 0.5,
                      }}
                    />

                    {/* Panel header */}
                    <div className="px-4 pt-4 pb-2">
                      {/* Project ID + status row */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="font-mono text-[9px] tracking-widest"
                          style={{ color: `rgba(${CRIMSON_RGB},0.35)` }}
                        >
                          PROJECT_{String(projectIdx + 1).padStart(2, "0")} // {project.id.toUpperCase()}
                        </span>
                        <StatusBadge status={project.status} />
                      </div>

                      {/* Title */}
                      <h3
                        className="font-display font-bold mb-1"
                        style={{
                          fontSize: isCenter ? "22px" : "20px",
                          color: CRIMSON,
                          textShadow: `0 0 20px rgba(${CRIMSON_RGB},0.3)`,
                          letterSpacing: "0.05em",
                        }}
                      >
                        {project.title.toUpperCase()}
                      </h3>

                      {/* Description */}
                      <p
                        className="font-body text-xs leading-relaxed mb-3"
                        style={{ color: "var(--text-primary)", opacity: 0.5 }}
                      >
                        {project.description}
                      </p>

                      {/* Data readouts */}
                      <div className="space-y-1 mb-3">
                        <DataStrip label="STACK" value={project.tags[0]} />
                        <DataStrip label="BUILD" value="PASSING" color={`rgba(${CRIMSON_RGB},0.6)`} />
                        <DataStrip label="VER" value={`1.${projectIdx}`} />
                      </div>
                    </div>

                    {/* Diagram section */}
                    <div
                      className="mx-3 mb-3 rounded-sm overflow-hidden"
                      style={{
                        background: `rgba(0,0,0,0.3)`,
                        border: `1px solid rgba(${CRIMSON_RGB},0.1)`,
                        padding: "8px",
                      }}
                    >
                      {/* Diagram header bar */}
                      <div
                        className="flex items-center gap-2 mb-2 pb-2"
                        style={{ borderBottom: `1px solid rgba(${CRIMSON_RGB},0.08)` }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: CRIMSON, opacity: 0.6 }}
                        />
                        <span
                          className="font-mono text-[8px] tracking-wider"
                          style={{ color: `rgba(${CRIMSON_RGB},0.4)` }}
                        >
                          ARCHITECTURE_SCHEMATIC.render()
                        </span>
                        <span className="flex-1" />
                        <span
                          className="font-mono text-[7px]"
                          style={{ color: `rgba(${CRIMSON_RGB},0.2)` }}
                        >
                          LIVE
                        </span>
                        <span
                          className="w-1 h-1 rounded-full animate-pulse"
                          style={{ background: CRIMSON }}
                        />
                      </div>
                      <Diagram />
                    </div>

                    {/* Tech tags */}
                    <div className="px-4 pb-3">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-mono px-2 py-0.5 rounded-sm"
                            style={{
                              background: `rgba(${CRIMSON_RGB},0.1)`,
                              color: CRIMSON,
                              border: `1px solid rgba(${CRIMSON_RGB},0.15)`,
                              letterSpacing: "0.05em",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Links */}
                      <div
                        className="flex items-center gap-2 pt-3"
                        style={{ borderTop: `1px solid rgba(${CRIMSON_RGB},0.08)` }}
                      >
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[10px] px-3 py-1.5 rounded-sm transition-all duration-300"
                            style={{
                              border: `1px solid rgba(${CRIMSON_RGB},0.2)`,
                              color: CRIMSON,
                              opacity: 0.7,
                              letterSpacing: "0.05em",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = CRIMSON;
                              e.currentTarget.style.opacity = "1";
                              e.currentTarget.style.boxShadow = `0 0 12px rgba(${CRIMSON_RGB},0.3)`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = `rgba(${CRIMSON_RGB},0.2)`;
                              e.currentTarget.style.opacity = "0.7";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            &lt;/&gt; SOURCE
                          </a>
                        )}
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[10px] px-3 py-1.5 rounded-sm transition-all duration-300"
                            style={{
                              background: `rgba(${CRIMSON_RGB},0.15)`,
                              color: CRIMSON,
                              letterSpacing: "0.05em",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = `rgba(${CRIMSON_RGB},0.25)`;
                              e.currentTarget.style.boxShadow = `0 0 16px rgba(${CRIMSON_RGB},0.3)`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = `rgba(${CRIMSON_RGB},0.15)`;
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            LIVE DEMO
                          </a>
                        )}
                        {!project.githubUrl && !project.liveUrl && (
                          <span
                            className="font-mono text-[9px] tracking-wider"
                            style={{ color: `rgba(${CRIMSON_RGB},0.3)` }}
                          >
                            LINKS PENDING // WIP
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Corner brackets */}
                    <span
                      className="absolute top-0 left-0 w-5 h-5 pointer-events-none"
                      style={{
                        borderTop: `1px solid rgba(${CRIMSON_RGB},0.4)`,
                        borderLeft: `1px solid rgba(${CRIMSON_RGB},0.4)`,
                      }}
                    />
                    <span
                      className="absolute top-0 right-0 w-5 h-5 pointer-events-none"
                      style={{
                        borderTop: `1px solid rgba(${CRIMSON_RGB},0.4)`,
                        borderRight: `1px solid rgba(${CRIMSON_RGB},0.4)`,
                      }}
                    />
                    <span
                      className="absolute bottom-0 left-0 w-5 h-5 pointer-events-none"
                      style={{
                        borderBottom: `1px solid rgba(${CRIMSON_RGB},0.4)`,
                        borderLeft: `1px solid rgba(${CRIMSON_RGB},0.4)`,
                      }}
                    />
                    <span
                      className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none"
                      style={{
                        borderBottom: `1px solid rgba(${CRIMSON_RGB},0.4)`,
                        borderRight: `1px solid rgba(${CRIMSON_RGB},0.4)`,
                      }}
                    />

                    {/* Bottom accent line */}
                    <div
                      style={{
                        height: "1px",
                        background: `linear-gradient(90deg, transparent, rgba(${CRIMSON_RGB},0.3), transparent)`,
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* ──────── BOTTOM TELEMETRY ──────── */}
        <motion.div variants={fadeUp} className="mt-10 space-y-4">
          {/* System readout bar */}
          <SystemReadout />

          {/* Bottom data strip */}
          <div className="flex items-center justify-center gap-4">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: CRIMSON,
                boxShadow: `0 0 8px ${CRIMSON}`,
                animation: "reactorPulse 2s ease-in-out infinite",
              }}
            />
            <span
              className="font-mono text-[10px] tracking-widest"
              style={{ color: `rgba(${CRIMSON_RGB},0.3)` }}
            >
              {projects.length} SYSTEMS INDEXED // {projects.filter((p) => p.status !== "wip").length} OPERATIONAL // ULTRON MONITORING ACTIVE
            </span>
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: CRIMSON,
                boxShadow: `0 0 8px ${CRIMSON}`,
                animation: "reactorPulse 2s ease-in-out infinite",
              }}
            />
          </div>

          {/* Closing divider */}
          <div
            style={{
              height: "1px",
              background: `linear-gradient(90deg, transparent, rgba(${CRIMSON_RGB},0.2), transparent)`,
            }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
