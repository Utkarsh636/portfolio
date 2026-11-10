import { useEffect, useRef, useState, type CSSProperties } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

interface Props {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: CSSProperties;
  delay?: number;      // ms before starting
  speed?: number;      // ms per character
  scrambleDuration?: number; // ms spent scrambling each char
}

/**
 * Text that "decodes" / scrambles from random characters into the final string.
 * Used for HUD headings and data readouts.
 */
export default function GlitchText({
  text,
  as: Tag = "span",
  className = "",
  style,
  delay = 0,
  speed = 30,
  scrambleDuration = 400,
}: Props) {
  const [display, setDisplay] = useState("");
  const rafRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const letters = text.split("");
    const result = new Array(letters.length).fill("");
    let startTime = 0;

    const timeout = setTimeout(() => {
      startTime = performance.now();

      function tick() {
        if (cancelled) return;
        const elapsed = performance.now() - startTime;

        for (let i = 0; i < letters.length; i++) {
          const charStart = i * speed;
          const charEnd = charStart + scrambleDuration;

          if (elapsed < charStart) {
            result[i] = "";
          } else if (elapsed < charEnd) {
            result[i] = CHARS[Math.floor(Math.random() * CHARS.length)];
          } else {
            result[i] = letters[i];
          }
        }

        setDisplay(result.join(""));

        const totalDuration = letters.length * speed + scrambleDuration;
        if (elapsed < totalDuration) {
          rafRef.current = requestAnimationFrame(tick);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [text, delay, speed, scrambleDuration]);

  /* @ts-expect-error dynamic tag */
  return <Tag className={className} style={style}>{display || " "}</Tag>;
}
