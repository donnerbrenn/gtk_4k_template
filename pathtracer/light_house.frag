float i_THRESHOLD = .01;
uint i_SAMPLES = 300;
uint i_BOUNCES = 8;
float i_FOVDegrees = 85;

float i_pi = acos(-1);
uint state = uint(gl_FragCoord.x * gl_FragCoord.y) * uint(0x27d4eb2d);
out vec4 Fr;

struct M {
  vec3 abd;  // Albedo
  float spc; // Specularity
  float shp; // Sharpness
  float ems; // Emission
  float mtl; // Metalness
} material;

M Mred = M(vec3(.7, .01, .01), .3, 64, 0, .3);
M Mground = M(vec3(.1), .1, 64, 0, .25);
M Mblack = M(vec3(.03), .2, 64, 0, .95);

M Mred = M(vec3(.7, .01, .01), .3, 64, 0, .3);
M Mground = M(vec3(.1), .1, 64, 0, .25);
M Mblack = M(vec3(.03), .2, 64, 0, .95);

vec3 attentuation;

vec3 rotate(vec3 p, vec3 t) {
  vec3 c = cos(t);
  vec3 s = sin(t);
  mat3 i_rx = mat3(1, 0, 0, 0, c.x, -s.x, 0, s.x, c.x);
  mat3 i_ry = mat3(c.y, 0, s.y, 0, 1, 0, -s.y, 0, c.y);
  mat3 i_rz = mat3(c.z, -s.z, 0, s.z, c.z, 0, 0, 0, 1);
  return i_rz * i_ry * i_rx * p;
}

float softmin(float f1, float f2, float val) {
  float i_e = pow(max(val - abs(f1 - f2), 0.), 2) * .25;
  return min(f1, f2) - i_e / val;
}

// A circular disc with no thickness (i.e. a cylinder with no height).
// Subtract some value to make a flat disc with rounded edge.
// float fDisc(vec3 p, float r) {
//   float l = length(p.xz) - r;
//   return l < 0 ? abs(p.y) : length(vec2(p.y, l));
// }

float fCappedCone(vec3 p, float h, float r1, float r2, float r3) {
  vec2 q = vec2(length(p.xz), p.y);
  vec2 k1 = vec2(r2, h);
  vec2 k2 = vec2(r2 - r1, 2. * h);
  vec2 ca = vec2(q.x - min(q.x, (q.y < 0.) ? r1 : r2), abs(q.y) - h);
  vec2 cb = q - k1 + k2 * clamp(dot(k1 - q, k2) / dot(k2, k2), 0., 1.);
  return (cb.x < 0. && ca.y < 0.) ? -1.
                                  : sqrt(min(dot(ca, ca), dot(cb, cb))) - r3;
}

float wang_hash(inout uint seed) {
  seed ^= 61 ^ (seed >> 16) * 9 ^ (seed >> 4) * 0x27d4eb2d ^ (seed >> 15);
  return float(seed) / 4294967296.;
}

vec3 rndVector(inout uint state) {
  float z = wang_hash(state) * 2 - 1;
  float a = wang_hash(state) * (i_pi * 2);
  float r = sqrt(1 - z * z);
  return vec3(r * cos(a), r * sin(a), z);
}

float fPlane(vec3 p, vec3 n, float distanceFromOrigin) {
  return dot(p, n) + distanceFromOrigin;
}

float fBox(vec3 p, vec3 d) {
  vec3 q = abs(p) - d;
  return length(max(q, 0.)) + min(0., max(q.x, max(q.y, q.z)));
}

void moda(inout vec2 p, float rep) {
  float per = 2 * i_pi / rep;
  float a = atan(p.y, p.x);
  float i_l = length(p);
  a = mod(a, per) - per * 0.5;
  p = vec2(cos(a), sin(a)) * i_l;
}

