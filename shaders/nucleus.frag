out vec4 frag;
vec2 resolution = vec2(i_X, i_Y);
vec2 uv = ((gl_FragCoord.xy / resolution) * 2 - 1) *
        vec2(1, resolution.y / resolution.x);
uniform float u_time;
float i_threshold = .01;
float i_farplane = 100;
float i_PI = acos(-1);

vec3 erot(vec3 p, vec3 ax, float ro) {
    return mix(dot(ax, p) * ax, p, cos(ro)) + sin(ro) * cross(ax, p);
}

void moda(inout vec2 p, float rep) {
    float per = (2 * i_PI) / rep;
    float a = atan(p.y, p.x);
    a = mod(a, per) - per * 0.5;
    p = vec2(cos(a), sin(a)) * length(p);
}

float cylinder(vec3 p, float r, float height) {
    float i_d = length(p.xz) - r;
    float i_d2 = max(i_d, abs(p.y) - height);
    return i_d2;
}

float pMod1(inout float p, float size) {
    float halfsize = size * 0.5;
    float i_c = floor((p + halfsize) / size);
    p = mod(p + halfsize, size) - halfsize;
    return i_c;
}

int even(int x) {
    return -(x % 2 * 2 - 1);
}

float scene(vec3 p) {
    vec3 pp = p;
    float i_row = pMod1(pp.y, 12);
    pp = erot(pp, normalize(vec3(0, 1, 0)), u_time * even(int(i_row)));
    moda(pp.xz, 7);
    pp.x -= 12;
    float balls = length(pp) - 5;
    pp = p;
    pp = erot(pp, vec3(0, 1, 0), u_time * .3 + pp.y * .03);
    moda(pp.xz, 5);
    pp.x -= 25;
    float bars = length(pp.xz) - 2.5;
    pp = p;
    pp.y = mod(pp.y, 82) - 41;
    float top = cylinder(pp, 28, 1);
    top = max(top, -cylinder(pp, 22, 2));
    float result = min(min(balls, bars), top);
    frag.rgb = result == balls ? vec3(1, 0, 0) : result == top ? vec3(1) : vec3(0, 0, 1);
    if (abs(p.y) < 42)
        return result;
}

vec3 normal(vec3 p) {
    mat3 k = mat3(p, p, p) - mat3(.0125);
    return normalize(scene(p) - vec3(scene(k[0]), scene(k[1]), scene(k[2])));
}

void main() {
    float d = 1;
    vec3 p = vec3(0, 0, -120);
    vec3 i_rd = normalize(vec3(uv, 1));
    while (d > i_threshold && p.z < i_farplane) {
        d = scene(p);
        p += i_rd * d;
    }
    if (d < i_threshold) {
        float light = dot(normalize(vec3(1, 1, -1)), reflect(i_rd, normal(p))) * .5 + .5;
        float i_light = light + pow(light, 16) + .3;
        frag = vec4(frag.rgb * i_light * .5, 1);
    } else {
        uv.y = uv.y * .5 + .5;
        frag = vec4(0, uv.y / 2, 0, 1);
    }
}
