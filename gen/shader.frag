#version 400

float i_X=2560.;
float i_Y=1440.;
float i_THRESHOLD = .001;
uint i_SAMPLES = 300;
uint i_BOUNCES = 8;

float c_pi = acos(-1);
uint state = uint(gl_FragCoord.x * gl_FragCoord.y) * uint(0x27d4eb2d);
out vec4 Frag;
vec3 attentuation = vec3(1);
vec3 albedo;
float specularity;
float sharpness;
float emission;

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

float fCappedCone(vec3 p, float h, float r1, float r2, float r3) {
  vec2 q = vec2(length(p.xz), p.y);
  vec2 k1 = vec2(r2, h);
  vec2 k2 = vec2(r2 - r1, 2. * h);
  vec2 ca = vec2(q.x - min(q.x, (q.y < 0.) ? r1 : r2), abs(q.y) - h);
  vec2 cb = q - k1 + k2 * clamp(dot(k1 - q, k2) / dot(k2, k2), 0., 1.);
  float i_d = (cb.x < 0. && ca.y < 0.)
                  ? -1.
                  : 1. * sqrt(min(dot(ca, ca), dot(cb, cb))) - r3;
  return i_d;
}

float wang_hash(inout uint seed) {
  seed ^= 61 ^ (seed >> 16) * 9 ^ (seed >> 4) * 0x27d4eb2d ^ (seed >> 15);
  return seed / 4294967296.;
}

vec3 rndVector(inout uint state) {
  float z = wang_hash(state) * 2 - 1;
  float a = wang_hash(state) * (c_pi * 2);
  float r = sqrt(1 - z * z);
  return vec3(r * cos(a), r * sin(a), z);
}

float fSphere(vec3 p, float r) { return length(p) - r; }

float fPlane(vec3 p, vec3 n, float distanceFromOrigin) {
  return dot(p, n) + distanceFromOrigin;
}

float vmax(vec3 v) { return max(max(v.x, v.y), v.z); }

float fBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return length(max(d, vec3(0))) + vmax(min(d, vec3(0)));
}

float scene(vec3 p) {
  p = rotate(rotate(p, vec3(-.7, .0, -.04)), vec3(0, 1.1, 0));
  p.y -= 1.05;
  p.x += .5;
  albedo = vec3(.0);
  specularity = .3;
  sharpness = 64;
  emission = 0;

  vec3 i_mp = mod(p, .0001) - .00005;
  // former hash21 function
  vec2 seed = fract(p.xz * vec2(233.34, 851.74));
  seed += dot(seed, seed + 23.45);
  float i_noise = fract(seed.x * seed.y);
  float grid = fBox(i_mp, vec3(.0)) - i_noise * .002;

  // float ground = fPlane(p, vec3(0, 1, 0), 2.2);
  float ground = mix(fPlane(p, vec3(0, 1, 0), 2.2), grid, .01);
  float i_stick = fCappedCone(p + vec3(0, .1, 0), 1, .15, .25, 0);
  float i_ball = fSphere(p + vec3(.0, -1., .0), .5);
  float i_ring1 = fCappedCone(p + vec3(0, .6, 0), .05, .3, .3, .05);
  float i_ring2 = fCappedCone(p + vec3(0, 1, 0), .3, .6, .6, .05);
  float i_base1 = fBox(p + vec3(0, 1.4, 0), vec3(.9, .15, .9)) - .1;
  float i_base2 =
      mix(fBox(p + vec3(.5, 1.85, 0), vec3(1.55, .0, 1.05)) - .45, grid, .0025);
  float i_bbase =
      min(fCappedCone(p + vec3(1.75, 1.34, .75), .05, .55, .45, .02),
          fCappedCone(p + vec3(1.75, 1.34, -.75), .05, .55, .45, .02)) -
      .005;
  float i_buttons =
      min(fCappedCone(p + vec3(1.75, 1.27, -.75), .05, .4, .4, .015),
          fCappedCone(p + vec3(1.75, 1.27, .75), .05, .4, .4, .015)) -
      .01;
  float i_cable = fBox(p + vec3(15.5, sin(p.x * 1.8) * .1 + 2.05,
                                sin((p.x * .0) + sin(p.x * .7)) + .75),
                       vec3(15, 0, 0)) -
                  .1;

  float red = min(min(softmin(i_ball, i_stick, .025), i_buttons), i_bbase);
  float i_black =
      min(softmin(softmin(softmin(i_ring1, i_ring2, .15), i_base1, .15),
                  i_base2, .15),
          i_cable);
  float final = min(min(red, i_black), ground);
  if (final == red) {
    albedo = vec3(.8, .01, .01);
    sharpness = 64;
  }
  if (final == ground) {
    albedo = vec3(.03);
    sharpness = 64;
    specularity = .1;
  }
  return final;
}

vec3 normal(vec3 p) {
  mat3 k = mat3(p, p, p) - mat3(5e-5);
  return normalize(scene(p) - vec3(scene(k[0]), scene(k[1]), scene(k[2])));
}

bool march(inout vec3 p, vec3 dir) {
  float dst = .1;
  float travel = 0;
  while (travel < 100 && dst > i_THRESHOLD) {
    p += dir * dst;
    dst = scene(p);
    travel += dst;
  }
  return dst < i_THRESHOLD;
}

vec3 calcLight(vec3 d, vec3 n, vec3 color, float power) {
  float light = max(dot(n, normalize(d)), 0);
  vec3 i_diffuse = albedo * attentuation * light;
  return (color * i_diffuse + pow(light, sharpness) * specularity) * power;
}

void main() {
  vec3 i_lp1 = vec3(0, 10, -20);
  vec3 i_lp2 = vec3(-50, 20, -50);
  vec3 i_lp3 = vec3(50, 20, -50);
  vec2 uv = ((gl_FragCoord.xy / vec2(i_X, i_Y)) * 2 - 1) / vec2(1, i_X / i_Y);
  Frag.rgb = vec3(0);
  vec3 n;
  vec3 ro;
  vec3 d;
  float i_FOVDegrees = 85;
  float i_cameraDistance = 1.0f / tan(i_FOVDegrees * 0.5f * c_pi / 180.0f);
  for (int j = 0; j < i_SAMPLES; j++) {
    d = normalize(vec3(uv, i_cameraDistance));
    ro = vec3(uv, -5);
    attentuation = vec3(.5, .5, 1);
    for (int i = 0; i < i_BOUNCES && march(ro, d); i++) {
      n = normal(ro);
      Frag.rgb += emission;
      Frag.rgb += calcLight(i_lp1, n, vec3(.5, .5, .9), .5);
      Frag.rgb += calcLight(i_lp2, n, vec3(1, .1, .1), .5);
      Frag.rgb += calcLight(i_lp3, n, vec3(.5, 1, .125), .8);
      Frag.rgb += calcLight(rndVector(state), n, vec3(0, 0, 1.), .25);
      d = normalize(n + rndVector(state));
      attentuation *= albedo * max(dot(d, n), 0);
      Frag.w++;
    }
    Frag.rgb += Frag.w == 0 ? vec3(0) : attentuation;
  }
  Frag.rgb = sqrt(Frag.rgb / Frag.w);
}