float scene(vec3 p) {
  p = rotate(rotate(p, vec3(-.7, .0, -.04)), vec3(0, 1.1, 0)) +
      vec3(.5, -1.05, 0);

  vec3 pp = p + vec3(0, 0, 0);

  pp += vec3(.5, 0, 0);
  moda(pp.xz, 5);

  vec3 i_mp = mod(p, .0001) - .00005;
  vec2 seed = fract(p.xz * vec2(233.34, 851.74));
  seed += dot(seed, seed + 23.45);
  float i_noise = fract(seed.x * seed.y);
  float sdf = fBox(i_mp, vec3(.0)) - i_noise * .02;

  float ground = fPlane(p, vec3(0, 1, 0), 3);
  float house = fCappedCone(p + vec3(0, 1.5, 0), 2.75, .8, .4, 0);
  // vec3 pp = p;// + vec3(0, -1.1, 0);
  // pModPolar(pp.xz, 18);
  // pp += vec3(.1,0,0);
  // float grid = fCappedCone(pp, .09, .01, .01, 0);
  float grid = fBox(pp, vec3(1));
  float disc = fCappedCone(p + vec3(0, -1, 0), .001, .6, .6, 0);
  sdf = grid;
  // sdf = min(min(min(ground, house), disc), grid);
  uint even = uint((p.y * .5 + 4) * 4) % 2;
  Mred.abd = even == 1 ? vec3(1, 1, 1) : vec3(1, 0, 0);

  material = sdf == ground  ? Mground
             : sdf == house ? Mred
             : sdf == disc  ? Mred
                            : material;

  return sdf;
}

vec3 normal(vec3 p) {
  mat3 k = mat3(p, p, p) - mat3(0.001);
  return normalize(scene(p) - vec3(scene(k[0]), scene(k[1]), scene(k[2])));
}

bool march(inout vec3 p, vec3 dir) {
  float dst = .1;
  float travel = 0;
  while (travel < 50 && dst > i_THRESHOLD) {
    p += dir * dst;
    dst = scene(p);
    travel += dst;
  }
  return dst < i_THRESHOLD;
}

vec3 calcLight(vec3 d, vec3 n, vec3 color, float power) {
  float light = max(dot(n, normalize(d)), 0);
  vec3 i_diffuse = material.abd * attentuation * light;
  return (color * i_diffuse + pow(light, material.shp) * material.spc) * power;
}
// float i_X, i_Y;
void main() {
  vec3 i_lp1 = vec3(0, 10, -20);
  vec3 i_lp2 = vec3(-50, 20, -50);
  vec3 i_lp3 = vec3(50, 20, -50);
  vec2 uv = ((gl_FragCoord.xy / vec2(i_X, i_Y)) * 2 - 1) / vec2(1, i_X / i_Y);
  Fr.rgbw = vec4(1);
  vec3 n, ro, d;
  float i_cameraDistance = 1.0f / tan(i_FOVDegrees * 0.5f * i_pi / 180.0f);
  for (int j = 0; j < i_SAMPLES; j++) {
    d = normalize(vec3(uv, i_cameraDistance));
    ro = vec3(uv, -5);
    attentuation = vec3(.5, .5, 1);
    for (int i = 0; i < i_BOUNCES + 1 && march(ro, d); i++) {
      n = normal(ro);
      attentuation += material.abd * material.ems;
      vec3 i_l1 = calcLight(i_lp1, n, vec3(.5, .5, .9), .5);
      vec3 i_l2 = calcLight(i_lp2, n, vec3(1, .1, .1), .5);
      vec3 i_l3 = calcLight(i_lp3, n, vec3(.5, 1, .125), .8);
      Fr.rgb += i_l1 + i_l2 + i_l3;
      vec3 i_reflection = reflect(d, n);
      vec3 i_rnd = normalize(n + rndVector(state));
      d = normalize(mix(i_rnd, i_reflection, material.mtl));
      attentuation *= material.abd * max(dot(d, n), 0) * .98;
      Fr.w++;
    }
    Fr.rgb += Fr.w == 0 ? vec3(0) : attentuation;
  }
  Fr.rgb = sqrt(Fr.rgb / Fr.w);
}