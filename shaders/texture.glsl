
out vec3 color;
float approx = .001;
float renderDist = 10;
float maxIter = 500;
uniform float iTime;
vec3 ro = vec3(0);

vec3 rotate(vec3 p, vec3 t) {
    vec3 c = cos(t);
    vec3 s = sin(t);
    mat3 i_rx = mat3(1, 0, 0, 0, c.x, -s.x, 0, s.x, c.x);
    mat3 i_ry = mat3(c.y, 0, s.y, 0, 1, 0, -s.y, 0, c.y);
    mat3 i_rz = mat3(c.z, -s.z, 0, s.z, c.z, 0, 0, 0, 1);
    return i_rz * i_ry * i_rx * p;
}

float sdPlane(vec3 p, vec4 n) {
    return dot(p, n.xyz) + n.w;
}

float sdRoundbox(vec3 p, vec3 b, float r) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

float hash21(vec2 p) {
    p = fract(p * vec2(233.34, 851.74));
    p += dot(p, p + 23.45);
    return fract(p.x * p.y);
}

vec2 hash22(vec2 p) {
    float i_k = hash21(p);
    return vec2(i_k, hash21(p + i_k));
}

float map(vec3 p) {
    p.z += iTime;
    p = rotate(p, vec3(0, 0, sin(iTime * 1 + p.z)) * .25);
    p.xz = mod(p.xz, 2) - 1;
    float i_plane = sdPlane(p, vec4(0, 3.14 / 4, 0, .5));
    float i_beams = sdRoundbox(p, vec3(.1, 8, .3), .1);
    return min(i_plane, i_beams);
}

vec3 normal(vec3 p) {
    mat3 k = mat3(p, p, p) - mat3(0.005);
    return normalize(map(p) - vec3(map(k[0]), map(k[1]), map(k[2])));
}

float lightRender(vec3 n, vec3 l, vec3 v, float strength)
{
    return ((dot(n, normalize(l)) * .5 + .5) + pow(max(dot(v, reflect(normalize(l), n)), 0), 10)) * strength;
}

vec3 triplanarMap(vec3 p, vec3 n) {
    p = rotate(p, vec3(0, 0, sin(iTime + p.z)) * .25);
    mat3 i_triMapSamples = mat3(
            step(vec3(mod(p.yz, .2), .2), vec3(.1)),
            step(vec3(mod(p.xz, .2), .2), vec3(.1)),
            step(vec3(mod(p.xy, .2), .2), vec3(.1))
        );
    return i_triMapSamples * abs(n);
}

void main() {
    vec2 i_uv = (gl_FragCoord.xy / vec2(i_X, i_Y) * 2 - 1) * vec2(1, i_Y / i_X);
    vec3 rd = normalize(vec3(i_uv, 1));
    vec3 p = ro;
    float iterations;
    float d = 1;
    while (distance(p, ro) < renderDist && d > approx && iterations < maxIter)
    {
        d = map(p);
        p += d * rd;
        iterations++;
    }
    if (d < approx)
    {
        vec3 i_n = normal(p);
        color = triplanarMap(p + vec3(0, 0, iTime), i_n) * lightRender(i_n, vec3(10), rd, .5) * pow((1. - distance(ro, p) / renderDist), 2);
    }
    color = sqrt(color);
}
