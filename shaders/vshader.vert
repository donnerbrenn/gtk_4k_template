#version 400
void main()
{
      gl_Position=vec4(gl_VertexID%2==1?1:-1,gl_VertexID%4/2==1?1:-1,0,0);
}