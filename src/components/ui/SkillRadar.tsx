import { useMemo } from "react";
import { motion } from "framer-motion";
import { skills } from "@/data/skills";

/**
 * Hexagonal radar chart for skills — SVG-based with animated fill.
 * Each vertex of the polygon represents a skill, with distance from
 * center proportional to the skill level (0-100).
 */

const SIZE = 280;
const CX = SIZE / 2;
const CY = SIZE / 2;
const MAX_R = SIZE / 2 - 30;
const RINGS = 4;

function polarToCart(angle: number, radius: number): [number, number] {
  return [
    CX + Math.cos(angle - Math.PI / 2) * radius,
    CY + Math.sin(angle - Math.PI / 2) * radius,
  ];
}

export default function SkillRadar() {
  const count = skills.length;
  const angleStep = (Math.PI * 2) / count;

  // Grid rings
  const rings = useMemo(() => {
    return Array.from({ length: RINGS }, (_, r) => {
      const radius = ((r + 1) / RINGS) * MAX_R;
      const points = Array.from({ length: count }, (_, i) => {
        const [x, y] = polarToCart(i * angleStep, radius);
        return `${x},${y}`;
      }).join(" ");
      return points;
    });
  }, [count, angleStep]);

  // Skill polygon
  const skillPoints = useMemo(() => {
    return skills
      .map((skill, i) => {
        const radius = (skill.level / 100) * MAX_R;
        const [x, y] = polarToCart(i * angleStep, radius);
        return `${x},${y}`;
      })
      .join(" ");
  }, [angleStep]);

  // Axis lines
  const axes = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const [x, y] = polarToCart(i * angleStep, MAX_R);
      return { x1: CX, y1: CY, x2: x, y2: y };
    });
  }, [count, angleStep]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        className="mx-auto"
      >
        {/* Grid rings */}
        {rings.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="rgba(var(--accent-rgb), 0.08)"
            strokeWidth={0.5}
          />
        ))}

        {/* Axis lines */}
        {axes.map((axis, i) => (
          <line
            key={i}
            {...axis}
            stroke="rgba(var(--accent-rgb), 0.06)"
            strokeWidth={0.5}
          />
        ))}

        {/* Skill area — animated */}
        <motion.polygon
          points={
            // Start collapsed at center
            skills.map(() => `${CX},${CY}`).join(" ")
          }
          animate={{ points: skillPoints }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          fill="rgba(var(--accent-rgb), 0.12)"
          stroke="var(--accent)"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />

        {/* Skill dots at vertices */}
        {skills.map((skill, i) => {
          const radius = (skill.level / 100) * MAX_R;
          const [x, y] = polarToCart(i * angleStep, radius);
          return (
            <motion.circle
              key={skill.name}
              cx={CX}
              cy={CY}
              r={3}
              fill="var(--accent)"
              initial={{ cx: CX, cy: CY, opacity: 0 }}
              whileInView={{ cx: x, cy: y, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 1.5,
                delay: 0.3 + i * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          );
        })}

        {/* Skill labels */}
        {skills.map((skill, i) => {
          const labelR = MAX_R + 18;
          const [x, y] = polarToCart(i * angleStep, labelR);
          const angle = i * angleStep - Math.PI / 2;
          const isRight = Math.cos(angle) > 0.1;
          const isLeft = Math.cos(angle) < -0.1;
          return (
            <text
              key={skill.name}
              x={x}
              y={y}
              textAnchor={isRight ? "start" : isLeft ? "end" : "middle"}
              dominantBaseline="central"
              fill="var(--accent)"
              opacity={0.6}
              fontSize={9}
              fontFamily="'JetBrains Mono', monospace"
            >
              {skill.name}
            </text>
          );
        })}

        {/* Center dot */}
        <circle cx={CX} cy={CY} r={2} fill="var(--accent)" opacity={0.3} />
      </svg>

      {/* Glow backdrop */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(var(--accent-rgb), 0.05) 0%, transparent 70%)",
        }}
      />
    </motion.div>
  );
}
