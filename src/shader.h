/* File generated with Shader Minifier 1.1.5
 * http://www.ctrl-alt-test.fr
 */
#ifndef SHADER_H_
# define SHADER_H_

const char *shader_frag =
 "#version 400\n"
 "vec2 v=vec2(2560,1440);"
 "void main()"
 "{"
   "vec2 r=gl_FragCoord.xy/v.xy*2.-1.;"
   "r.y*=v.y/v.x;"
   "gl_FragColor=abs(r.yxyx);"
 "}";

#endif // SHADER_H_
