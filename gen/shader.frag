#version 400

float i_X=2560.;
float i_Y=1440.;
#define TSH .001 //Threshold
#define SMPL 1000 // Samples
#define BNC 8 // Bounces
float c_pi = acos(-1);
out vec4 Frag;
uint state = uint(gl_FragCoord.x * gl_FragCoord.y) * uint(0x27d4eb2d);
vec3 attentuation = vec3(1);
vec3 albedo;
float specularity;
float sharpness;
float emission;

uint wang_hash(inout uint seed) {
  seed ^= 61 ^ (seed >> 16) * 9;
  seed ^= (seed >> 4) * 0x27d4eb2d;
  seed ^= (seed >> 15);
  return seed;
}

vec3 rndVector(inout uint state) {
  float z = wang_hash(state) / 4294967296. * 2.0f - 1.0f;
  float a = wang_hash(state) / 4294967296. * (c_pi * 2);
  float r = sqrt(1.0f - z * z);
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
  albedo = vec3(.05);
  specularity = .01;
  sharpness = 2;
  emission = 0;
  float ground = fPlane(p, vec3(0, 1, 0), 1.25);
  //= -fBox(p + vec3(0, 0, 3.5), vec3(1.2, 1.2, 3)) + .1;
  // box = min(box, fPlane(p, vec3(0, -1, 0), 2.2));
  float ball = fSphere(p, 1);
  float ball2 = fSphere(p + vec3(.8, .8, .8), .4);
  float ball3 = fSphere(p + vec3(-.8, .8, .8), .4);
  float ball4 = fSphere(p + vec3(-.8, -.8, .8), .4);
  float ball5 = fSphere(p + vec3(.8, -.8, .8), .4);
  float light = fSphere(p + vec3(0, -12, -8), 3);

  float final = min(
      min(min(min(min(min(ground, ball), ball2), ball3), ball4), ball5), light);
  if (final == light) {
    emission = 1.;
  }
  if (final == ball) {
    albedo = vec3(1);
    specularity = 1;
    sharpness = 128;
  }
  if (final == ball4) {
    albedo = vec3(.1, .9, .1);
    specularity = .5;
  }
  if (final == ball2) {
    albedo = vec3(.1, .1, .9);
    specularity = .05;
  }
  if (final == ball3) {
    albedo = vec3(.9, .1, .1);
    sharpness = 128;
    specularity = 1;
  }
  if (final == ball5) {
    albedo = vec3(.0);
    sharpness = 128;
    specularity = 1;
  }
  return final;
}

vec3 normal(vec3 p) {
  mat3 k = mat3(p, p, p) - mat3(5e-3);
  return normalize(scene(p) - vec3(scene(k[0]), scene(k[1]), scene(k[2])));
}

bool march(inout vec3 p, vec3 dir) {
  float dst = .1;
  float travel = 0;
  while (travel < 25 && dst > TSH) {
    p += dir * dst;
    dst = scene(p);
    travel += dst;
  }
  return dst < TSH;
}

vec3 calcLight(vec3 d, vec3 n, vec3 color, float power) {
  float light = max(dot(n, -normalize(d)), 0);
  vec3 diffuse = albedo * attentuation * light;
  return (color * diffuse + pow(light, sharpness) * specularity) * power;
}

void main() {
  vec2 uv = ((gl_FragCoord.xy / vec2(i_X, i_Y)) * 2 - 1) / vec2(1, i_X / i_Y);
  Frag.rgb = vec3(0);
  vec3 n;
  vec3 ro;
  vec3 d;
  float c_FOVDegrees = 60;
  float cameraDistance = 1.0f / tan(c_FOVDegrees * 0.5f * c_pi / 180.0f);
  for (int j = 0; j < SMPL; j++) {
    d = normalize(vec3(uv, cameraDistance));
    ro = vec3(uv, -5);
    attentuation = vec3(.5, .5, 1);
    for (int i = 0; i < BNC && march(ro, d); i++) {
      n = normal(ro);
      Frag.rgb += emission;
      Frag.rgb += calcLight(ro - vec3(0, 6, -6), n, vec3(1), .25);
      Frag.rgb += calcLight(vec3(1, -1, -.1), n, vec3(1), .5);
      Frag.rgb += calcLight(vec3(-1, -1, -.1), n, vec3(.5, 1, .125), .33);
      Frag.rgb += calcLight(rndVector(state), n, vec3(1), .5);
      d = normalize(n + rndVector(state));

      attentuation *= albedo * max(dot(d, n), 0);
      Frag.w++;
    }
    if (Frag.w > 0)
      Frag.rgb += attentuation;
  }
  Frag.rgb = sqrt(Frag.rgb / Frag.w);
  // Frag.rgb*=1./(ro.z*.01);
}