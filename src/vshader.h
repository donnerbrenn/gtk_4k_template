/* File generated with Shader Minifier 1.1.6
 * http://www.ctrl-alt-test.fr
 */
#ifndef VSHADER_H_
# define VSHADER_H_

const char *vshader_vert =
 "#version 400\n"
 "void main()"
 "{"
   "gl_Position.xy=vec2(gl_VertexID%2==1?1:-1,gl_VertexID/2==1?1:-1);"
 "}";

#endif // VSHADER_H_
