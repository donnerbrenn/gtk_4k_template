float i_THRESHOLD = .001;
uint i_SAMPLES = 100;
uint i_BOUNCES = 8;
float i_FOVDegrees = 95;

float pi = acos(-1);
uint state = uint(gl_FragCoord.x * gl_FragCoord.y) * 0x27d4eb2d;
out vec4 Frag;

struct MA {
    vec3 A; // Albedo
    float P; // Specularity
    float H; // Sharpness
    float E; // emission
    float M; // Metalness
} material;

MA i_MWalls = MA(vec3(.01), .9, 128, 0, .5);
MA i_Mred = MA(vec3(.55, .01, .01), .125, 4, 0, 0);
MA i_Mblack = MA(vec3(.02), 1, 128, 0, .925);
MA i_Mwhite = MA(vec3(.8), .025, 8, 0, .05);
MA i_Mbrown = MA(vec3(.6, .3, .03), .9, 64, 0, .35);
MA i_Mfloor = MA(vec3(.1, .045, .015), .5, 128, 0, .5);
MA i_Mspace = MA(vec3(.7, .7, .99), .1, 1, 2, 1);
MA i_Mgreenlight = MA(vec3(.01, .9, .01), 0, 128, 1, 0);
MA i_Mgray = MA(vec3(.1), 0, 0, 0, 0);
MA i_Msilver = MA(vec3(1), 1, 32, 0, 1);

vec3 attentuation = vec3(0);

float hash(float n) {
    return fract(sin(n) * 1e4);
}

float noise(vec2 p) {
    return mix(
        mix(hash(dot(floor(p), vec2(1, 57))),
            hash(dot(floor(p) + vec2(1, 0), vec2(1, 57))), fract(p.x)),
        mix(hash(dot(floor(p) + vec2(0, 1), vec2(1, 57))),
            hash(dot(floor(p) + vec2(1, 1), vec2(1, 57))), fract(p.x)),
        fract(p.y));
}

// Holzmaserungs-Intensität als float zurückgeben
float woodPattern(vec3 p) {
    float ringCoord = p.x + noise(p.yz * 4.0) * 0.5; // Ringe + Verzerrung
    float rings = sin(ringCoord * 12.0); // Frequenz der Ringe
    float grain = noise(p.xy * 30.0) * 0.2; // feine Struktur
    float intensity = abs(rings) + grain;
    return clamp(intensity, 0.0, 1.0);
}

float softmin(float f1, float f2, float val) {
    float diff = abs(f1 - f2);
    return min(f1, f2) - max(val - diff, 0.0) * (val - diff) * 0.25 / val;
}

vec3 rotate(vec3 p, vec3 t) {
    vec3 c = cos(t);
    vec3 s = sin(t);
    mat3 i_rx = mat3(1, 0, 0, 0, c.x, -s.x, 0, s.x, c.x);
    mat3 i_ry = mat3(c.y, 0, s.y, 0, 1, 0, -s.y, 0, c.y);
    mat3 i_rz = mat3(c.z, -s.z, 0, s.z, c.z, 0, 0, 0, 1);
    return i_rz * i_ry * i_rx * p;
}

float fCappedCone(vec3 p, float h, float r1, float r2) {
    vec2 q = vec2(length(p.xz), p.y), k = vec2(r2 - r1, 2 * h), c = vec2(r2, h), s = q - c;
    q -= c - k * clamp(dot(-s, k) / dot(k, k), 0., 1.);
    return (dot(s, q) < 0. ? -1 : 1) * sqrt(min(dot(vec2(q.x - (q.y < 0. ? r1 : r2 > 0 ? r2 : r1), abs(q.y) - h), vec2(q.x - (q.y < 0. ? r1 : r2 > 0 ? r2 : r1), abs(q.y) - h)), dot(q, q)));
}
float wang_hash(inout uint seed) {
    seed ^= 61u ^ (seed >> 16) * 9u ^ (seed >> 4) * 0x27d4eb2du ^ (seed >> 15);
    return float(seed) * (1. / 4294967296.);
}

vec3 rndVector(inout uint state) {
    float z = wang_hash(state) * 2. - 1.;
    float a = wang_hash(state) * 2. * pi;
    return vec3(sqrt(1. - z * z) * cos(a), sqrt(1. - z * z) * sin(a), z);
}

float fPlane(vec3 p, vec3 n, float distance) {
    return dot(p, n) + distance;
}

void pModInterval1(inout float p, float size, float start, float stop) {
    float i_halfSize = size * .5;
    float c = floor((p + i_halfSize) / size);
    p = mod(p + i_halfSize, size) - i_halfSize;
    p += size * (clamp(c, start, stop) - c);
}

float fTorus(vec3 p, vec2 t) {
    vec2 i_q = vec2(length(p.xy) - t.x, p.z);
    return length(i_q) - t.y;
}

float fBox(vec3 p, vec3 d) {
    vec3 q = abs(p) - d;
    return length(max(q, .0)) + min(max(q.x, max(q.y, q.z)), .0);
}

