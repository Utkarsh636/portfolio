import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";

/**
 * Initialises Lenis smooth-scroll and keeps the global scrollProgress in sync.
 * Wrapped in try/catch so a Lenis issue never crashes the app.
 */
export function useLenis() {
  const lenisRef = useRef<any>(null);
  const setScrollProgress = useStore((s) => s.setScrollProgress);
  const booted = useStore((s) => s.booted);

  useEffect(() => {
    let lenis: any = null;
    let rafId: number;

    async function init() {
      try {
        const LenisModule = await import("lenis");
        const LenisClass = LenisModule.default || LenisModule;
        lenis = new LenisClass({
          duration: 1.4,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          touchMultiplier: 1.5,
        });
        lenisRef.current = lenis;

        function raf(time: number) {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);

        lenis.on("scroll", (e: any) => {
          const p = e?.progress ?? e?.scroll ?? 0;
          setScrollProgress(typeof p === "number" ? p : 0);
        });

        if (!useStore.getState().booted) lenis.stop();
      } catch (err) {
        console.warn("[useLenis] Lenis failed to init, using native scroll:", err);
        // Fallback: track scroll natively
        const onScroll = () => {
          const max = document.body.scrollHeight - window.innerHeight;
          setScrollProgress(max > 0 ? window.scrollY / max : 0);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
      }
    }

    init();

    return () => {
      cancelAnimationFrame(rafId);
      try { lenis?.destroy(); } catch {}
      lenisRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      if (booted) lenisRef.current?.start();
      else lenisRef.current?.stop();
    } catch {}
  }, [booted]);

  return lenisRef;
}
