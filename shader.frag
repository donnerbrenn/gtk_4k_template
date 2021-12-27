#version 400
in vec2 UV;
float i_X=2560.;
float i_Y=1440.;
// watch it in your browser
uniform float iTime;
out vec3 fragColor;
vec3 p;

vec3 rotate(vec3 p,vec3 t)
{
      float c=cos(t.x),s=sin(t.x);
      mat3 m=mat3(vec3(1,0,0),vec3(0,c,-s),vec3(0,s,c));
      c=cos(t.y);s=sin(t.y);
      m*=mat3(vec3(c,0,s),vec3(0,1,0),vec3(-s,0,c));
      c=cos(t.z);s=sin(t.z);
      m*=mat3(vec3(c,-s,0),vec3(s,c,0),vec3(0,0,1));
      return m*p;
}

float sdTorus( vec3 p, vec2 t )
{
  vec2 i_q = vec2(length(p.xz)-t.x,p.y);
  return length(i_q)-t.y;
}

float map(vec3 p)
{
    p.z+=1.9;
    p=rotate(p,vec3(.1,.0,.0));
    return -sdTorus(p,vec2(1.1,.7));
}


float march(vec3 ro, vec3 rd)
{
    p=ro;
    float d=1.;
    while(d>.001&&distance(ro,p)<20.)
    {
        p+=rd*d;
        d=map(p);
    }
    return d;
}

vec3 normal(vec3 p) 
{
    mat3 k = mat3(p,p,p) - mat3(0.01);
    return normalize(map(p) - vec3( map(k[0]),map(k[1]),map(k[2])) );
}

float lightRender(vec3 n,vec3 l, vec3 v, float strength)
{
    float i_ambient=abs(dot(n,normalize(l)));
    float i_specular=abs(pow(max(dot(v,reflect(normalize(l),n)),0),1.))*.5;
    return(i_ambient+i_specular)*strength;

}

void main(void)
{
    vec3 i_ro=vec3(.0,0,-4);
    float d=march(i_ro,normalize(vec3(UV*vec2(1,i_Y/i_X),1.)));
    float i_l=lightRender(normal(p),vec3(1,0,-1),p.xyz,.125);
    float i_x=atan(-p.x,p.z);
    float i_y=atan(length(p.xz),-p.y);
    fragColor=(smoothstep(-.025,.025,sin(i_y*70.+i_x*45.+iTime*2))*.125+.125+vec3(.125,.5,1.))*.5-i_l;
}