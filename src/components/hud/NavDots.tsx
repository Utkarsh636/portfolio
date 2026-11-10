import { useStore } from "@/store/useStore";

const SECTIONS = ["hero", "about", "skills", "projects", "contact"];

/** Vertical nav dots on the right side showing current scroll position. */
export default function NavDots() {
  const currentSection = useStore((s) => s.currentSection);

  return (
    <nav
      className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3"
      aria-label="Section navigation"
    >
      {SECTIONS.map((id) => {
        const active = id === currentSection;
        return (
          <button
            key={id}
            onClick={() => {
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
            }}
            aria-label={`Scroll to ${id}`}
            className="group relative flex items-center justify-center w-5 h-5"
          >
            {/* Dot */}
            <span
              className="block rounded-full transition-all duration-300"
              style={{
                width: active ? 8 : 4,
                height: active ? 8 : 4,
                background: active ? "var(--accent)" : "rgba(var(--accent-rgb), 0.25)",
                boxShadow: active ? "0 0 8px var(--accent-glow)" : "none",
              }}
            />
            {/* Tooltip */}
            <span className="absolute right-7 whitespace-nowrap text-[9px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-70 transition-opacity pointer-events-none"
              style={{ color: "var(--accent)" }}
            >
              {id}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
