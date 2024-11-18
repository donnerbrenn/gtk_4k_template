vec2 p1, p2, uv;
out vec4 color;

float len = .8;
float deg = .02;
float sdSegment(vec2 a, vec2 b)
{
    b -= a;
    return max(0., dot(vec2(-b.y, b.x), a - uv));
}

float logo_part() {
    p1 = vec2(sin(deg), cos(deg)) * len;
    len *= .9;
    deg += .11;

    p2 = vec2(sin(deg), cos(deg)) * len;
    len *= .86;
    deg += .04;

    return sdSegment(vec2(0), p2) + sdSegment(p2, p1) + sdSegment(p1, vec2(0));
}

void main() {
    vec2 iResolution = vec2(i_X, i_Y);
    uv = gl_FragCoord.xy - iResolution / 2.;

    vec2 p7 = vec2(0, len);

    uv /= iResolution.x / 2.;
    uv.y += .4;
    uv.x *= sign(uv.x);

    color = vec4(sign((logo_part() * logo_part() * logo_part() + sdSegment(p7 * .368, p2 * .3864)) * (sdSegment(vec2(0), p2 * .3465) + sdSegment(p2 * .3465, p7 * .33))));
}
