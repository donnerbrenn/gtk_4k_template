uniform float u_time;
float tunnel(vec3 p) {
    return cos(p.x) + cos(p.z) + cos(p.y * 1.5) + cos(p.y * 20) / 20;
}
float ribbon(vec3 p) {
    return length(max(abs(p - vec3(cos(p.z * 1.5) * .3, -.5 + cos(p.z) * .2, 0)) - vec3(.125, .02, u_time + 3), vec3(0)));
}
float scene(vec3 p) {
    return min(tunnel(p), ribbon(p));
}

vec3 getNormal(vec3 p) {
    vec3 eps = vec3(.1, 0, 0);
    return normalize(vec3(scene(p + eps.xyy), scene(p + eps.yxy), scene(p + eps.yyx)));
}

out vec4 color;
void main() {
    vec2 i_v = (gl_FragCoord.xy / vec2(i_X, i_Y) * 2 - 1) * vec2(1, i_Y / i_X) * vec2(1.6, 1);
    vec3 org = vec3(sin(u_time * .5) * .5, cos(u_time * .5) * .25 + .25, u_time);
    vec3 dir = normalize(vec3(i_v, 1));
    vec3 p = org;
    vec3 pp;

    // First raymarching
    for (int i = 0; i < 64; i++)
        p += scene(p) * dir;

    pp = p;
    float i_f = length(p - org) * .02;

    // Second raymarching (reflection)
    dir = reflect(dir, getNormal(p));
    p += dir;
    for (int i = 0; i < 64; i++)
        p += scene(p) * dir;

    color = max(dot(getNormal(p), vec3(.1, .1, 0)), 0) + vec4(.3, cos(u_time * .5) * .5 + .5, sin(u_time * .5) * .5 + .5, 1) * min(length(p - org) * .04, 1);

    // Ribbon n
    if (tunnel(pp) > ribbon(pp))
        color = mix(color, vec4(cos(u_time * .3) * .5 + .5, cos(u_time * .2) * .5 + .5, sin(u_time * .3) * .5 + .5, 1), .3);

    // Final color
    color = sqrt((color + vec4(i_f)) + (1. - min(pp.y + 1.9, 1)) * vec4(1., .8, .7, 1)) * min(u_time * .5, 1);
}
