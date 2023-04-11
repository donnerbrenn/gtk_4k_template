#version 400
void main()
{
      gl_Position=vec4(gl_VertexID%2*2-1,gl_VertexID/2*2-1,1,1);
      // gl_Position=vec4(gl_VertexID%2==0?-1:1,gl_VertexID%4/2==0?-1:1,1,1);
}