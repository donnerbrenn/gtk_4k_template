/* File generated with Shader Minifier 1.1.5
 * http://www.ctrl-alt-test.fr
 */
#ifndef VSHADER_H_
# define VSHADER_H_

const char *vshader_vert =
 "#version 400\n"
 "void main()"
 "{"
   "gl_Position=vec4(gl_VertexID%2==1?1:-1,gl_VertexID%4/2==1?1:-1,0,0);"
 "}";

#endif // VSHADER_H_
