#version 400
void main() {
    float i_x = gl_VertexID % 2 * 2 - 1;
    float i_y = gl_VertexID / 2 * 2 - 1;
    gl_Position = vec4(i_x, i_y, 1, 1);
}
