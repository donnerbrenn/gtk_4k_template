/* File generated with Shader Minifier 1.1.6
 * http://www.ctrl-alt-test.fr
 */
#ifndef SHADER_H_
# define SHADER_H_
# define VAR_U "m"
# define VAR_COLOR "v"
# define VAR_ITIME "d"

const char *shader_frag =
 "#version 400\n"
 "in vec2 m;"
 "out vec3 v;"
 "float z=.001,f=15,s=1000;"
 "uniform float d;"
 "vec3 y=vec3(0);"
 "vec3 n(vec3 v,vec3 m)"
 "{"
   "float z=cos(m.x),f=sin(m.x);"
   "mat3 r=mat3(vec3(1,0,0),vec3(0,z,-f),vec3(0,f,z));"
   "z=cos(m.y);"
   "f=sin(m.y);"
   "r*=mat3(vec3(z,0,f),vec3(0,1,0),vec3(-f,0,z));"
   "z=cos(m.z);"
   "f=sin(m.z);"
   "r*=mat3(vec3(z,-f,0),vec3(f,z,0),vec3(0,0,1));"
   "return r*v;"
 "}"
 "float t(vec3 v,vec4 z)"
 "{"
   "return dot(v,z.xyz)+z.w;"
 "}"
 "float n(vec3 v,vec3 z,float m)"
 "{"
   "vec3 f=abs(v)-z;"
   "return length(max(f,0.))+min(max(f.x,max(f.y,f.z)),0.)-m;"
 "}"
 "float n(vec2 v)"
 "{"
   "return v=fract(v*vec2(233.34,851.74)),v+=dot(v,v+23.45),fract(v.x*v.y);"
 "}"
 "vec2 t(vec2 v)"
 "{"
   "float z=n(v);"
   "return vec2(z,n(v+z));"
 "}"
 "float e(vec3 v)"
 "{"
   "v.z+=d;"
   "v=n(v,vec3(0,0,sin(d*1+v.z))*.25);"
   "float z=t(v,vec4(0,3.14/4,0,.5));"
   "v.xz=mod(v.xz,2)-1;"
   "float f=n(v,vec3(.1,8,.3),.1);"
   "return min(z,f);"
 "}"
 "vec3 x(vec3 v)"
 "{"
   "mat3 m=mat3(v,v,v)-mat3(.005);"
   "return normalize(e(v)-vec3(e(m[0]),e(m[1]),e(m[2])));"
 "}"
 "float e(vec3 v,vec3 z,vec3 m,float f)"
 "{"
   "return(dot(v,normalize(z))*.5+.5+pow(max(dot(m,reflect(normalize(z),v)),0),10))*f;"
 "}"
 "vec3 e(vec3 v,vec3 z,float m)"
 "{"
   "v=n(v,vec3(0,0,sin(d+v.z))*.25);"
   "mat3 f=mat3(step(vec3(mod(v.yz,.2),.2),vec3(.1)),step(vec3(mod(v.xz,.2),.2),vec3(.1)),step(vec3(mod(v.xy,.2),.2),vec3(.1)));"
   "return f*abs(z);"
 "}"
 "void main()"
 "{"
   "vec2 n=m*vec2(1,.5625);"
   "vec3 r=normalize(vec3(n,1)),t=y;"
   "float l,c=1;"
   "while(distance(t,y)<f&&c>z&&l<s)"
     "c=e(t),t+=c*r,l++;"
   "if(c<z)"
     "{"
       "vec3 a=x(t);"
       "v=e(t+vec3(0,0,d),a,.5);"
       "v*=e(a,vec3(10),r,.5);"
       "v*=pow(1.-distance(y,t)/f,2);"
     "}"
   "v=sqrt(v);"
 "}";

#endif // SHADER_H_