import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { AdaptiveDpr, Preload } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store/useStore";
import { THEMES } from "@/theme/themes";
import ParticlePhoto from "./ParticlePhoto";
import ArcReactor from "./ArcReactor";

/* ─── Inline GLSL Shaders ─── */
const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform vec3 uAccentColor;
  attribute float aSize;
  attribute float aRandom;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 pos = position;
    pos.x += sin(uTime * 0.3 + aRandom * 6.28) * 0.4;
    pos.y += cos(uTime * 0.2 + aRandom * 3.14) * 0.3;
    pos.z += sin(uTime * 0.15 + aRandom * 4.0) * 0.2;
    pos.y -= uScrollProgress * 15.0;
    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = clamp(aSize * (200.0 / -mvPos.z), 1.0, 8.0);
    vColor = mix(uAccentColor, vec3(1.0), aRandom * 0.3);
    vAlpha = smoothstep(60.0, 10.0, -mvPos.z) * (0.3 + aRandom * 0.5);
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float alpha = vAlpha * smoothstep(0.5, 0.15, d);
    gl_FragColor = vec4(vColor, alpha);
  }
`;

const PARTICLE_COUNT = 1200;

/* ─── GPU Particle Field ─── */
function ParticleField() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const { positions, sizes, randoms } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const randoms = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;
      sizes[i] = Math.random() * 3 + 0.5;
      randoms[i] = Math.random();
    }
    return { positions, sizes, randoms };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uAccentColor: { value: new THREE.Color("#00d4ff") },
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const state = useStore.getState();
    const theme = THEMES[state.currentTheme];
    matRef.current.uniforms.uTime.value = clock.elapsedTime;
    matRef.current.uniforms.uScrollProgress.value = state.scrollProgress;
    matRef.current.uniforms.uAccentColor.value.lerp(
      new THREE.Color(theme.particleColor),
      0.03,
    );
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={PARTICLE_COUNT} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" array={sizes} count={PARTICLE_COUNT} itemSize={1} />
        <bufferAttribute attach="attributes-aRandom" array={randoms} count={PARTICLE_COUNT} itemSize={1} />
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
  );
}

/* ─── Lights ─── */
function Lights() {
  const pointRef1 = useRef<THREE.PointLight>(null!);
  const pointRef2 = useRef<THREE.PointLight>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const state = useStore.getState();
    const theme = THEMES[state.currentTheme];
    const accentColor = new THREE.Color(theme.accent);
    if (pointRef1.current) {
      pointRef1.current.color.lerp(accentColor, 0.03);
      pointRef1.current.position.x = Math.sin(t * 0.2) * 8;
      pointRef1.current.position.z = Math.cos(t * 0.2) * 8;
    }
    if (pointRef2.current) {
      pointRef2.current.color.lerp(accentColor, 0.03);
      pointRef2.current.position.x = Math.cos(t * 0.15) * 6;
      pointRef2.current.position.z = Math.sin(t * 0.15) * 6;
    }
  });

  return (
    <>
      <ambientLight intensity={0.08} color="#0a0a18" />
      <pointLight ref={pointRef1} intensity={1.5} distance={40} position={[5, 5, 5]} />
      <pointLight ref={pointRef2} intensity={1} distance={35} position={[-5, 3, -5]} />
      <directionalLight position={[0, 10, -8]} intensity={0.3} color="#c8c8ff" />
    </>
  );
}

/* ─── Camera Rig (section-driven cinematic positions) ─── */
function CameraRig() {
  useFrame(({ camera }) => {
    const { scrollProgress, currentSection, booted } = useStore.getState();
    if (!booted) return;

    let targetX = 0;
    let targetY = 2 - scrollProgress * 30;
    let targetZ = 15 - scrollProgress * 5;

    // Cinematic per-section camera positions
    switch (currentSection) {
      case "hero":
        targetX = 0;
        targetY = 2;
        targetZ = 15;
        break;
      case "about":
        targetX = -1;
        targetY = 0;
        targetZ = 12;
        break;
      case "skills":
        targetX = 1;
        targetY = -1;
        targetZ = 14;
        break;
      case "projects":
        targetX = 0;
        targetY = -3;
        targetZ = 10;
        break;
      case "contact":
        targetX = 0;
        targetY = -5;
        targetZ = 16;
        break;
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.03);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.03);
    camera.lookAt(0, camera.position.y * 0.3, 0);
  });
  return null;
}

/* ─── Grid Floor (infinite holographic grid) ─── */
function GridFloor() {
  const ref = useRef<THREE.GridHelper>(null!);
  const colorRef = useRef(new THREE.Color("#00d4ff"));

  useFrame(() => {
    if (!ref.current) return;
    const theme = THEMES[useStore.getState().currentTheme];
    colorRef.current.lerp(new THREE.Color(theme.accent), 0.02);
    if (Array.isArray(ref.current.material)) {
      ref.current.material.forEach((m: any) => {
        m.color?.copy(colorRef.current);
        m.opacity = 0.04;
        m.transparent = true;
      });
    } else {
      const m = ref.current.material as any;
      m.color?.copy(colorRef.current);
      m.opacity = 0.04;
      m.transparent = true;
    }
  });

  return (
    <gridHelper
      ref={ref}
      args={[100, 60]}
      position={[0, -8, 0]}
    />
  );
}

/* ─── Post-Processing ─── */
function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.7}
        luminanceThreshold={0.75}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <Vignette darkness={0.5} offset={0.3} />
    </EffectComposer>
  );
}

/* ─── Main Canvas ─── */
export default function SceneCanvas() {
  return (
    <Canvas
      className="!fixed inset-0 !z-0"
      camera={{ position: [0, 2, 15], fov: 55, near: 0.1, far: 200 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.3,
        alpha: false,
      }}
      style={{ background: "#050508" }}
    >
      <fog attach="fog" args={["#050508", 15, 70]} />
      <AdaptiveDpr pixelated />
      <Preload all />
      <CameraRig />
      <Lights />
      <ParticleField />
      <GridFloor />
      <Suspense fallback={null}>
        <ParticlePhoto />
        <ArcReactor />
      </Suspense>
      <Effects />
    </Canvas>
  );
}
