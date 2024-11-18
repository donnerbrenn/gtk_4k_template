#version 400
void main()
{
    float i_xpos = gl_VertexID % 2 * 2 - 1;
    float i_ypos = gl_VertexID / 2 * 2 - 1;
    gl_Position = vec4(i_xpos, i_ypos, 1, 1);
}
