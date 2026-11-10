import { motion } from "framer-motion";

interface Props {
  code: string;
  label: string;
  delay?: number;
  /** Rotation in degrees for the 3D perspective tilt */
  rotateY?: number;
  rotateX?: number;
}

/**
 * Holographic floating code panel — a translucent HUD card showing
 * a code snippet with a mono header and scan-line effect.
 * Floats in with perspective tilt and gentle hovering animation.
 */
export default function FloatingCodePanel({
  code,
  label,
  delay = 0,
  rotateY = 0,
  rotateX = 0,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: rotateY - 10 }}
      whileInView={{ opacity: 1, y: 0, rotateY }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{
        duration: 1,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative"
      style={{
        perspective: "800px",
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        animate={{
          y: [0, -6, 0],
          rotateX: [rotateX, rotateX + 1.5, rotateX],
        }}
        transition={{
          duration: 4 + delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative overflow-hidden rounded-sm"
        style={{
          background: "rgba(var(--accent-rgb), 0.04)",
          border: "1px solid rgba(var(--accent-rgb), 0.15)",
          backdropFilter: "blur(8px)",
          transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
        }}
      >
        {/* Top accent bar */}
        <div
          className="h-px w-full"
          style={{
            background: "linear-gradient(90deg, transparent, var(--accent-glow), transparent)",
          }}
        />

        {/* Header */}
        <div
          className="flex items-center gap-2 px-3 py-1.5"
          style={{
            borderBottom: "1px solid rgba(var(--accent-rgb), 0.08)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse-slow"
            style={{ background: "var(--accent)" }}
          />
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase opacity-50"
            style={{ color: "var(--accent)" }}
          >
            {label}
          </span>
        </div>

        {/* Code body */}
        <pre className="px-3 py-2.5 font-mono text-[10px] leading-relaxed whitespace-pre overflow-hidden"
          style={{ color: "rgba(var(--accent-rgb), 0.7)" }}
        >
          {code}
        </pre>

        {/* Scanline sweep effect */}
        <div
          className="absolute inset-0 pointer-events-none animate-scan-line opacity-10"
          style={{
            background: `linear-gradient(180deg, transparent 0%, var(--accent) 50%, transparent 100%)`,
            height: "2px",
          }}
        />

        {/* Corner brackets */}
        <span className="corner-bracket corner-tl" style={{ width: 10, height: 10 }} />
        <span className="corner-bracket corner-tr" style={{ width: 10, height: 10 }} />
        <span className="corner-bracket corner-bl" style={{ width: 10, height: 10 }} />
        <span className="corner-bracket corner-br" style={{ width: 10, height: 10 }} />
      </motion.div>
    </motion.div>
  );
}
