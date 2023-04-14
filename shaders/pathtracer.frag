float i_THRESHOLD=.001; // Threshold
uint i_SAMPLES=150; // Samples
uint i_BOUNCES=8;    // Bounces

float c_pi = acos(-1);
uint state = uint(gl_FragCoord.x * gl_FragCoord.y)* uint(0x27d4eb2d);
out vec4 Frag;
vec3 attentuation = vec3(1);
vec3 albedo;
float specularity;
float sharpness;
float emission;

float wang_hash(inout uint seed) {
  seed ^= 61 ^ (seed >> 16) * 9 ^(seed >> 4) * 0x27d4eb2d ^(seed >> 15);
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
  albedo = vec3(.05);
  specularity = .01;
  sharpness = 2;
  emission = 0;
  float ground = fPlane(p, vec3(0, 1, 0), 1.25);
  float bigBall = fSphere(p, 1);
  float blueBall = fSphere(p + vec3(.8, .8, .8), .4);
  float redBall = fSphere(p + vec3(-.8, .8, .8), .4);
  float greenBall = fSphere(p + vec3(-.8, -.8, .8), .4);
  float blackBall = fSphere(p + vec3(.8, -.8, .8), .4);
  float light = fSphere(p + vec3(0, -12, 0), 3);

  float final =
      min(min(min(min(min(min(ground, bigBall), blueBall), redBall), greenBall),
              blackBall),
          light);
  if (final == light) {
    emission = 1.;
  }
  if (final == bigBall) {
    albedo = vec3(1);
    specularity = 1;
    sharpness = 128;
  }
  if (final == greenBall) {
    albedo = vec3(.1, .9, .1);
    specularity = .25;
  }
  if (final == blueBall) {
    albedo = vec3(.1, .1, .9);
    sharpness = 8;
    specularity = .3;
  }
  if (final == redBall) {
    albedo = vec3(.9, .1, .1);
    sharpness = 128;
    specularity = 1;
  }
  if (final == blackBall) {
    albedo = vec3(.01);
    sharpness = 8;
    specularity = .5;
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
  vec2 uv = ((gl_FragCoord.xy / vec2(i_X, i_Y)) * 2 - 1) / vec2(1, i_X / i_Y);
  Frag.rgb = vec3(0);
  vec3 n;
  vec3 ro;
  vec3 d;
  float i_FOVDegrees = 60;
  float i_cameraDistance = 1.0f / tan(i_FOVDegrees * 0.5f * c_pi / 180.0f);
  for (int j = 0; j < i_SAMPLES; j++) {
    d = normalize(vec3(uv, i_cameraDistance));
    ro = vec3(uv, -5);
    attentuation = vec3(.5, .5, 1);
    for (int i = 0; i < i_BOUNCES && march(ro, d); i++) {
      n = normal(ro);
      Frag.rgb += emission;
      Frag.rgb += calcLight(ro - vec3(0, -6, 6), n, vec3(.5,.5,.9), .5);
      Frag.rgb += calcLight(vec3(1, 1, -1), n, vec3(1, .1, .1), .5);
      Frag.rgb += calcLight(vec3(-1, 1, -1), n, vec3(.5, 1, .125), .8);
      Frag.rgb += calcLight(rndVector(state), n, vec3(.1, .1, 1.), .25);
      d = normalize(n + rndVector(state));
      attentuation *= albedo * max(dot(d, n), 0);
      Frag.w++;
    }
    Frag.rgb += Frag.w == 0 ? vec3(0) : attentuation;
  }
  // Frag.rgb = Frag.w == 0? vec3(vec2(uv.y),1):Frag.rgb;
  Frag.rgb = sqrt(Frag.rgb / Frag.w);
}