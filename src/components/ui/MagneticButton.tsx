import { useRef, type CSSProperties, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface Props {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  as?: "button" | "a";
  href?: string;
  target?: string;
  strength?: number;
}

/**
 * A button/link that magnetically follows the cursor when hovered,
 * giving a HUD-like interactive feel.
 */
export default function MagneticButton({
  children,
  className = "",
  style: userStyle,
  onClick,
  as = "button",
  href,
  target,
  strength = 0.35,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 25 });
  const springY = useSpring(y, { stiffness: 300, damping: 25 });

  function handleMouse(e: MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  const Tag = as === "a" ? motion.a : motion.button;

  return (
    <Tag
      ref={ref as never}
      className={className}
      onClick={onClick}
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      style={{ ...userStyle, x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </Tag>
  );
}
