varying vec3 vColor;
varying float vAlpha;

void main() {
  // Soft circular point
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;

  float alpha = vAlpha * smoothstep(0.5, 0.15, d);
  gl_FragColor = vec4(vColor, alpha);
}
