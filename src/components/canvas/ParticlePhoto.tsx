import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "@/store/useStore";
import { THEMES } from "@/theme/themes";

/**
 * Nano-particle holographic portrait — HIGH CONTRAST edition.
 *
 * Loads Utkarsh's real photo, samples pixel brightness on a hidden canvas,
 * and uses bright pixel positions as particle morph targets so the hologram
 * forms his actual face and body from 12,000 vivid, glowing particles.
 *
 * Lifecycle:
 *  1. Pre-boot: invisible (scale 0)
 *  2. After boot: particles morph scattered → portrait (large, center screen)
 *  3. After voice speech ends: shrink + drift into reactor core
 */

const PARTICLE_COUNT = 12000;
const SPREAD = 14;

/* ── Image sampling config ── */
const SAMPLE_W = 160;
const SAMPLE_H = 240; // 1.5 aspect ratio matching photo
const PORTRAIT_W = 3.0; // 3D world units wide
const PORTRAIT_H = 4.5; // 3D world units tall
const BRIGHTNESS_THRESHOLD = 18; // lowered to capture more detail from photo

/* ── Vertex shader — HIGH BRIGHTNESS ── */
const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uMorphProgress;
  uniform vec3 uAccentColor;
  attribute vec3 aTarget;
  attribute float aSize;
  attribute float aRandom;
  attribute float aBrightness;
  varying vec3 vColor;
  varying float vAlpha;

  float snoise(float v) {
    return sin(v * 1.3) * 0.5 + cos(v * 2.7) * 0.3 + sin(v * 5.1) * 0.2;
  }

  void main() {
    // Scattered position with organic drift
    vec3 scattered = position;
    scattered.x += sin(uTime * 0.2 + aRandom * 6.28) * 0.4;
    scattered.y += cos(uTime * 0.15 + aRandom * 3.14) * 0.3;
    scattered.z += sin(uTime * 0.1 + aRandom * 4.0) * 0.2;

    // Target with holographic shimmer
    vec3 target = aTarget;
    target.x += snoise(uTime * 0.8 + aRandom * 10.0) * 0.01;
    target.y += snoise(uTime * 0.6 + aRandom * 8.0) * 0.01;
    target.z += sin(uTime * 1.2 + aRandom * 5.0) * 0.006;

    // Per-particle staggered morph
    float dist = length(aTarget.xy);
    float delay = dist * 0.06 + aRandom * 0.04;
    float t = clamp((uMorphProgress - delay) / (1.0 - delay + 0.001), 0.0, 1.0);
    t = 1.0 - pow(1.0 - t, 3.0);

    vec3 pos = mix(scattered, target, t);

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // ── HIGH CONTRAST SIZE: bright pixels = BIG particles ──
    float bSq = aBrightness * aBrightness; // squared for more contrast
    float brightnessScale = 0.7 + bSq * 1.8;
    gl_PointSize = clamp(aSize * brightnessScale * (180.0 / -mvPos.z), 1.0, 12.0);

    // ── VIVID COLOUR: near-white highlights, strong accent mid-tones ──
    vec3 dimColor = uAccentColor * 0.3;
    // Bright areas push hard toward white, mid-tones stay accent-coloured
    vec3 brightColor = mix(uAccentColor * 1.3, vec3(1.0, 1.0, 1.0), 0.4 + bSq * 0.5);
    vColor = mix(dimColor, brightColor, t);

    // ── HIGH ALPHA: formed portrait is punchy and opaque ──
    float formedAlpha = 0.65 + aBrightness * 0.35;
    vAlpha = mix(0.2, formedAlpha, t) * smoothstep(70.0, 3.0, -mvPos.z);
  }
`;

/* ── Fragment shader — BRIGHTER GLOW ── */
const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    // Sharp bright dot with soft glow edge
    float alpha = vAlpha * smoothstep(0.5, 0.04, d);
    // Hot white core for extra punch
    float core = smoothstep(0.18, 0.0, d) * 0.5;
    gl_FragColor = vec4(vColor + core, alpha);
  }
`;

