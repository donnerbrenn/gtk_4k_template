uniform float u_time;
out vec4 color;

float map(vec3 p) {
    float i_t = u_time * .1;
    float i_c = cos(i_t);
    float i_s = sin(i_t);
    mat3 i_rx = mat3(1, 0, 0, 0, i_c, -i_s, 0, i_s, i_c);
    mat3 i_ry = mat3(i_c, 0, i_s, 0, 1, 0, -i_s, 0, i_c);
    mat3 i_rz = mat3(i_c, -i_s, 0, i_s, i_c, 0, 0, 0, 1);
    vec3 i_rotate = i_rz * i_ry * i_rx * p;
    vec3 i_p = i_rotate;
    vec3 i_p2 = mod(i_p, .5) - .25;
    return length(i_p2) - .1;
}

void main() {
    vec2 i_uv = (gl_FragCoord.xy - vec2(i_X) * vec2(0.5, .28)) / i_X;
    float i_approx = .001;
    vec3 i_ro = vec3(0, 0, -6);
    vec3 i_rd = normalize(vec3(i_uv, 1));
    vec3 p = i_ro;
    float i_dist = map(p);
    bool i_hit = i_dist < i_approx;
    while (!i_hit && distance(i_ro, p) < 30) {
        if (i_hit) break;
        p += i_dist * i_rd;
    }
    if (i_hit) {
        vec3 i_m = vec3(-1, -1, 0);
        mat3 k = mat3(p, p, p) - mat3(i_approx);
        vec3 i_n = normalize(map(p) - vec3(map(k[0]), map(k[1]), map(k[2])));
        color = vec4(sqrt((sin(p) * 0.5 + 0.5) * (dot(i_n, reflect(i_rd, normalize(i_m))) * .5 + .5 + pow(max(dot(vec3(0, 0, -4), reflect(normalize(i_m), i_n)), 0), 2)) * .23 * 2. / distance(i_ro, p)), 1);
    }
}
