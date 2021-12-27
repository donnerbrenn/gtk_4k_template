#version 400
void main()
{
      gl_Position.xy=vec2(gl_VertexID%2==1?1:-1,gl_VertexID/2==1?1:-1);
}