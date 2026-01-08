// watch in your browser at https://www.shadertoy.com/view/3dScRc
uniform float u_time;
out vec3 Frag;

vec3 rotate(vec3 p, vec3 t) {
    vec3 s = sin(t);
    vec3 c = cos(t);
    return mat3(
        vec3(c.y * c.z, s.x * s.y * c.z - s.z * c.x, s.x * s.z + c.x * s.y * c.z),
        vec3(c.y * s.z, s.x * s.y * s.z + c.x * c.z, c.x * s.y * s.z - s.x * c.z),
        vec3(-s.y, s.x * c.y, c.x * c.y)
    ) * p;
}

float sdRoundBox(vec3 p, vec3 b, float r) {
    vec3 q = abs(p) - b;
    return length(max(q, 0)) + min(max(q.x, max(q.y, q.z)), 0) - r;
}

float softmin(float f1, float f2, float val) {
    float i_e = max(val - abs(f1 - f2), 0);
    return min(f1, f2) - pow(i_e / 2, 2) / val;
}

float map(vec3 p) {
    float i_myplane = sdRoundBox(rotate(p, vec3(1.5, 0, 0)) - vec3(0, 0, 1.5), vec3(20, 20, 1e-2), .1);
    float i_mycube = sdRoundBox(rotate(p, vec3(1, u_time, sin(u_time * .5) * .5)) + vec3(0, .5, 0), vec3(.75 / 2), .1);
    return (softmin(i_myplane, i_mycube, 1));
}

// vec3 normal(vec3 p) {
//     vec3 eps = vec3(.01, 0, 0);
//     return normalize(vec3(map(p + eps.xyy), map(p + eps.yxy), map(p + eps.yyx)));
// }
vec3 normal(vec3 p) {
    mat3 k = mat3(p, p, p) - mat3(1e-4);
    return normalize(map(p) - vec3(map(k[0]), map(k[1]), map(k[2])));
}

float softshadow(in vec3 ro, in vec3 rd, float mint, float maxt, float k) {
    float res = 1;
    float ph = 1e20;
    for (float t = mint; t < maxt; ) {
        float h = map(ro + rd * t);
        if (h < 1e-4) return .0;
        float y = h * h / (2 * ph);
        float i_d = sqrt(h * h - y * y);
        res = min(res, k * i_d / max(0, t - y));
        ph = h;
        t += h;
    }
    return res;
}

void main() {
    // Frag = vec3(0);
    vec2 i_uv = (gl_FragCoord.xy / vec2(i_X, i_Y) * 2 - 1) * vec2(1, i_Y / i_X);
    vec3 i_rd = normalize(vec3(i_uv, 1));
    vec3 ro = vec3(0, 0, -3.5);
    vec3 p = ro;
    bool hit;

    while (p.z < 20) {
        float d = map(p);
        if (hit = d < 1e-4) {
            break;
        }
        p += i_rd * d;
    }

    float t = length(ro - p);
    if (hit) {
        vec3 i_n = normal(p);
        vec3 i_l1 = vec3(1, .5, -.25);
        float ambient = (dot(reflect(i_rd, i_n), normalize(i_l1)) * .5 + .5);
        float i_specular = pow(ambient, 128);
        float i_light = ambient * .25 + i_specular;
        vec3 i_Frag = vec3(.1, .4, .1) + i_light;
        Frag = mix(vec3(0), i_Frag, softshadow(ro + t * i_rd, normalize(i_l1), 1e-2, 10, 20) * .25 + .75);
        Frag = Frag * mix(Frag, vec3(1), 1 - exp(-.1 * pow(t, 128))) - t * .05;
    }
    else {
        Frag = vec3(0);
    }
}
