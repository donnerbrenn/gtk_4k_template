uniform float iTime;
out vec4 Frag;
void main() {
  vec2 UV = ((gl_FragCoord.xy / vec2(i_X, i_Y)) * 2 - 1) / vec2(1, i_X / i_Y);
  float i_r = sin(UV.x + iTime * 0.123);
  float i_g = sin(UV.y - iTime * 0.321);
  float i_b = sin(UV.x - UV.y + iTime * 0.012);
  Frag = abs(vec4(i_r, i_g, i_b, 1));
}