# Stark Portfolio — Phase 1

Cinematic holographic HUD portfolio for **Utkarsh Sharma**, inspired by Tony Stark's AI systems (J.A.R.V.I.S., F.R.I.D.A.Y., V.I.S.I.O.N., U.L.T.R.O.N.).

## Quick Start

```bash
cd stark-portfolio
npm install
npm run dev
```

Open `http://localhost:5173` in a modern browser (Chrome/Edge/Firefox).

## What's in Phase 1

- **Vite + React + TypeScript** project scaffold with path aliases (`@/`)
- **Tailwind CSS** configured with custom theme colours (jarvis/friday/vision/ultron)
- **Zustand** global store: boot state, current section, active theme, audio, scroll progress
- **4 AI Theme System** with CSS variable interpolation via GSAP
  - JARVIS (cyan) → FRIDAY (amber) → VISION (gold) → ULTRON (crimson)
  - Theme auto-switches when you scroll into each section
- **Lenis** smooth scrolling (locked until boot completes)
- **GSAP ScrollTrigger** ready (imported dynamically in theme hook)
- **React Three Fiber** canvas with:
  - 1200 GPU particles (custom GLSL vertex/fragment shaders)
  - Bloom, ChromaticAberration, Vignette post-processing
  - Scroll-driven camera dolly
  - Orbiting coloured lights that lerp to the active theme
- **Persistent HUD overlay**: corner brackets, scanning line, side nav dots, AI badge (shows "J.A.R.V.I.S. ONLINE" etc.), system clock, scroll %, audio toggle
- **Custom cursor reticle** (dot + spring-follow ring, hides on touch)
- **Boot sequence**: "INITIALIZE SYSTEM" button → animated log lines → progress bar → hex dump → "SYSTEM ONLINE" → fade into hero
- **5 content sections**: Hero, About, Skills, Projects, Contact — with Framer Motion entrance animations, GlitchText decode effects, magnetic buttons, glass HUD panels
- **All personal data in `/src/data/`** — edit `profile.ts`, `projects.ts`, `skills.ts` without touching components
- **Reduced-motion support**, semantic HTML, meta tags

## Project Structure

```
src/
├── components/
│   ├── boot/          (future: detailed boot screens)
│   ├── canvas/        SceneCanvas.tsx (R3F + postprocessing)
│   ├── hud/           HudOverlay, AiBadge, SystemClock, NavDots, CursorReticle
│   ├── sections/      Boot, Hero, About, Skills, Projects, Contact
│   └── ui/            HudPanel, GlitchText, MagneticButton
├── data/              profile.ts, projects.ts, skills.ts
├── hooks/             useLenis, useThemeTransition
├── shaders/           particles.vert, particles.frag
├── store/             useStore.ts (Zustand)
├── theme/             themes.ts (4 AI themes + CSS var mapping)
├── App.tsx
├── main.tsx
└── index.css
```

## Placeholder Assets

Place your transparent-background photo at:
```
public/assets/me.png
```

## What's Coming

- **Phase 2**: Nano-particle photo reveal + voice intro (speechSynthesis)
- **Phase 3**: Procedural Arc Reactor + floating code-screen HUDs
- **Phase 4**: Mind-stone Vision section + cinematic scroll transitions
- **Phase 5**: Drone-hologram project panels with raycasted hover
- **Phase 6**: Contact terminal, sound FX, perf tuning, mobile polish

## Deploy

```bash
npm run build    # outputs to dist/
npx serve dist   # local preview
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host.