/**
 * Sample bright pixels from the photo to build particle target positions.
 * Uses contrast-enhanced brightness for vivid hologram.
 */
function sampleImageParticles(
  img: HTMLImageElement,
): { targets: Float32Array; brightness: Float32Array } {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_W;
  canvas.height = SAMPLE_H;
  const ctx = canvas.getContext("2d")!;

  // Boost contrast at canvas level
  ctx.filter = "contrast(1.4) brightness(1.1)";
  ctx.drawImage(img, 0, 0, SAMPLE_W, SAMPLE_H);
  const imageData = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);
  const data = imageData.data;

  // Collect all visible pixels
  const brightPixels: { x: number; y: number; b: number }[] = [];
  let maxLum = 0;
  for (let y = 0; y < SAMPLE_H; y++) {
    for (let x = 0; x < SAMPLE_W; x++) {
      const i = (y * SAMPLE_W + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = r * 0.299 + g * 0.587 + b * 0.114;
      if (lum > maxLum) maxLum = lum;
      if (lum > BRIGHTNESS_THRESHOLD) {
        brightPixels.push({ x, y, b: lum });
      }
    }
  }

  // Normalize brightness to 0–1 range using actual max for full contrast
  const norm = maxLum > 0 ? maxLum : 255;
  for (const px of brightPixels) {
    px.b = px.b / norm;
  }

  // Weighted pool: brighter pixels get more particles (up to 5 copies)
  const weighted: typeof brightPixels = [];
  for (const px of brightPixels) {
    const copies = Math.ceil(px.b * 5);
    for (let c = 0; c < copies; c++) {
      weighted.push(px);
    }
  }

  const targets = new Float32Array(PARTICLE_COUNT * 3);
  const brightness = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const px = weighted[Math.floor(Math.random() * weighted.length)];
    if (!px) {
      targets[i * 3] = (Math.random() - 0.5) * 0.5;
      targets[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      targets[i * 3 + 2] = 0;
      brightness[i] = 0.3;
      continue;
    }
    targets[i * 3] = (px.x / SAMPLE_W - 0.5) * PORTRAIT_W;
    targets[i * 3 + 1] = -(px.y / SAMPLE_H - 0.5) * PORTRAIT_H;
    targets[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    brightness[i] = px.b;
  }

  return { targets, brightness };
}

export default function ParticlePhoto() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const pointsRef = useRef<THREE.Points>(null!);
  const morphRef = useRef(0);
  const scaleRef = useRef({ current: 0, target: 0 });
  const posRef = useRef({ x: 0, y: 1.5, z: 3 });

  const [imageData, setImageData] = useState<{
    targets: Float32Array;
    brightness: Float32Array;
  } | null>(null);

  // Lifecycle positions & scales — BIGGER
  const REACTOR_POS = { x: 0, y: 1, z: 0 };
  const FULL_POS = { x: 0, y: 1.5, z: 3.5 };
  const FULL_SCALE = 2.0;
  const MINI_SCALE = 0.12;

  // Load real photo
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/assets/utkarsh-photo.png";
    img.onload = () => {
      const sampled = sampleImageParticles(img);
      setImageData(sampled);
    };
    img.onerror = () => {
      console.warn("ParticlePhoto: Failed to load photo, using fallback");
      const targets = new Float32Array(PARTICLE_COUNT * 3);
      const brightness = new Float32Array(PARTICLE_COUNT);
      let idx = 0;
      const headCount = Math.floor(PARTICLE_COUNT * 0.35);
      for (let i = 0; i < headCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 0.65;
        targets[idx * 3] = Math.cos(angle) * r;
        targets[idx * 3 + 1] = 1.8 + Math.sin(angle) * r;
        targets[idx * 3 + 2] = (Math.random() - 0.5) * 0.15;
        brightness[idx] = 0.6 + Math.random() * 0.4;
        idx++;
      }
      const neckCount = Math.floor(PARTICLE_COUNT * 0.05);
      for (let i = 0; i < neckCount; i++) {
        targets[idx * 3] = (Math.random() - 0.5) * 0.25;
        targets[idx * 3 + 1] = 1.0 + Math.random() * 0.2;
        targets[idx * 3 + 2] = (Math.random() - 0.5) * 0.1;
        brightness[idx] = 0.4 + Math.random() * 0.3;
        idx++;
      }
      for (; idx < PARTICLE_COUNT; idx++) {
        const t = Math.random();
        const y = 0.95 - t * 1.4;
        const halfW = 0.3 + t * 0.85;
        targets[idx * 3] = (Math.random() - 0.5) * 2 * halfW;
        targets[idx * 3 + 1] = y;
        targets[idx * 3 + 2] = (Math.random() - 0.5) * 0.2;
        brightness[idx] = 0.3 + Math.random() * 0.4;
      }
      setImageData({ targets, brightness });
    };
  }, []);

  const { scattered, sizes, randoms } = useMemo(() => {
    const scattered = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const randoms = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      scattered[i * 3] = (Math.random() - 0.5) * SPREAD;
      scattered[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
      scattered[i * 3 + 2] = (Math.random() - 0.5) * SPREAD * 0.4;
      sizes[i] = Math.random() * 3.0 + 0.8;
      randoms[i] = Math.random();
    }
    return { scattered, sizes, randoms };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorphProgress: { value: 0 },
      uAccentColor: { value: new THREE.Color("#00d4ff") },
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (!matRef.current || !groupRef.current) return;
    const state = useStore.getState();
    const theme = THEMES[state.currentTheme];

    const wantMorph = state.booted && state.currentSection === "hero";
    const morphTarget = wantMorph ? 1 : 0;
    morphRef.current += (morphTarget - morphRef.current) * 0.012;

    const speechFinished = state.speechDone;
    if (speechFinished) {
      scaleRef.current.target = MINI_SCALE;
      posRef.current.x += (REACTOR_POS.x - posRef.current.x) * 0.018;
      posRef.current.y += (REACTOR_POS.y - posRef.current.y) * 0.018;
      posRef.current.z += (REACTOR_POS.z - posRef.current.z) * 0.018;
    } else if (state.booted) {
      scaleRef.current.target = FULL_SCALE;
      posRef.current.x += (FULL_POS.x - posRef.current.x) * 0.035;
      posRef.current.y += (FULL_POS.y - posRef.current.y) * 0.035;
      posRef.current.z += (FULL_POS.z - posRef.current.z) * 0.035;
    } else {
      scaleRef.current.target = 0;
    }

    scaleRef.current.current +=
      (scaleRef.current.target - scaleRef.current.current) * 0.022;

    const s = scaleRef.current.current;
    groupRef.current.scale.set(s, s, s);
    groupRef.current.position.set(
      posRef.current.x,
      posRef.current.y,
      posRef.current.z,
    );

    matRef.current.uniforms.uTime.value = clock.elapsedTime;
    matRef.current.uniforms.uMorphProgress.value = morphRef.current;
    matRef.current.uniforms.uAccentColor.value.lerp(
      new THREE.Color(theme.accent),
      0.03,
    );
  });

  if (!imageData) return null;

  return (
    <group ref={groupRef} scale={0}>
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={scattered}
            count={PARTICLE_COUNT}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aTarget"
            array={imageData.targets}
            count={PARTICLE_COUNT}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aSize"
            array={sizes}
            count={PARTICLE_COUNT}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aRandom"
            array={randoms}
            count={PARTICLE_COUNT}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aBrightness"
            array={imageData.brightness}
            count={PARTICLE_COUNT}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={matRef}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
