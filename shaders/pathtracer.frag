#define threshold .01
#define SAMPLES 300
#define BOUNCES 8
float c_pi = acos(-1);
float c_twopi = c_pi * 2;
out vec4 fragColor;
uint state = uint(gl_FragCoord.x * gl_FragCoord.y) * uint(0x27d4eb2d);
vec3 attentuation = vec3(1);
vec3 albedo;

uint wang_hash(inout uint seed) {
  seed = uint(seed ^ uint(61)) ^ uint(seed >> uint(16));
  seed *= uint(9);
  seed = seed ^ (seed >> 4);
  seed *= uint(0x27d4eb2d);
  seed = seed ^ (seed >> 15);
  return seed;
}

vec3 RandomUnitVector(inout uint state) {
  float z = wang_hash(state) / 4294967296.0 * 2.0f - 1.0f;
  float a = wang_hash(state) / 4294967296.0 * c_twopi;
  float r = sqrt(1.0f - z * z);
  float x = r * cos(a);
  float y = r * sin(a);
  return vec3(x, y, z);
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
  albedo = vec3(1.3);
  float box = -fBox(p, vec3(1., 1., 6)) + .5;
  float ball = fSphere(p, 1);
  float ball2 = fSphere(p + vec3(.75, .75, .75), .3);
  float ball3 = fSphere(p + vec3(-.75, .75, .75), .3);
  float ball4 = fSphere(p + vec3(-.75, -.75, .75), .3);
  float ball5 = fSphere(p + vec3(.75, -.75, .75), .3);
  float final = min(min(min(min(min(box, ball), ball2), ball3), ball4), ball5);
  if (final == ball)
    albedo = vec3(.1, .5, .1);
  if (final == ball2)
    albedo = vec3(.1, .1, .9);
  if (final == ball3)
    albedo = vec3(.9, .2, .2);
  if (final == ball5)
    albedo = vec3(.1);
  return final;
}

vec3 normal(vec3 p) {
  mat3 k = mat3(p, p, p) - mat3(.0005);
  return normalize(scene(p) - vec3(scene(k[0]), scene(k[1]), scene(k[2])));
}

bool march(inout vec3 p, vec3 dir) {
  float dst = .1;
  for (uint cnt = 0; cnt < 256 && dst > threshold; cnt++) {
    p += dir * dst;
    dst = scene(p);
  }
  return dst < threshold;
}

vec3 calcColor(vec3 d, vec3 n, float power) {
  vec3 diffuse = albedo * attentuation * max(dot(normalize(d), n), 0) * power;
  return diffuse;
}

void main() {
  vec2 uv = ((gl_FragCoord.xy / vec2(i_X, i_Y)) * 2 - 1) / vec2(1, i_X / i_Y);
  fragColor.rgb = vec3(0);
  vec3 n;
  float c_FOVDegrees = 60;
  float cameraDistance = 1.0f / tan(c_FOVDegrees * 0.5f * c_pi / 180.0f);
  for (int j = 0; j < SAMPLES; j++) {
    vec3 d = normalize(vec3(uv, cameraDistance));
    vec3 ro = vec3(0, 0, -5);
    attentuation = vec3(1);
    for (int i = 0; i < BOUNCES && march(ro, d); i++) {
      n = normal(ro);
      fragColor.rgb += calcColor(vec3(1, 1, -1), n, .7);
      fragColor.rgb += calcColor(vec3(-1, 0, -1), n, .33);
      fragColor.rgb += calcColor(RandomUnitVector(state), n, 1);
      // fragColor.rgb+=calcColor(n,d,1);
      d = reflect(d, n);
      if (i == 0) {
        d = normalize(n + RandomUnitVector(state));
      }
      attentuation *= albedo * max(dot(d, n), 0);
    }
  }
  fragColor.rgb = sqrt(fragColor.rgb / (SAMPLES * BOUNCES));
}