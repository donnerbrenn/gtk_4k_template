#version 400

// 0, 1, 2, 3
void main()
{
      gl_Position=vec4(gl_VertexID%2*2-1,gl_VertexID/2*2-1,1,1);
}