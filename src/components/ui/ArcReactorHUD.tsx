import { motion } from "framer-motion";

/**
 * Arc Reactor HUD — a large, detailed, multi-layered reactor
 * using layered CSS + SVG to look 3D and mechanical, not flat.
 */
export default function ArcReactorHUD({ size = 480 }: { size?: number }) {
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* ── Deep background glow ── */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,180,255,0.2) 0%, rgba(0,120,200,0.08) 30%, transparent 65%)",
          filter: "blur(40px)",
          transform: "scale(1.3)",
        }}
      />

      {/* ── Second glow layer, tighter ── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: "15%",
          background:
            "radial-gradient(circle, rgba(0,212,255,0.25) 0%, rgba(0,212,255,0.05) 50%, transparent 80%)",
          filter: "blur(20px)",
        }}
        animate={{ opacity: [0.6, 1, 0.6], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 w-full h-full"
        style={{ filter: "drop-shadow(0 0 8px rgba(0,212,255,0.3))" }}
      >
        <defs>
          {/* Core radial glow */}
          <radialGradient id="arc-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="15%" stopColor="#c0edff" />
            <stop offset="40%" stopColor="#00b8ff" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#005a99" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#001a33" stopOpacity="0" />
          </radialGradient>

          {/* Metallic ring gradient */}
          <linearGradient id="arc-metal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8ecae6" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#00d4ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#004466" stopOpacity="0.5" />
          </linearGradient>

          {/* Copper / bronze tint for inner mechanical ring */}
          <linearGradient id="arc-copper" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c09060" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#806040" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#c09060" stopOpacity="0.35" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="arc-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="arc-glow-strong">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ═══ LAYER 1: Outermost faint ring with tick marks ═══ */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <circle cx={cx} cy={cy} r={size * 0.46} fill="none" stroke="#00d4ff" strokeWidth="0.5" opacity="0.06" />
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (i / 60) * Math.PI * 2;
            const r1 = size * 0.44;
            const r2 = size * 0.46;
            return (
              <line
                key={i}
                x1={cx + Math.cos(a) * r1}
                y1={cy + Math.sin(a) * r1}
                x2={cx + Math.cos(a) * r2}
                y2={cy + Math.sin(a) * r2}
                stroke="#00d4ff"
                strokeWidth={i % 5 === 0 ? 1 : 0.3}
                opacity={i % 5 === 0 ? 0.15 : 0.06}
              />
            );
          })}
        </motion.g>

        {/* ═══ LAYER 2: Outer structural ring — thick with 3D shading ═══ */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          {/* Outer edge */}
          <circle cx={cx} cy={cy} r={size * 0.39} fill="none" stroke="url(#arc-metal)" strokeWidth="3" />
          <circle cx={cx} cy={cy} r={size * 0.37} fill="none" stroke="url(#arc-metal)" strokeWidth="1.5" />
          {/* Segment lines between rings = mechanical bolts */}
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const r1 = size * 0.37;
            const r2 = size * 0.39;
            return (
              <line
                key={i}
                x1={cx + Math.cos(a) * r1}
                y1={cy + Math.sin(a) * r1}
                x2={cx + Math.cos(a) * r2}
                y2={cy + Math.sin(a) * r2}
                stroke="#00d4ff"
                strokeWidth="2"
                opacity="0.3"
                strokeLinecap="round"
              />
            );
          })}
        </motion.g>

        {/* ═══ LAYER 3: Main reactor plates — 12 thick trapezoid segments ═══ */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const gap = Math.PI / 80;
            const a1 = a - Math.PI / 12 + gap;
            const a2 = a + Math.PI / 12 - gap;
            const rInner = size * 0.26;
            const rOuter = size * 0.35;

            const x1 = cx + Math.cos(a1) * rInner;
            const y1 = cy + Math.sin(a1) * rInner;
            const x2 = cx + Math.cos(a2) * rInner;
            const y2 = cy + Math.sin(a2) * rInner;
            const x3 = cx + Math.cos(a2) * rOuter;
            const y3 = cy + Math.sin(a2) * rOuter;
            const x4 = cx + Math.cos(a1) * rOuter;
            const y4 = cy + Math.sin(a1) * rOuter;

            return (
              <g key={i}>
                <polygon
                  points={`${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`}
                  fill={i % 2 === 0 ? "rgba(0,180,255,0.08)" : "rgba(0,140,220,0.04)"}
                  stroke="#00b4ff"
                  strokeWidth="1"
                  opacity="0.5"
                />
                {/* Inner bright edge */}
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#00d4ff" strokeWidth="1.5" opacity="0.6"
                />
              </g>
            );
          })}
          {/* Ring between plates */}
          <circle cx={cx} cy={cy} r={size * 0.26} fill="none" stroke="#00d4ff" strokeWidth="2" opacity="0.45" filter="url(#arc-glow)" />
          <circle cx={cx} cy={cy} r={size * 0.35} fill="none" stroke="#00d4ff" strokeWidth="1" opacity="0.25" />
        </motion.g>

        {/* ═══ LAYER 4: Inner copper/mechanical ring ═══ */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <circle cx={cx} cy={cy} r={size * 0.21} fill="none" stroke="url(#arc-copper)" strokeWidth="5" />
          <circle cx={cx} cy={cy} r={size * 0.21} fill="none" stroke="#00a0dd" strokeWidth="1" opacity="0.3" />
          {/* Energy nodes on this ring */}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const r = size * 0.21;
            return (
              <g key={i}>
                <circle
                  cx={cx + Math.cos(a) * r}
                  cy={cy + Math.sin(a) * r}
                  r={5}
                  fill="rgba(0,212,255,0.15)"
                  stroke="#00d4ff"
                  strokeWidth="1.5"
                  opacity="0.7"
                />
                <circle
                  cx={cx + Math.cos(a) * r}
                  cy={cy + Math.sin(a) * r}
                  r={2}
                  fill="#00d4ff"
                  opacity="0.9"
                  filter="url(#arc-glow)"
                />
              </g>
            );
          })}
        </motion.g>

        {/* ═══ LAYER 5: Inner bright ring ═══ */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <circle
            cx={cx} cy={cy} r={size * 0.155}
            fill="none" stroke="#00d4ff" strokeWidth="2.5"
            strokeDasharray="8 4 3 4"
            opacity="0.55"
            filter="url(#arc-glow)"
          />
        </motion.g>

        {/* ═══ LAYER 6: Inner-most ring with small radial lines ═══ */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <circle cx={cx} cy={cy} r={size * 0.11} fill="none" stroke="#00ccff" strokeWidth="1.5" opacity="0.5" />
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const r1 = size * 0.095;
            const r2 = size * 0.115;
            return (
              <line
                key={i}
                x1={cx + Math.cos(a) * r1}
                y1={cy + Math.sin(a) * r1}
                x2={cx + Math.cos(a) * r2}
                y2={cy + Math.sin(a) * r2}
                stroke="#00d4ff"
                strokeWidth={i % 3 === 0 ? 2 : 0.8}
                opacity={i % 3 === 0 ? 0.6 : 0.25}
                strokeLinecap="round"
              />
            );
          })}
        </motion.g>

        {/* ═══ CORE — bright radial glow ═══ */}
        <circle cx={cx} cy={cy} r={size * 0.08} fill="url(#arc-core)" filter="url(#arc-glow-strong)" />
        <circle cx={cx} cy={cy} r={size * 0.04} fill="#e0f4ff" opacity="0.95" />
        <circle cx={cx} cy={cy} r={size * 0.02} fill="#ffffff" />
      </svg>

      {/* ── Pulsing ring overlay (CSS) ── */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "20%",
          border: "1px solid rgba(0,212,255,0.1)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "25%",
          border: "1px solid rgba(0,212,255,0.08)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
      />
    </div>
  );
}
