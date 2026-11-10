import { useEffect, useState } from "react";

/** A real-time HUD clock readout. */
export default function SystemClock() {
  const [time, setTime] = useState(formatTime());

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="hud-text text-[10px] tracking-widest tabular-nums select-none opacity-60">
      {time}
    </span>
  );
}

function formatTime() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}
