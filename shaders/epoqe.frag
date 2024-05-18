float radius = .05;      // radius of o (and the other characters, basically)
float width = .005;      // stroke width of font
float char_offset = .15; // distance of letters to each other
out vec4 fragColor;
vec2 i_Resolution = vec2(i_X, i_Y);

float pi = acos(-1);

vec2 i_p0 = vec2(0);
vec2 p1, p2;

float i_deg_step1 = .04;
float i_deg_step2 = .11;

float i_len_fac1 = .86;
float i_len_fac2 = .9;

float fac = .33;
float fac2 = .368;
float fac3 = 1.05;

const float original_len = .8;

float len = original_len;
float deg = .02;

vec2 p7 = vec2(0, original_len);

mat2 rot(float t) { return mat2(cos(t), sin(t), -sin(t), cos(t)); }

float absmin(float a, float b) {
  return min(abs(b), abs(a)) * max(sign(b), sign(a));
}

float sd_segment(vec2 p, vec2 a, vec2 b) {
  p -= a;
  b -= a;
  float i_h = max(min(dot(p, b) / dot(b, b), 1.), 0.);
  return length(p - b * i_h) * sign(dot(b, vec2(-p.y, p.x)));
}

float sd_box(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.)) + min(max(d.x, d.y), 0.);
}

float sd_ring(vec2 uv) { return abs(length(uv) - radius) - width; }

float sd_ring_section(vec2 p) {
  p = rot(.4 * pi) * p;
  p.x = abs(p.x);
  p = rot(.9 * pi) * p;

  return max(sd_ring(p),
             length(vec2(p.x, max(.0, abs(radius - p.y) - width))) * sign(p.x));
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

float logo(vec2 uv) {
  return min(max(min(min(logo_part(uv), logo_part(uv)), logo_part(uv)),
                 sd_segment(uv, p7 * fac2, p2 * fac3 * fac2)),
             absmin(sd_segment(uv, i_p0, p2 * fac3 * fac),
                    sd_segment(uv, p2 * fac3 * fac, p7 * fac)));
}

float epoqe(vec2 uv) {
  uv.x -= 2. * char_offset;

  float dis = min(sd_ring_section(uv),
                  sd_box(uv - vec2(0, width), vec2(radius, width)));
  uv.x += char_offset;
  dis = min(dis, min(sd_ring(uv),
                     sd_box(uv - vec2(radius, -radius), vec2(width, radius))));
  uv.x += char_offset;
  return min(dis, sd_ring(uv));
}

void main() {
  vec2 uv = 2.5 * (gl_FragCoord.xy - .5 * i_Resolution.xy) / i_Resolution.x;

    
  uv.y += .19;
  uv.x = abs(uv.x);

  float i_dat = logo(uv);
  float dis = min(i_dat, epoqe(uv * .6 - vec2(0, -.1)) / .6);

  fragColor = vec4(dis * i_Resolution.x + 2.5) / 5.;
}
