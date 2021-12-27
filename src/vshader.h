/* File generated with Shader Minifier 1.1.6
 * http://www.ctrl-alt-test.fr
 */
#ifndef VSHADER_H_
# define VSHADER_H_
# define VAR_U "v"

const char *vshader_vert =
 "#version 400\n"
 "out vec2 v;"
 "void main()"
 "{"
   "gl_Position.xy=v=vec2(gl_VertexID%2==1?1:-1,gl_VertexID/2==1?1:-1);"
 "}";

#endif // VSHADER_H_
