// Shader from blackles OpenGL Examples. (optimized)
void main() {
    vec2 i_uv = gl_FragCoord.xy / vec2(i_X, i_Y) * 2 - 1;
    gl_FragColor = abs(i_uv * vec2(1, i_Y / i_X)).yxyx;
}
