import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "@/store/useStore";
import { THEMES } from "@/theme/themes";

/**
 * Arc Reactor — a 3D centrepiece that appears when the About section
 * is in view. Built from concentric torus rings rotating at different
 * speeds + a glowing core sphere + orbiting energy dots.
 */

/* ── Core glow shader ── */
const CORE_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CORE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    // Fresnel-like rim glow
    vec3 viewDir = normalize(-vPosition);
    float fresnel = 1.0 - abs(dot(viewDir, vNormal));
    fresnel = pow(fresnel, 2.5);

    // Pulsing intensity
    float pulse = 0.85 + 0.15 * sin(uTime * 2.0);

    vec3 col = uColor * (0.4 + fresnel * 1.5) * pulse;
    float alpha = (0.3 + fresnel * 0.7) * pulse;
    gl_FragColor = vec4(col, alpha);
  }
`;

/* ── Ring component ── */
function Ring({
  radius,
  tube,
  speed,
  axis,
  opacity,
}: {
  radius: number;
  tube: number;
  speed: number;
  axis: [number, number, number];
  opacity: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const colorRef = useRef(new THREE.Color("#ff9e2c"));

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed;
    ref.current.rotation.x = axis[0] * t;
    ref.current.rotation.y = axis[1] * t;
    ref.current.rotation.z = axis[2] * t;

    const theme = THEMES[useStore.getState().currentTheme];
    colorRef.current.lerp(new THREE.Color(theme.accent), 0.03);
    (ref.current.material as THREE.MeshStandardMaterial).color.copy(colorRef.current);
    (ref.current.material as THREE.MeshStandardMaterial).emissive.copy(colorRef.current);
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, tube, 16, 64]} />
      <meshStandardMaterial
        color="#ff9e2c"
        emissive="#ff9e2c"
        emissiveIntensity={0.6}
        transparent
        opacity={opacity}
        wireframe
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ── Energy dots orbiting the reactor ── */
function EnergyDots() {
  const DOT_COUNT = 24;
  const ref = useRef<THREE.Points>(null!);

  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(DOT_COUNT * 3);
    const sizes = new Float32Array(DOT_COUNT);
    for (let i = 0; i < DOT_COUNT; i++) {
      const angle = (i / DOT_COUNT) * Math.PI * 2;
      const r = 1.4 + Math.random() * 0.3;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      positions[i * 3 + 2] = Math.sin(angle) * r;
      sizes[i] = 3 + Math.random() * 4;
    }
    return { positions, sizes };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.3;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={DOT_COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#ff9e2c"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Main ArcReactor group ── */
export default function ArcReactor() {
  const groupRef = useRef<THREE.Group>(null!);
  const coreMatRef = useRef<THREE.ShaderMaterial>(null!);
  const visibleRef = useRef(0); // 0→1 fade

  const coreUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#ff9e2c") },
      uTime: { value: 0 },
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const state = useStore.getState();
    const theme = THEMES[state.currentTheme];

    // Show reactor most prominently on about, dimmer elsewhere
    const isAbout = state.currentSection === "about";
    const target = state.booted ? (isAbout ? 1 : 0.15) : 0;
    visibleRef.current += (target - visibleRef.current) * 0.04;

    groupRef.current.scale.setScalar(visibleRef.current * 1.2);
    groupRef.current.rotation.y += 0.003;

    if (coreMatRef.current) {
      coreMatRef.current.uniforms.uTime.value = clock.elapsedTime;
      coreMatRef.current.uniforms.uColor.value.lerp(
        new THREE.Color(theme.accent),
        0.03,
      );
    }
  });

  return (
    <group ref={groupRef} position={[-5, 0, -4]}>
      {/* Glowing core sphere */}
      <mesh>
        <sphereGeometry args={[0.35, 32, 32]} />
        <shaderMaterial
          ref={coreMatRef}
          vertexShader={CORE_VERT}
          fragmentShader={CORE_FRAG}
          uniforms={coreUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner bright ring */}
      <Ring radius={0.6} tube={0.02} speed={0.8} axis={[1, 0, 0.3]} opacity={0.7} />

      {/* Middle ring */}
      <Ring radius={0.95} tube={0.015} speed={-0.5} axis={[0.3, 1, 0]} opacity={0.5} />

      {/* Outer ring */}
      <Ring radius={1.3} tube={0.012} speed={0.35} axis={[0.5, 0.5, 1]} opacity={0.35} />

      {/* Outermost faint ring */}
      <Ring radius={1.65} tube={0.008} speed={-0.2} axis={[0, 1, 0.5]} opacity={0.2} />

      {/* Orbiting energy dots */}
      <EnergyDots />

      {/* Core point light to illuminate nearby geometry */}
      <pointLight intensity={1.5} distance={8} color="#ff9e2c" />
    </group>
  );
}