float fTable(vec3 p, vec3 o, vec3 s, float L) {
    float i_table = fBox(p + o, s);
    float i_l1 = fBox(p + o + vec3(-s.x + L, 1, -s.z + L), vec3(s.y, 1, s.y));
    float i_l2 = fBox(p + o + vec3(s.x - L, 1, -s.z + L), vec3(s.y, 1, s.y));
    float i_l3 = fBox(p + o + vec3(-s.x + L, 1, s.z - L), vec3(s.y, 1, s.y));
    float i_l4 = fBox(p + o + vec3(s.x - L, 1, s.z - L), vec3(s.y, 1, s.y));
    return min(min(min(min(i_table, i_l1), i_l2), i_l3), i_l4);
}

float fCapsule(vec3 p, float h, float r) {
    return length(p - clamp(p, vec3(0), vec3(0, h, 0))) - r;
}

float scene(vec3 p) {
    p = rotate(p, vec3(-.7, 1, 0)) + vec3(.8, -1.3, 0);
    float i_ground = fPlane(p, vec3(0, 1, 0), 2);
    float i_wall1 = fBox(p + vec3(0, .6, 0), vec3(2, 1.3, 3));
    float i_wall2 = fBox(p + vec3(-.2, .3, .2), vec3(2, 2, 3));
    float i_room = max(i_wall1, -i_wall2) - .05;
    float i_table = fTable(p, vec3(-.03, .8, -2.1), vec3(1.85, .05, .75), .1);
    float i_board = fBox(p + vec3(0, -.35, -2.6), vec3(1, .02, .25));
    float i_chair = fTable(rotate(p, vec3(0, -.25, 0)), vec3(-.25, 1.2, 0), vec3(.3, .025, .3), .05);
    float i_seatpillow = fBox(rotate(p + vec3(-.3, 1.15, -.06), vec3(0, -.25, 0)), vec3(.28, .03, .28));
    vec3 pz = rotate(p + vec3(.025, 1.2, 0), vec3(0, -.25, 0));
    pModInterval1(pz.z, .09, -3, 3);
    float i_backrest = fCapsule(pz, .75, .02);
    vec3 i_pchair1 = rotate(p, vec3(0, -.25, 0));
    vec3 i_pchair2 = rotate(i_pchair1, vec3(pi / 2, 0, 0));
    float i_chairtop = fCapsule(i_pchair2 + vec3(0, .3, -.45), .6, .04);

    float i_bed1 = fBox(p + vec3(.3, 1.5, 2.2), vec3(1.2, .25, .5)) - .1;
    float i_bed2 = fBox(p + vec3(.3, 1.25, 2.2), vec3(1.4, .1, .6)) - .1;
    float i_bed = min(i_bed1, i_bed2);
    float i_height = .1;
    float i_blanket1 = fBox(p + vec3(-.2, 1.2, 2.2), vec3(.8, i_height, .5));
    float i_blanket2 = fBox(p + vec3(-.2, 1.2 + (sin(p.x * 30) * cos(p.z * 24)) * .01, 2.2), vec3(.58, i_height, .37));
    float i_blanket3 = fBox(p + vec3(-.2, 1.2 + (cos(p.x * 22.3) * cos(p.z * 14.3)) * .02, 2.2), vec3(.58, i_height, .37));
    float i_blanket4 = fBox(p + vec3(-.2, 1.2 + (sin(p.x + p.y) * sin(p.z * 2.5)) * .02 * woodPattern(p), 2.2), vec3(.58, i_height, .37));
    float i_blanket = softmin(mix(softmin(i_blanket1, i_blanket2, .75), i_blanket3, .5), i_blanket4, .75);
    float i_pillow1 = fBox(p + vec3(1.1, 1., 2.2), vec3(.2, .0125, .5)) - .1;
    float i_pillow2 = fBox(p + vec3(1.1, 1., 2.2), vec3(.018, .001, .048));
    float i_pillow = softmin(i_pillow1, i_pillow2, .75);

    float i_monitor1 = fBox(p + vec3(-.25, .25, -2.4), vec3(.5, .3, .03));
    float i_monitor2 = fBox(p + vec3(-.25, .25, -2.37), vec3(.47, .27, .01));
    float i_monitor = max(i_monitor1, -i_monitor2);

    float i_monitorfoot1 = fCappedCone(p + vec3(-.25, .75, -2.5), .03, .2, .2);
    float i_monitorfoot2 = fCappedCone(p + vec3(-.25, .75, -2.5), .04, .15, .15);
    float i_monitorfoot = max(i_monitorfoot1, -i_monitorfoot2);
    // float space = -fBox(p, vec3(50));
    float i_speaker1 = fBox(rotate(p + vec3(.7, .65, -2.5), vec3(0, -.4, 0)), vec3(.1)) - .02;
    float i_speaker2 = fBox(rotate(p + vec3(-1.2, .65, -2.5), vec3(0, .3, 0)), vec3(.1)) - .02;
    float i_keyboard = fBox(p + vec3(-.2, .725, -1.85), vec3(.35, .03, .15)) - .02;
    float i_backlight = fBox(p + vec3(-.2, .7 - .02, -1.85), vec3(.33, .01, .13));
    vec3 xz = p + vec3(-.2, .675, -1.85);
    pModInterval1(xz.x, .05, -6, 6);
    pModInterval1(xz.z, .05, -2, 2);
    float i_keys = fBox(xz, vec3(.019)) - .001;

    float i_stand = fCappedCone(p + vec3(0, -.42, -2.55), .05, .1, .1);
    float i_cube = fBox(rotate(p + vec3(0, -.54, -2.55), vec3(pi * .25, pi * .25, 0)), vec3(.05));

    float i_mouse = fBox(rotate(p + vec3(-.9, .725, -1.85), vec3(0, -.13, 0)), vec3(.05, .04, .1)) - .02;
    float i_mousepad = fBox(p + vec3(-.35, .725, -1.85), vec3(.75, .002, .4));
    float i_carpet = fBox(p + vec3(-.15, 1.75, -.4), vec3(1.75, .002, .8));
    float i_bin1 = fCappedCone(p + vec3(1, 1.5, -1.7), .3, .2, .3);
    float i_bin2 = fCappedCone(p + vec3(1, 1.4, -1.7), .3, .2, .3);
    float i_bin = max(i_bin1, -i_bin2);
    float i_pc = fBox(rotate(p + vec3(-1.5, 1.35, -1.7), vec3(0, .2, 0)), vec3(.175, .4, .35)) - .02;
    float i_fan1 = fTorus(rotate(p + vec3(-1.4, 1.2, -1.34), vec3(0, .2, 0)), vec2(.1, .01));
    float i_fan2 = fTorus(rotate(p + vec3(-1.4, 1.5, -1.34), vec3(0, .2, 0)), vec2(.1, .01));

    float Olights = min(min(i_fan1, i_fan2), i_backlight);
    float Owhite = min(min(min(i_room, i_blanket), i_pillow), i_keys);
    float Oblack = min(min(min(min(min(min(min(i_pc, i_mouse), i_keyboard), i_speaker1), i_speaker2), i_monitorfoot), i_monitor), i_stand);
    float Ored = i_seatpillow;
    float Ogray = min(min(min(i_bed, i_mousepad), i_carpet), i_bin);
    float Obrown = min(min(min(min(i_table, i_chair), i_board), i_backrest), i_chairtop);
    float Osilver = i_cube;
    vec3 p2 = p + vec3(0, 1.85, 0);
    pModInterval1(p2.z, .245, -12, 12);
    float Oplank = fBox(p2, vec3(2.05, .05, .1)) - .02;

    float sdf = min(min(min(min(min(min(min(min(min(Owhite, Ored), Oblack), Obrown), i_ground), i_carpet), Ogray), Olights), Osilver), Oplank);
    if (sdf == Oblack) material = i_Mblack;
    else if (sdf == Owhite) material = i_Mwhite;
    else if (sdf == Ored) material = i_Mred;
    else if (sdf == Obrown) material = i_Mbrown;
    else if (sdf == Ogray) material = i_Mgray;
    else if (sdf == Olights) material = i_Mgreenlight;
    else if (sdf == Osilver) material = i_Msilver;
    else if (sdf == Oplank) material = i_Mfloor;
    else material = i_MWalls;
    if (sdf == Oplank) {
        material.A *= woodPattern(p.xzy * 40);
    }

    if (sdf == Obrown) {
        material.A *= (woodPattern(p.xzy * 60) + 1) * .5;
    }
    return sdf;
}

