#version 400
out vec2 U;
void main()
{
      gl_Position.xy=U=vec2(gl_VertexID%2==1?1:-1,gl_VertexID/2==1?1:-1);
}