#version 400
out vec2 UV;
void main()
{
      gl_Position.xy=UV=vec2(gl_VertexID%2==1?1:-1,gl_VertexID/2==1?1:-1);
}