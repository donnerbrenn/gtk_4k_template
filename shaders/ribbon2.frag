float w = dot(gl_Color.xyz, vec3(1, 256, 65536)) * .25; float oa(vec3 p) {
    return cos(p.x) + cos(p.y * 1.5) + cos(p.z) + cos(p.y * 20.) * .05;
}float ob(vec3 p) {
    return length(max(abs(p - vec3(cos(p.z * 1.5) * .3, -.5 + cos(p.z) * .2, .0)) - vec3(.125, .02, w + 3.), vec3(.0)));
}float o(vec3 p) {
    return min(oa(p), ob(p));
}vec3 gn(vec3 p) {
    vec3 f = vec3(.01, 0, 0);
    return normalize(vec3(o(p + f.xyy), o(p + f.yxy), o(p + f.yyx)));
}void main() {
    vec4 c = vec4(1.0);
    vec2 v = (gl_FragCoord.xy - vec2(640, 360)) / vec2(640, 360);
    vec3 org = vec3(sin(w) * .5, cos(w * .5) * .25 + .25, w), dir = normalize(vec3(v.x * 1.6, v.y, 1.0)), p = org, pp;
    float d = .0;
    for (int i = 0; i < 64; i++) {
        d = o(p);
        p += d * dir;
    }
    pp = p;
    float f = length(p - org) * 0.02;
    dir = reflect(dir, gn(p));
    p += dir;
    for (int i = 0; i < 64; i++) {
        d = o(p);
        p += d * dir;
    }
    c = max(dot(gn(p), vec3(.1, .1, .0)), .0) + vec4(.3, cos(w * .5) * .5 + .5, sin(w * .5) * .5 + .5, 1.) * min(length(p - org) * .04, 1.);
    if (oa(pp) > ob(pp)) c = mix(c, vec4(cos(w * .3) * .5 + .5, cos(w * .2) * .5 + .5, sin(w * .3) * .5 + .5, 1.), .3);
    gl_FragColor = ((c + vec4(f)) + (1. - min(pp.y + 1.9, 1.)) * vec4(1., .8, .7, 1.)) * min(w * .5, 1.);
}
