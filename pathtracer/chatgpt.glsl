
vec2 resolution = vec2(i_X, i_Y);
uniform float time;

out vec4 FragColor;

#define MAX_BOUNCES 5

float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 randomHemisphere(vec3 n, vec2 seed) {
    float phi = 6.283185 * seed.x;
    float cosTheta = seed.y;
    float sinTheta = sqrt(1.0 - cosTheta * cosTheta);
    vec3 t = normalize(abs(n.x) < 0.5 ? cross(n, vec3(1, 0, 0)) : cross(n, vec3(0, 1, 0)));
    vec3 b = cross(n, t);
    return normalize(sinTheta * cos(phi) * t + sinTheta * sin(phi) * b + cosTheta * n);
}

vec2 map(vec3 p) {
    float sphere = length(p - vec3(0, 1, 0)) - 1.0;
    float ground = p.y;
    return (sphere < ground) ? vec2(sphere, 1.0) : vec2(ground, 2.0);
}

vec3 getNormal(vec3 p) {
    float eps = 1e-4;
    vec2 h = vec2(eps, 0);
    return normalize(vec3(
            map(p + h.xyy).x - map(p - h.xyy).x,
            map(p + h.yxy).x - map(p - h.yxy).x,
            map(p + h.yyx).x - map(p - h.yyx).x
        ));
}

vec3 trace(vec3 ro, vec3 rd, vec2 fragCoord) {
    vec3 col = vec3(0);
    vec3 throughput = vec3(1);

    for (int i = 0; i < MAX_BOUNCES; i++) {
        float t = 0.0;
        for (int j = 0; j < 100; ++j) {
            vec2 d = map(ro + rd * t);
            if (d.x < 0.001) break;
            t += d.x;
            if (t > 100.0) break;
        }
        if (t > 100.0) break;

        vec3 pos = ro + rd * t;
        vec3 n = getNormal(pos);
        float mat = map(pos).y;

        if (mat == 1.0) {
            rd = reflect(rd, n);
            ro = pos + rd * 1e-3;
            throughput *= vec3(1, 0, 0); // rot
        } else {
            vec2 seed = vec2(rand(fragCoord + float(i)), rand(fragCoord + float(i + 1)));
            rd = randomHemisphere(n, seed);
            ro = pos + rd * 1e-3;
            throughput *= vec3(0.4, 0.25, 0.1); // braun
        }

        // Russian Roulette
        if (i > 2) {
            float p = max(throughput.r, max(throughput.g, throughput.b));
            if (rand(fragCoord + float(i) * 1.7) > p) break;
            throughput /= p;
        }
    }

    return col + throughput;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;

    vec3 ro = vec3(0, 1, 5);
    vec3 target = vec3(0, 1, 0);
    vec3 f = normalize(target - ro);
    vec3 r = normalize(cross(vec3(0, 1, 0), f));
    vec3 u = cross(f, r);
    vec3 rd = normalize(f + uv.x * r + uv.y * u);

    vec3 color = trace(ro, rd, gl_FragCoord.xy);
    FragColor = vec4(sqrt(color), 1.0); // gamma correction
}
