/* File generated with Shader Minifier 1.1.6
 * http://www.ctrl-alt-test.fr
 */
#ifndef SHADER_H_
# define SHADER_H_
# define VAR_ITIME "m"

const char *shader_frag =
 "#version 400\n"
 "uniform float m;"
 "void main()"
 "{"
   "gl_FragColor=sin(gl_FragCoord*.01+m);"
 "}";

#endif // SHADER_H_