vec3 normal(vec3 p) {
    mat3 k = mat3(p, p, p) - mat3(.00001);
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

vec3 calcLight(vec3 rd, vec3 ld, vec3 n, vec3 color) {
    float light = max(dot(rd, reflect(normalize(ld), n)), .0);
    return color * material.A * attentuation * light + pow(light, material.H) * material.P;
}
void main() {
    vec2 uv = (gl_FragCoord.xy / vec2(i_X, i_Y) * 2 - 1) / vec2(1, i_X / i_Y);
    Frag.rgba = vec4(0);
    vec3 i_lp1 = vec3(2, -2, 2);
    vec3 n;
    vec3 ro;
    vec3 d;
    float i_cameraDistance = 1. / tan(i_FOVDegrees * .5f * pi / 180);
    for (int j = 0; j < i_SAMPLES; j++) {
        d = normalize(vec3(uv, i_cameraDistance));
        ro = vec3(uv, -5);
        attentuation = vec3(.5, .5, 1);
        for (int i = 0; i < i_BOUNCES + 1 && march(ro, d); i++) {
            n = normal(ro);
            vec3 spec = attentuation * material.E;
            spec += spec * pow(max(dot(reflect(d, n) - d, n), 0), material.H) * material.P * material.E;
            vec3 i_l1 = calcLight(d, i_lp1, n, vec3(.8));
            vec3 i_reflection = reflect(d, n);
            vec3 i_rnd = normalize(n + rndVector(state));
            d = normalize(mix(i_rnd, i_reflection, material.M));
            attentuation *= material.A;
            Frag += vec4(material.E * material.A + spec + i_l1, 1);
        }
        Frag.rgb += attentuation;
    }
    Frag = vec4(sqrt(Frag.rgb / Frag.a), 1);
}
