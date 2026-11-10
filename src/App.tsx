import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { SECTION_THEMES } from "@/theme/themes";
import { useLenis } from "@/hooks/useLenis";
import { useThemeTransition } from "@/hooks/useThemeTransition";
import { useVoiceIntro } from "@/hooks/useVoiceIntro";
import { playSound } from "@/hooks/useSound";

import SceneCanvas from "@/components/canvas/SceneCanvas";
import HudOverlay from "@/components/hud/HudOverlay";
import BootSection from "@/components/sections/BootSection";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ContactSection from "@/components/sections/ContactSection";

const SECTION_IDS = ["hero", "about", "skills", "projects", "contact"];

export default function App() {
  const setSection = useStore((s) => s.setSection);
  const setReducedMotion = useStore((s) => s.setReducedMotion);
  const booted = useStore((s) => s.booted);
  const prevSectionRef = useRef<string>("boot");

  /* Smooth scroll */
  useLenis();

  /* Theme transitions tied to current section */
  useThemeTransition();

  /* Voice introduction after boot (if audio enabled) */
  useVoiceIntro();

  /* Detect reduced-motion preference */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [setReducedMotion]);

  /* Intersection Observer: detect which section is in view and update store */
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!booted) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            const newSection = entry.target.id;
            if (newSection !== prevSectionRef.current) {
              prevSectionRef.current = newSection;
              setSection(newSection);
              // Play transition sound on section change
              playSound("transition");
            }
          }
        }
      },
      { threshold: 0.4 },
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [booted, setSection]);

  return (
    <>
      {/* 3D Background */}
      <SceneCanvas />

      {/* HUD Overlay (always on top) */}
      <HudOverlay />

      {/* Boot Screen */}
      <BootSection />

      {/* Scrollable Content — each section has its own background to prevent overlap */}
      {booted && (
        <main className="relative z-10">
          <div style={{ background: "rgba(5,5,8,0.65)" }}>
            <HeroSection />
          </div>
          <div className="section-divider" />
          <div style={{ background: "rgba(8,6,3,0.6)" }}>
            <AboutSection />
          </div>
          <div className="section-divider" />
          <div style={{ background: "rgba(8,7,2,0.6)" }}>
            <SkillsSection />
          </div>
          <div className="section-divider" />
          <div style={{ background: "rgba(8,3,3,0.65)" }}>
            <ProjectsSection />
          </div>
          <div className="section-divider" />
          <div style={{ background: "rgba(5,5,8,0.6)" }}>
            <ContactSection />
          </div>
        </main>
      )}
    </>
  );
}
