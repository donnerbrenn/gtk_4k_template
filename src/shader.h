/* File generated with Shader Minifier 1.1.5
 * http://www.ctrl-alt-test.fr
 */
#ifndef SHADER_H_
# define SHADER_H_

const char *shader_frag =
 "\n#version 400\n"
 "void main()"
 "{"
   "gl_FragColor=abs(((gl_FragCoord.xy/vec2(1280.,720.)-1)*vec2(1,.5625)).yxyx);"
 "}";

#endif // SHADER_H_
