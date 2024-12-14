float i_original_len = .8;
float deg = .02;
float len = i_original_len;
vec2 p1, p2;
float i_radius = .05; // radius of o (and the other characters, basically)
float i_width = .005; // stroke width of font
float i_char_offset = .15; // distance of letters to each other
vec2 i_Resolution = vec2(i_X, i_Y);

vec2 i_p0 = vec2(0);

float i_deg_step1 = .04;
float i_deg_step2 = .11;

float i_len_fac1 = .86;
float i_len_fac2 = .9;

float i_fac = .33;
float i_fac2 = .368;
float i_fac3 = 1.05;

float i_pi = acos(-1);

vec2 i_p7 = vec2(0, i_original_len);

mat2 rot(float t) {
    return mat2(cos(t), sin(t), -sin(t), cos(t));
}

float absmin(float a, float b) {
    return min(abs(b), abs(a)) * max(sign(b), sign(a));
}

float sd_segment(vec2 p, vec2 a, vec2 b) {
    p -= a;
    b -= a;
    float i_h = max(min(dot(p, b) / dot(b, b), 1), 0);
    return length(p - b * i_h) * sign(dot(b, vec2(-p.y, p.x)));
}

float sd_box(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0)) + min(max(d.x, d.y), 0);
}

float sd_ring(vec2 uv) {
    return abs(length(uv) - i_radius) - i_width;
}

float sd_ring_section(vec2 p) {
    p = rot(.4 * i_pi) * p;
    p.x = abs(p.x);
    p = rot(.9 * i_pi) * p;

    return max(sd_ring(p),
        length(vec2(p.x, max(0, abs(i_radius - p.y) - i_width))) * sign(p.x));
}

float logo_part(vec2 p) {
    p1 = vec2(sin(deg), cos(deg)) * len;
    deg += i_deg_step2;
    len *= i_len_fac2;

    p2 = vec2(sin(deg), cos(deg)) * len;
    deg += i_deg_step1;
    len *= i_len_fac1;

    return absmin(absmin(sd_segment(p, i_p0, p2), sd_segment(p, p2, p1)),
        sd_segment(p, p1, i_p0));
}

float epoqe(vec2 uv) {
    vec2 i_uv2 = uv - vec2(2. * i_char_offset, 0);
    float i_dis2 = min(sd_ring_section(i_uv2), sd_box(i_uv2 - vec2(0, i_width), vec2(i_radius, i_width)));
    vec2 i_uv3 = uv - vec2(i_char_offset, 0);
    float i_dis = min(i_dis2, min(sd_ring(i_uv3), sd_box(i_uv3 - vec2(i_radius, -i_radius), vec2(i_width, i_radius))));
    return min(i_dis, sd_ring(uv));
}

void main() {
    vec2 uv = (2.5 * (gl_FragCoord.xy - .5 * i_Resolution) / i_X);
    uv.y += .19;
    uv.x = abs(uv.x);
    float i_logo = min(logo_part(uv), logo_part(uv));
    float i_logo2 = min(i_logo, logo_part(uv));
    float i_logo3 = max(i_logo2, sd_segment(uv, i_p7 * i_fac2, p2 * i_fac3 * i_fac2));
    float i_logo4 = absmin(sd_segment(uv, i_p0, p2 * i_fac3 * i_fac), sd_segment(uv, p2 * i_fac3 * i_fac, i_p7 * i_fac));
    float i_logo5 = min(i_logo3, i_logo4);
    float i_dat = i_logo5;
    float i_dis = min(i_dat, epoqe(uv * .6 - vec2(0, -.1)) / .6);
    gl_FragColor = vec4(i_dis * i_X + 2.5) / 5;
}
