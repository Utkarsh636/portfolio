uniform float uTime;
uniform float uScrollProgress;
uniform vec3 uAccentColor;

attribute float aSize;
attribute float aRandom;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec3 pos = position;

  // Gentle floating motion
  pos.x += sin(uTime * 0.3 + aRandom * 6.28) * 0.4;
  pos.y += cos(uTime * 0.2 + aRandom * 3.14) * 0.3;
  pos.z += sin(uTime * 0.15 + aRandom * 4.0) * 0.2;

  // Scroll-driven drift
  pos.y -= uScrollProgress * 15.0;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPos;

  // Size attenuation
  gl_PointSize = aSize * (200.0 / -mvPos.z);
  gl_PointSize = clamp(gl_PointSize, 1.0, 8.0);

  // Color — mix accent with white for brightness variation
  vColor = mix(uAccentColor, vec3(1.0), aRandom * 0.3);
  vAlpha = smoothstep(60.0, 10.0, -mvPos.z) * (0.3 + aRandom * 0.5);
}
