import { useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Props {
  children: ReactNode;
  className?: string;
  index?: number;
  /** Accent override — falls back to CSS var(--accent) */
  accentColor?: string;
}

/**
 * Holographic project card — a 3D-perspective glass card with:
 * - Mouse-tracked tilt (rotateX/Y via Framer Motion springs)
 * - Holographic shimmer gradient overlay
 * - Glitch-flicker entrance from below like a drone delivery
 * - Edge glow that intensifies on hover
 */
export default function HologramCard({
  children,
  className = "",
  index = 0,
  accentColor,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 30,
  });

  function handleMouseMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
    setHovered(false);
  }

  const accent = accentColor || "var(--accent)";
  const accentRgb = accentColor ? undefined : "var(--accent-rgb)";

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 80, scale: 0.9, rotateX: 15 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.9,
        delay: index * 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className="relative rounded-sm overflow-hidden"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          background: `rgba(${accentRgb || "var(--accent-rgb)"}, 0.03)`,
          border: `1px solid rgba(${accentRgb || "var(--accent-rgb)"}, ${hovered ? 0.35 : 0.12})`,
          backdropFilter: "blur(16px) saturate(140%)",
          boxShadow: hovered
            ? `0 0 30px rgba(${accentRgb || "var(--accent-rgb)"}, 0.15), inset 0 0 30px rgba(${accentRgb || "var(--accent-rgb)"}, 0.03)`
            : `0 0 0px transparent`,
          transition: "border-color 0.4s, box-shadow 0.4s",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Top accent glow line */}
        <div
          className="h-px w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            opacity: hovered ? 0.8 : 0.3,
            transition: "opacity 0.4s",
          }}
        />

        {/* Holographic shimmer overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `linear-gradient(
              105deg,
              transparent 40%,
              rgba(${accentRgb || "var(--accent-rgb)"}, 0.06) 45%,
              rgba(${accentRgb || "var(--accent-rgb)"}, 0.12) 50%,
              rgba(${accentRgb || "var(--accent-rgb)"}, 0.06) 55%,
              transparent 60%
            )`,
            backgroundSize: "200% 100%",
          }}
          animate={
            hovered
              ? { backgroundPosition: ["200% 0", "-200% 0"] }
              : { backgroundPosition: "200% 0" }
          }
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: hovered ? Infinity : 0,
            repeatDelay: 0.5,
          }}
        />

        {/* Content */}
        <div className="relative z-20 p-5">{children}</div>

        {/* Corner brackets */}
        <span className="corner-bracket corner-tl" />
        <span className="corner-bracket corner-tr" />
        <span className="corner-bracket corner-bl" />
        <span className="corner-bracket corner-br" />

        {/* Bottom scan line */}
        {hovered && (
          <motion.div
            className="absolute left-0 w-full h-px pointer-events-none z-30"
            style={{ background: accent }}
            initial={{ top: "0%", opacity: 0 }}
            animate={{ top: "100%", opacity: [0, 0.4, 0] }}
            transition={{ duration: 1.2, ease: "linear" }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
