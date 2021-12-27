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

// float sdTorus( vec3 p, vec2 t )
// {
//   vec2 q = vec2(length(p.xz)-t.x,p.y);
//   return length(q)-t.y;
// }

float sdSphere(vec3 p, float r)
{
    return length(p)-r;
}

// float sdVerticalCapsule( vec3 p, float h, float r )
// {
//   p.y -= clamp( p.y, 0.0, h );
//   return length( p ) - r;
// }

float sdCylinder( vec3 p, vec3 c )
{
  return length(p.xz-c.xy)-c.z;
}

float map(vec3 p)
{
    p=rotate(p,vec3(iTime*.25,.0,iTime*.25));
    float PI=3.14159,sphere,cylinder;
    p=mod(p,3.)-1.5;

    sphere=sdSphere(p, .25);

    cylinder=sdCylinder(p,vec3(.0,.0,.05));
    p=rotate(p,vec3(0,0,PI*.5));
    cylinder=min(sdCylinder(p,vec3(.0,.0,.05)),cylinder);
    p=rotate(p,vec3(PI*.5,0,0));
    cylinder=min(sdCylinder(p,vec3(.0,.0,.05)),cylinder);
    return min(cylinder,sphere);
}


float march(vec3 ro, vec3 rd)
{
    p=ro;
    float d=1.;
    while(d>.001&&distance(ro,p)<200.)
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
    float ambient=abs(dot(n,normalize(l)));
    float specular=abs(pow(max(dot(v,reflect(normalize(l),n)),0),1.))*1.;
    return(ambient+specular)*strength;

}

void main(void)
{
    vec2 uv=U*vec2(1,i_Y/i_X);
    vec3 ro=vec3(.0,0,-4);
    vec3 rd=normalize(vec3(uv,1.));
    float d=march(ro,rd);
    vec3 n=normal(p);
    float l=lightRender(n,vec3(1,0,-1),p.xyz,.25);
    float x=atan(-p.x,p.z+iTime);
    float y=atan(length(p.xz),-p.y);

    //float bands=mod(8.0 * (x + y + iTime) / 3.14, 1.0);
    
    float bands=sin(y*70.+x*45.+iTime*2);
    float b1=smoothstep(-.025,.025,bands)*.125+1.5;
    
    
    vec3 col=(b1+vec3(.125,.5,1.))*.25;
    
    col*=(1.-(distance(ro,p)/200.))*l;


   fragColor=col;
//    fragColor=sqrt(fragColor);
}