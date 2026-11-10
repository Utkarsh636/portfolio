import { motion } from "framer-motion";
import { skills, concepts } from "@/data/skills";
import GlitchText from "@/components/ui/GlitchText";
import HudPanel from "@/components/ui/HudPanel";

/* ═══════════════════════ Constants ═══════════════════════ */

const GOLD = "#ffd23f";
const GOLD_30 = "rgba(255,210,63,0.3)";
const GOLD_15 = "rgba(255,210,63,0.15)";
const GOLD_08 = "rgba(255,210,63,0.08)";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ═══════════════════════ Orbit Config ═══════════════════════ */

const orbitRings = [
  { rx: 155, ry: 60, tilt: -15 },
  { rx: 195, ry: 75, tilt: 20 },
  { rx: 235, ry: 55, tilt: -35 },
];

/** Point on a rotated ellipse at parameter t */
function ellipsePoint(
  rx: number,
  ry: number,
  tiltDeg: number,
  t: number,
): [number, number] {
  const theta = (tiltDeg * Math.PI) / 180;
  return [
    rx * Math.cos(t) * Math.cos(theta) - ry * Math.sin(t) * Math.sin(theta),
    rx * Math.cos(t) * Math.sin(theta) + ry * Math.sin(t) * Math.cos(theta),
  ];
}

/** Concept label positions around the crystal (relative to center) */
const conceptLayout = [
  { x: 125, y: 10 },
  { x: -100, y: 50 },
  { x: -115, y: -20 },
  { x: 85, y: -55 },
  { x: 170, y: 50 },
  { x: -35, y: 80 },
  { x: -165, y: -60 },
  { x: 25, y: -85 },
  { x: 145, y: -100 },
  { x: -55, y: 120 },
  { x: -150, y: 85 },
  { x: 160, y: 115 },
].map((pos, i) => ({ ...pos, label: concepts[i] ?? "" }));

/** Energy node positions on the orbits */
const energyNodes = orbitRings.flatMap((orbit, oi) =>
  [Math.PI / 3, (4 * Math.PI) / 3].map((t, ti) => {
    const [x, y] = ellipsePoint(orbit.rx, orbit.ry, orbit.tilt, t);
    return { x, y, delay: oi * 0.7 + ti * 1.2 };
  }),
);

/* ═══════════════ Constellation Data ═══════════════ */

const constNodes = [
  { x: 40, y: 42 },
  { x: 115, y: 75 },
  { x: 175, y: 25 },
  { x: 255, y: 82 },
  { x: 320, y: 45 },
  { x: 395, y: 20 },
  { x: 460, y: 70 },
  { x: 530, y: 32 },
  { x: 610, y: 78 },
  { x: 685, y: 42 },
  { x: 760, y: 60 },
  { x: 860, y: 30 },
];

const constEdges: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5],
  [3, 4], [3, 6], [4, 5], [4, 7], [5, 7], [6, 7],
  [6, 8], [7, 8], [7, 9], [8, 9], [8, 10], [9, 10],
  [9, 11], [10, 11], [2, 7], [4, 9],
];

/* ═══════════════ Mini Panel Data ═══════════════ */

const weeklyBars = [65, 78, 45, 89, 92, 71, 85];

const topoNodes = [
  { x: 50, y: 12, label: "SRV" },
  { x: 20, y: 42, label: "A" },
  { x: 50, y: 42, label: "B" },
  { x: 80, y: 42, label: "C" },
  { x: 50, y: 72, label: "DB" },
  { x: 50, y: 95, label: "$" },
];

const topoEdges: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [1, 4], [2, 4], [3, 4], [4, 5],
];

/* ═══════════════════════════════════════════════════════════ */
/*                    SUB-COMPONENTS                          */
/* ═══════════════════════════════════════════════════════════ */

/* ── Crystal + Orbital Display (SVG) ── */

