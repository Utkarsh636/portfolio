import { type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

interface Props {
  children: ReactNode;
  className?: string;
  /** Whether to show the corner brackets */
  brackets?: boolean;
  /** Whether to show the top accent line */
  topLine?: boolean;
  /** Framer Motion variants key (for staggered children) */
  delay?: number;
}

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      delay,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

/**
 * Reusable HUD panel — a glass card with optional corner brackets,
 * a top accent line, and enter animation.
 */
export default function HudPanel({
  children,
  className = "",
  brackets = true,
  topLine = true,
  delay = 0,
}: Props) {
  return (
    <motion.div
      className={`relative glass hud-border rounded-sm p-5 ${className}`}
      variants={panelVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      custom={delay}
    >
      {/* Top accent line */}
      {topLine && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--accent-glow), transparent)",
          }}
        />
      )}

      {/* Corner brackets */}
      {brackets && (
        <>
          <span className="corner-bracket corner-tl" />
          <span className="corner-bracket corner-tr" />
          <span className="corner-bracket corner-bl" />
          <span className="corner-bracket corner-br" />
        </>
      )}

      {children}
    </motion.div>
  );
}
