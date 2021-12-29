/* File generated with Shader Minifier 1.1.6
 * http://www.ctrl-alt-test.fr
 */
#ifndef SHADERS_H_
# define SHADERS_H_
#define VAR_ITIME B

const char *vshader_vert =
 "#version 400\n"
 "out vec2 A;"
 "void main()"
 "{"
   "gl_Position.xy=A=vec2(gl_VertexID%2*2-1,gl_VertexID/2*2-1);"
 "}";

const char *shader_frag =
 "#version 400\n"
 "in vec2 A;"
 "uniform float B;"
 "void main()"
 "{"
   ""
   "gl_FragColor.xyz=abs(vec3(sin(A.x+B*.123),sin(A.y-B*.321),sin(A.x-A.y+B*.012)));"
 "}";

#endif // SHADERS_H_