function CrystalOrbitalDisplay() {
  const W = 540;
  const H = 500;
  const CX = W / 2;
  const CY = H / 2;

  return (
    <div className="relative w-full" style={{ maxWidth: W }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Crystal gradients */}
          <linearGradient id="sk-gem" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff5d0" stopOpacity={0.9} />
            <stop offset="30%" stopColor={GOLD} stopOpacity={0.8} />
            <stop offset="60%" stopColor="#ffb800" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#ffa200" stopOpacity={0.3} />
          </linearGradient>
          <linearGradient
            id="sk-gem-crown"
            x1="50%"
            y1="0%"
            x2="50%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#fffbe6" stopOpacity={0.6} />
            <stop offset="100%" stopColor={GOLD} stopOpacity={0.05} />
          </linearGradient>
          <radialGradient id="sk-ambient">
            <stop offset="0%" stopColor={GOLD} stopOpacity={0.1} />
            <stop offset="50%" stopColor={GOLD} stopOpacity={0.03} />
            <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
          </radialGradient>

          {/* Glow filters */}
          <filter id="sk-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="b2" />
            <feMerge>
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id="sk-node-glow"
            x="-200%"
            y="-200%"
            width="500%"
            height="500%"
          >
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* Ambient background glow */}
        <circle cx={CX} cy={CY} r={180} fill="url(#sk-ambient)" />

        {/* ── Everything relative to center ── */}
        <g transform={`translate(${CX},${CY})`}>
          {/* Subtle circular grid */}
          {[80, 160, 240].map((r) => (
            <circle
              key={r}
              r={r}
              fill="none"
              stroke={GOLD}
              strokeWidth={0.2}
              opacity={0.04}
              strokeDasharray="2 10"
            />
          ))}

          {/* Crosshair decoration */}
          <g opacity={0.1} stroke={GOLD} strokeWidth={0.4}>
            <line
              x1={-270}
              y1={0}
              x2={-60}
              y2={0}
              strokeDasharray="3 8"
            />
            <line x1={60} y1={0} x2={270} y2={0} strokeDasharray="3 8" />
            <line
              x1={0}
              y1={-240}
              x2={0}
              y2={-60}
              strokeDasharray="3 8"
            />
            <line x1={0} y1={60} x2={0} y2={240} strokeDasharray="3 8" />
            {/* Corner ticks */}
            <line x1={-30} y1={-30} x2={-15} y2={-15} />
            <line x1={30} y1={-30} x2={15} y2={-15} />
            <line x1={-30} y1={30} x2={-15} y2={15} />
            <line x1={30} y1={30} x2={15} y2={15} />
          </g>

          {/* Tick marks on crosshairs */}
          {[80, 120, 160, 200, 240].map((d) => (
            <g key={d} opacity={0.08} stroke={GOLD} strokeWidth={0.3}>
              <line x1={d} y1={-3} x2={d} y2={3} />
              <line x1={-d} y1={-3} x2={-d} y2={3} />
              <line x1={-3} y1={d} x2={3} y2={d} />
              <line x1={-3} y1={-d} x2={3} y2={-d} />
            </g>
          ))}

          {/* ── Orbital Rings ── */}
          {orbitRings.map((orbit, i) => (
            <ellipse
              key={i}
              cx={0}
              cy={0}
              rx={orbit.rx}
              ry={orbit.ry}
              transform={`rotate(${orbit.tilt})`}
              fill="none"
              stroke={GOLD_15}
              strokeWidth={0.7}
              strokeDasharray="6 14"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to={i % 2 === 0 ? "-80" : "80"}
                dur={`${18 + i * 6}s`}
                repeatCount="indefinite"
              />
            </ellipse>
          ))}

          {/* ── Energy Nodes (pulsing dots on orbits) ── */}
          {energyNodes.map((node, i) => (
            <g key={`en-${i}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r={8}
                fill={GOLD}
                opacity={0.04}
                filter="url(#sk-node-glow)"
              />
              <circle cx={node.x} cy={node.y} r={3} fill={GOLD}>
                <animate
                  attributeName="opacity"
                  values="0.3;0.9;0.3"
                  dur={`${2.5 + node.delay}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="r"
                  values="2;4;2"
                  dur={`${2.5 + node.delay}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          ))}

          {/* ── Concept Labels ── */}
          {conceptLayout.map(({ x, y, label }, i) => {
            const isRight = x > 0;
            const textW = label.length * 5.2;
            const pad = 6;
            const gap = 10;
            const boxW = textW + pad * 2;
            const boxX = isRight ? x + gap : x - gap - boxW;
            const textX = isRight ? x + gap + pad : x - gap - pad;

            return (
              <g key={`cl-${i}`}>
                {/* Anchor dot */}
                <circle cx={x} cy={y} r={2.5} fill={GOLD} opacity={0.5} />
                {/* Connecting line */}
                <line
                  x1={x}
                  y1={y}
                  x2={x + (isRight ? gap : -gap)}
                  y2={y}
                  stroke={GOLD_30}
                  strokeWidth={0.5}
                />
                {/* Label background pill */}
                <rect
                  x={boxX}
                  y={y - 8}
                  width={boxW}
                  height={15}
                  rx={2}
                  fill="rgba(5,5,8,0.8)"
                  stroke={GOLD_15}
                  strokeWidth={0.4}
                />
                {/* Label text */}
                <text
                  x={textX}
                  y={y + 3}
                  fill={GOLD}
                  opacity={0.8}
                  fontSize={8.5}
                  fontFamily="'JetBrains Mono', monospace"
                  textAnchor={isRight ? "start" : "end"}
                  letterSpacing="0.04em"
                >
                  {label.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* ── Central Crystal Gem ── */}
          <g filter="url(#sk-glow)">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,-8; 0,0"
              dur="4s"
              repeatCount="indefinite"
            />

            {/* Outer pulsing glow shape */}
            <polygon
              points="0,-58 34,-19 34,19 0,58 -34,19 -34,-19"
              fill={GOLD}
              opacity={0.08}
            >
              <animate
                attributeName="opacity"
                values="0.05;0.14;0.05"
                dur="3s"
                repeatCount="indefinite"
              />
            </polygon>

            {/* Main gem body */}
            <polygon
              points="0,-52 30,-17 30,17 0,52 -30,17 -30,-17"
              fill="url(#sk-gem)"
              stroke={GOLD}
              strokeWidth={1}
            />

            {/* Crown facet (upper) */}
            <polygon
              points="0,-52 30,-17 0,-5 -30,-17"
              fill="url(#sk-gem-crown)"
              stroke={GOLD}
              strokeWidth={0.4}
              opacity={0.5}
            />
            {/* Pavilion facet (lower) */}
            <polygon
              points="0,52 30,17 0,5 -30,17"
              fill={GOLD}
              opacity={0.06}
              stroke={GOLD}
              strokeWidth={0.3}
            />

            {/* Structural lines */}
            <line
              x1={-30}
              y1={0}
              x2={30}
              y2={0}
              stroke={GOLD}
              strokeWidth={0.3}
              opacity={0.3}
            />
            <line
              x1={0}
              y1={-52}
              x2={0}
              y2={52}
              stroke={GOLD}
              strokeWidth={0.3}
              opacity={0.15}
            />

            {/* Edge facet lines */}
            <line
              x1={0}
              y1={-52}
              x2={-30}
              y2={-17}
              stroke={GOLD}
              strokeWidth={0.3}
              opacity={0.2}
            />
            <line
              x1={0}
              y1={-52}
              x2={30}
              y2={-17}
              stroke={GOLD}
              strokeWidth={0.3}
              opacity={0.2}
            />
            <line
              x1={0}
              y1={52}
              x2={-30}
              y2={17}
              stroke={GOLD}
              strokeWidth={0.3}
              opacity={0.2}
            />
            <line
              x1={0}
              y1={52}
              x2={30}
              y2={17}
              stroke={GOLD}
              strokeWidth={0.3}
              opacity={0.2}
            />

            {/* Inner facet diagonals */}
            <line
              x1={-30}
              y1={-17}
              x2={0}
              y2={-5}
              stroke={GOLD}
              strokeWidth={0.25}
              opacity={0.15}
            />
            <line
              x1={30}
              y1={-17}
              x2={0}
              y2={-5}
              stroke={GOLD}
              strokeWidth={0.25}
              opacity={0.15}
            />
            <line
              x1={-30}
              y1={17}
              x2={0}
              y2={5}
              stroke={GOLD}
              strokeWidth={0.25}
              opacity={0.15}
            />
            <line
              x1={30}
              y1={17}
              x2={0}
              y2={5}
              stroke={GOLD}
              strokeWidth={0.25}
              opacity={0.15}
            />

            {/* Center sparkle */}
            <circle r={4} fill="#fffbe6" opacity={0.35} />
            <circle r={2} fill="#ffffff" opacity={0.55} />
          </g>

          {/* Scale readouts */}
          <g opacity={0.08}>
            <text
              x={-262}
              y={5}
              fill={GOLD}
              fontSize={7}
              fontFamily="'JetBrains Mono', monospace"
            >
              0x00
            </text>
            <text
              x={242}
              y={5}
              fill={GOLD}
              fontSize={7}
              fontFamily="'JetBrains Mono', monospace"
              textAnchor="end"
            >
              0xFF
            </text>
          </g>
        </g>
      </svg>

      {/* Floor shadow beneath crystal */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-[12%] w-28 h-3 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255,210,63,0.12) 0%, transparent 70%)",
          filter: "blur(4px)",
        }}
      />
    </div>
  );
}

/* ── Metric readout line ── */

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-mono text-[9px] opacity-30">{label}</span>
      <span
        className="font-mono text-[10px]"
        style={{ color: GOLD, opacity: 0.7 }}
      >
        {value}
      </span>
    </div>
  );
}

/* ── Mini Topology Diagram ── */

function MiniTopology() {
  return (
    <svg
      viewBox="0 0 100 105"
      className="w-full h-auto"
      style={{ maxHeight: 85 }}
    >
      {topoEdges.map(([a, b], i) => (
        <motion.path
          key={i}
          d={`M ${topoNodes[a].x},${topoNodes[a].y} L ${topoNodes[b].x},${topoNodes[b].y}`}
          stroke={GOLD_15}
          strokeWidth={0.8}
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 + i * 0.06 }}
        />
      ))}
      {topoNodes.map((node, i) => (
        <g key={i}>
          <circle
            cx={node.x}
            cy={node.y}
            r={4}
            fill="rgba(5,5,8,0.8)"
            stroke={GOLD_30}
            strokeWidth={0.6}
          />
          <circle
            cx={node.x}
            cy={node.y}
            r={1.5}
            fill={GOLD}
            opacity={0.6}
          />
          <text
            x={node.x}
            y={node.y - 7}
            fill={GOLD}
            opacity={0.5}
            fontSize={5}
            fontFamily="'JetBrains Mono', monospace"
            textAnchor="middle"
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ── Constellation / Knowledge Network Graph ── */

function ConstellationGraph() {
  return (
    <svg
      viewBox="0 0 900 100"
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Subtle horizontal grid */}
      {[25, 50, 75].map((y) => (
        <line
          key={y}
          x1={0}
          y1={y}
          x2={900}
          y2={y}
          stroke={GOLD}
          strokeWidth={0.2}
          opacity={0.04}
        />
      ))}

      {/* Edges */}
      {constEdges.map(([a, b], i) => (
        <motion.path
          key={i}
          d={`M ${constNodes[a].x},${constNodes[a].y} L ${constNodes[b].x},${constNodes[b].y}`}
          stroke={GOLD_15}
          strokeWidth={0.6}
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.03 }}
        />
      ))}

      {/* Nodes */}
      {constNodes.map((node, i) => (
        <g key={i}>
          <circle cx={node.x} cy={node.y} r={6} fill={GOLD} opacity={0.03} />
          <circle cx={node.x} cy={node.y} r={3} fill={GOLD} opacity={0.6}>
            <animate
              attributeName="opacity"
              values="0.35;0.85;0.35"
              dur={`${3 + (i % 4)}s`}
              repeatCount="indefinite"
              begin={`${i * 0.3}s`}
            />
          </circle>
          {concepts[i] && (
            <text
              x={node.x}
              y={node.y - 8}
              fill={GOLD}
              opacity={0.4}
              fontSize={7}
              fontFamily="'JetBrains Mono', monospace"
              textAnchor="middle"
            >
              {concepts[i]}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*                    MAIN COMPONENT                          */
/* ═══════════════════════════════════════════════════════════ */

export default function SkillsSection() {
  return (
    <section id="skills" className="section">
      <motion.div
        className="max-w-7xl w-full px-6 md:px-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
        transition={{ staggerChildren: 0.08 }}
      >
        {/* ── Section Header ── */}
        <motion.div
          variants={fadeUp}
          className="flex items-center gap-3 mb-10"
        >
          <span
            className="font-mono text-xs"
            style={{ color: "var(--accent)", opacity: 0.5 }}
          >
            02
          </span>
          <span
            className="w-8 h-px"
            style={{ background: "var(--accent)", opacity: 0.3 }}
          />
          <GlitchText
            text="SKILLS & CAPABILITIES"
            className="text-xs font-medium tracking-[0.12em]"
            style={{ color: "var(--text-dim)" }}
          />
        </motion.div>

        {/* ── Main Layout: Crystal Orbital + Data Panels ── */}
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 mb-14">
          {/* LEFT -- Crystal + orbiting concept labels */}
          <motion.div
            variants={fadeUp}
            className="relative flex items-center justify-center"
            style={{ minHeight: 480 }}
          >
            <CrystalOrbitalDisplay />
          </motion.div>

          {/* RIGHT -- Data Panels */}
          <div className="space-y-5">
            {/* Capability Matrix (skill bars) */}
            <HudPanel delay={0.2}>
              <h3
                className="text-xs font-medium mb-4 tracking-[0.1em]"
                style={{ color: GOLD, opacity: 0.6 }}
              >
                CAPABILITY MATRIX
              </h3>
              <div className="space-y-4">
                {skills.map((skill, i) => (
                  <div key={skill.name}>
                    <div className="flex items-baseline gap-3 mb-1.5">
                      <span
                        className="font-mono text-[10px] w-8 opacity-40"
                        style={{ color: GOLD }}
                      >
                        {skill.icon}
                      </span>
                      <span
                        className="font-body text-sm font-medium flex-1"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {skill.name}
                      </span>
                      <span
                        className="font-mono text-[10px] tabular-nums"
                        style={{ color: GOLD, opacity: 0.7 }}
                      >
                        {skill.level}%
                      </span>
                    </div>
                    <div
                      className="h-[3px] rounded-full overflow-hidden"
                      style={{ background: GOLD_08 }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${GOLD}, rgba(255,210,63,0.4))`,
                        }}
                        initial={{ width: "0%" }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 1.2,
                          delay: i * 0.08,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      />
                    </div>
                    <p className="font-mono text-[9px] opacity-20 mt-0.5 ml-11">
                      {skill.detail}
                    </p>
                  </div>
                ))}
              </div>
            </HudPanel>

            {/* System Metrics */}
            <HudPanel delay={0.35}>
              <h3
                className="text-xs font-medium mb-3 tracking-[0.1em]"
                style={{ color: GOLD, opacity: 0.6 }}
              >
                SYSTEM METRICS
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {/* Mini bar chart */}
                <div>
                  <span className="font-mono text-[9px] opacity-30">
                    WEEKLY OUTPUT
                  </span>
                  <div className="flex items-end gap-[3px] h-10 mt-1">
                    {weeklyBars.map((v, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          background: `linear-gradient(to top, rgba(255,210,63,0.2), ${GOLD})`,
                        }}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${(v / 100) * 40}px` }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.8,
                          delay: 0.5 + i * 0.06,
                        }}
                      />
                    ))}
                  </div>
                </div>
                {/* Readouts */}
                <div className="space-y-2">
                  <MetricLine label="UPTIME" value="99.7%" />
                  <MetricLine label="LATENCY" value="0.3ms" />
                  <MetricLine label="THREADS" value="128" />
                  <MetricLine label="MEMORY" value="4.2GB" />
                </div>
              </div>
            </HudPanel>

            {/* Network Topology */}
            <HudPanel delay={0.5}>
              <h3
                className="text-xs font-medium mb-2 tracking-[0.1em]"
                style={{ color: GOLD, opacity: 0.6 }}
              >
                NETWORK TOPOLOGY
              </h3>
              <MiniTopology />
            </HudPanel>
          </div>
        </div>

        {/* ── Bottom: Constellation / Knowledge Network ── */}
        <motion.div variants={fadeUp}>
          <HudPanel delay={0.4}>
            <h3
              className="text-xs font-medium mb-3 tracking-[0.1em]"
              style={{ color: GOLD, opacity: 0.6 }}
            >
              KNOWLEDGE NETWORK
            </h3>
            <ConstellationGraph />
          </HudPanel>
        </motion.div>
      </motion.div>
    </section>
  );
}
