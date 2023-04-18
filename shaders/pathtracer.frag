float i_THRESHOLD = .001;
uint i_SAMPLES = 300;
uint i_BOUNCES = 8;
float i_FOVDegrees = 45;
float i_pi = acos(-1);
uint state = uint(gl_FragCoord.x * gl_FragCoord.y) * uint(0x27d4eb2d);
out vec4 Frag;
vec3 attentuation;
vec3 albedo;
float specularity;
float shininess;
float emission;
float metal;
float transparency;
float refraction;

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
  float a = wang_hash(state) * (i_pi * 2);
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
  shininess = 2;
  emission = 0;
  metal=0;
  float ground = -fBox(p,vec3(1.5,1.5,5)); //fPlane(p, vec3(0, 1, 0), 1.25); 
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

albedo = final == ground ? vec3(1) :
         final == light ? vec3(1) :
         final == bigBall ? vec3(.5) :
         final == greenBall ? vec3(.1, .9, .1) :
         final == blueBall ? vec3(.1, .1, .9) :
         final == redBall ? vec3(.9, .1, .1) :
         final == blackBall ? vec3(.01) : albedo;

metal = final == ground ? .8 :
        final == bigBall ? 1 :
        metal;

emission = final == light ? 2. : emission;

shininess = final == bigBall ? 128 :
            final == blueBall ? 8 :
            final == blackBall ? 8 :
            final == redBall ? 128 :
            shininess;

specularity = final == bigBall ? 1 :
              final == greenBall ? .25 :
              final == blueBall ? .3 :
              final == redBall ? 1 :
              final == blackBall ? .5 :
              specularity;
  return final;
}

vec3 normal(vec3 p) 
{
    mat3 k = mat3(p,p,p) - mat3(0.005);
    return normalize(scene(p) - vec3( scene(k[0]),scene(k[1]),scene(k[2])) );
}


vec3 calcLight(vec3 d, vec3 n, vec3 color, float power) {
  float light = max(dot(n, normalize(d)), 0);
  vec3 i_diffuse = albedo * attentuation * light;
  return (color * i_diffuse + pow(light, shininess) * specularity) * power;
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

void main() {
  vec3 i_lp1 = vec3(0, 10, -20);
  vec3 i_lp2 = vec3(-50, 20, -50);
  vec3 i_lp3 = vec3(50, 20, -50);
  vec2 uv = ((gl_FragCoord.xy / vec2(i_X, i_Y)) * 2 - 1) / vec2(1, i_X / i_Y);
  Frag.rgb = vec3(0);
  vec3 n;
  vec3 ro;
  vec3 d;
  float i_cameraDistance = 1.0f / tan(i_FOVDegrees * 0.5f * i_pi / 180.0f);
  for (int j = 0; j < i_SAMPLES; j++) {
    d = normalize(vec3(uv, i_cameraDistance));
    ro = vec3(uv, -5);
    attentuation = vec3(.5, .5, 1);
    for (int i = 0; i < i_BOUNCES + 1 && march(ro, d); i++) {
      n = normal(ro);
      attentuation += emission*albedo;
      Frag.rgb += calcLight(i_lp1, n, vec3(.5, .5, .9), .5);
      Frag.rgb += calcLight(i_lp2, n, vec3(1, .1, .1), .5);
      Frag.rgb += calcLight(i_lp3, n, vec3(.5, 1, .125), .8);
      Frag.rgb += calcLight(rndVector(state), n, vec3(0, 0, 1.), .5);
      float i_reflection = reflect(d, n);
      float i_rnd = normalize(n + rndVector(state));
      d = normalize(mix(i_rnd, i_reflection, metal));
      attentuation *= albedo * max(dot(d, n), 0);
      Frag.w++;
    }
    Frag.rgb += Frag.w == 0 ? vec3(0) : attentuation;
  }
  Frag.rgb = sqrt(Frag.rgb / Frag.w);
}
