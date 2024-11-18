vec2 res = vec2(i_X, i_Y);
uniform float u_time;
float i_threshold = .0001;
float PI = acos(-1);
out vec4 color;
struct mat {
    vec3 cl; //color
    float df; //i_diffuse
    float gs; //gloss
    float sc; //specular
    float rf; //reflection
} material;

mat i_red = mat(vec3(.5, .01, .01), .8, 32, .8, .001);
mat i_white = mat(vec3(.5, .5, .5), .8, 36, .8, .01);
mat i_heaven = mat(vec3(.07, .07, .4), .8, 8, .5, 0);
mat i_floor = mat(vec3(.07, .07, .4), .8, 8, .5, .1);

vec3 rotate(vec3 p, vec3 t) {
    vec3 c = cos(t);
    vec3 s = sin(t);
    mat3 i_rx = mat3(1, 0, 0, 0, c.x, -s.x, 0, s.x, c.x);
    mat3 i_ry = mat3(c.y, 0, s.y, 0, 1, 0, -s.y, 0, c.y);
    mat3 i_rz = mat3(c.z, -s.z, 0, s.z, c.z, 0, 0, 0, 1);
    return i_rz * i_ry * i_rx * p;
}

float fPlane(vec3 p, vec3 n, float distanceFromOrigin) {
    return dot(p, n) + distanceFromOrigin;
}

float fSphere(vec3 p, float r) {
    return length(p) - r;
}

float vmax(vec3 v) {
    return max(max(v.x, v.y), v.z);
}

float fBox(vec3 p, vec3 b) {
    vec3 d = abs(p) - b;
    return length(max(d, vec3(0))) + vmax(min(d, vec3(0)));
}

void pR(inout vec2 p, float a) {
    p = cos(a) * p + sin(a) * vec2(p.y, -p.x);
}

float one(vec3 p, float size) {
    return fSphere(p, .225 * size);
}

float two(vec3 p, float size) {
    pR(p.xy, PI / 4);
    return min(one(p - vec3(.4, .4, 0) * size, size), one(p + vec3(.4, .4, 0) * size, size));
}

float three(vec3 p, float size) {
    pR(p.xy, PI / 4);
    return min(one(p, size), two(p, size));
}

float four(vec3 p, float size) {
    return min(two(p - vec3(.5, 0, 0) * size, size), two(p + vec3(.5, 0, 0) * size, size));
}

float five(vec3 p, float size) {
    return (min(four(p, size), one(p, size)));
}

float six(vec3 p, float size) {
    return min(four(p, size), two(p, size));
}

float die(vec3 p, float size) {
    vec3 p2 = p;
    pR(p.xy, PI / 4);
    float cube = fBox(p, vec3(size + .1)) - .1;
    float ballDistance = size * 1.25;
    float i_eye1 = one(p.xzy - vec3(0, 0, ballDistance), size);
    float i_eye2 = two(p2 + vec3(0, 0, ballDistance), size);
    float i_eye3 = three(p.zyx + vec3(0, 0, ballDistance), size);
    float i_eye4 = four(p.zyx - vec3(0, 0, ballDistance), size);
    float i_eye5 = five(p - vec3(0, 0, ballDistance), size);
    float i_eye6 = six(p.xzy + vec3(0, 0, ballDistance), size);
    float i_eyes = min(i_eye6, min(i_eye5, min(i_eye4, min(i_eye3, min(i_eye1, i_eye2)))));
    float sdf = max(-i_eyes, cube);
    material = sdf == cube ? i_red : i_white;
    return sdf;
}

float map(vec3 p) {
    vec3 i_pp = rotate(p, vec3(u_time, u_time, 0));
    float dice = die(i_pp, .75);
    float sky = -fSphere(p, 30);
    float ground = fPlane(p, vec3(0, 1, 0), 1.5);
    float sdf = min(min(dice, ground), sky);
    material = sdf == ground ? i_floor : sdf == sky ? i_heaven : material;
    return sdf;
}

vec3 normal(vec3 pos) {
    float eps = .0001;
    float d = map(pos);
    return normalize(vec3(map(pos + vec3(eps, 0, 0)) - d,
            map(pos + vec3(0, eps, 0)) - d,
            map(pos + vec3(0, 0, eps)) - d));
}

void main() {
    vec2 i_uv = gl_FragCoord.xy / res.xx - vec2(.5, .25);
    vec3 i_ro = vec3(0, 0, -7);
    vec3 rd = normalize(vec3(i_uv, 1));
    vec3 p = i_ro;
    float d = 1;
    while (d > i_threshold && p.z < 30) {
        p += rd * d;
        d = map(p);
    }
    if (d < i_threshold) {
        vec3 i_n = normal(p);
        float l = dot(reflect(rd, i_n), vec3(.5, 1, -1)) * .5 + .6;
        float i_l = l + pow(l, 64) * .0000025;
        color = sqrt(vec4(material.cl * i_l, 1));
    }
}
