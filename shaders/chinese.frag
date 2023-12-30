float y;
float e;
float f;
float g;
float v=2;
out vec4 o;
vec3 p;
float k = .01;
float j;
vec2 r = vec2(i_X, i_Y);
uniform float iTime;

mat2 rotate2D(float r) { return mat2(cos(r), sin(r), -sin(r), cos(r)); }

void main() {
  for (float i; i++ < 80.;) {
    g += min(f = max(y, (p.x + p.z) / v), e / j);
    o += e < f ? k : k / exp(f * 1e3);
    p = vec3((gl_FragCoord.xy * v - r) / r.y * g, g - v);
    p.zy *= rotate2D(j);
    p.xz *= rotate2D(iTime);
    e = y = --p.y;
  }

  for (j = k; j++ < 12;) {
    p = abs(p) / f - vec3(1, 9, 1) / 3.;
    e -= abs(dot(sin(p) / v, p / p)) - .2;
    v /= f = min(dot(p, p), .5) - y * .1;
    o.a = 1;
  }
}