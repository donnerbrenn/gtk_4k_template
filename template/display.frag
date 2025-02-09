#version 400
vec2 uv = gl_FragCoord.xy / vec2(2560, 1440);
out vec3 color;

uniform sampler2D renderedTexture;
uniform float time;

void main() {
    color = texture(renderedTexture, uv + 0.005 * vec2(sin(time + 1024.0 * uv.x), cos(time + 768.0 * uv.y))).xyz;
}
