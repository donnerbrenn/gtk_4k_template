uniform float iTime;
vec2 res = vec2(i_X, i_Y);
float threshold = .001;
float PI = acos(-1);
out vec4 color;
struct material
{
    vec3 cl; //color
    float df; //i_diffuse
    float gs; //gloss
    float sc; //specular
    float rf; //reflection
} mat;

material i_red = material(vec3(.5, .01, .01), .8, 32, .8, .001); //red
material i_white = material(vec3(.5, .5, .5), .8, 36, .8, .01); //white
material i_heaven = material(vec3(.07, .07, .4), .8, 8, .5, 0); //heaven
material i_floor = material(vec3(.07, .07, .4), .8, 8, .5, .1); //floor

vec3 rotate(vec3 p, vec3 t) {
    vec3 c = cos(t);
    vec3 s = sin(t);
    mat3 i_rx =
        mat3(1, 0, 0, 0, c.x, -s.x, 0, s.x, c.x);
    mat3 i_ry = mat3(c.y, 0, s.y, 0,
            1, 0, -s.y, 0,
            c.y);
    mat3 i_rz
        = mat3(c.z, -s.z, 0, s.z, c.z, 0, 0, 0, 1);
    return i_rz * i_ry * i_rx *
        p;
}

float fPlane(vec3 p, vec3 n, float distanceFromOrigin)
{
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
    float eye1 = one(p.xzy - vec3(0, 0, ballDistance), size);
    float eye2 = two(p2 + vec3(0, 0, ballDistance), size);
    float eye3 = three(p.zyx + vec3(0, 0, ballDistance), size);
    float eye4 = four(p.zyx - vec3(0, 0, ballDistance), size);
    float eye5 = five(p - vec3(0, 0, ballDistance), size);
    float eye6 = six(p.xzy + vec3(0, 0, ballDistance), size);
    float eyes = min(eye6, min(eye5, min(eye4, min(eye3, min(eye1, eye2)))));
    float sdf = max(-eyes, cube);
    mat = sdf == cube ? i_red : i_white;
    return sdf;
}

float map(vec3 p) {
    p = rotate(p, vec3(0, iTime, 0));
    float dice = die(p, .75);
    float ground = fPlane(p, vec3(0, 1, 0), 1.5);
    float sdf = min(dice, ground);
    mat = sdf == ground ? i_floor : mat;
    return sdf;
}

vec3 normal(vec3 p) {
    mat3 k = mat3(p, p, p) - mat3(1e-3);
    return normalize(map(p) - vec3(map(k[0]), map(k[1]), map(k[2])));
}

void main() {
    vec2 uv = gl_FragCoord.xy / res.xx - vec2(.5, .25);
    vec3 ro = vec3(0, 0, -6);
    vec3 p = ro;
    vec3 rd = normalize(vec3(uv, 1));
    float d = 1;
    while (d > threshold && p.z < 30) {
        p += rd * d;
        d = map(p);
    }
    if (d < threshold) {
        vec3 n = normal(p);
        float l = dot(reflect(rd, n), vec3(1, 1, 0)) * .5 + .7;
        l += pow(l, 32) * .025;
        color = vec4(mat.cl * l, 1);
    }
}
