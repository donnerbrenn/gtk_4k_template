uniform float iTime;
vec2 uv = (gl_FragCoord-i_iResolution*0.5)/i_iResolution.x;
vec3 ro=vec3(0,0,-4);
vec3 rd=normalize(vec3(uv,1));
float d=1;
bool hit=false;
vec3 p;
float approximation=.001;

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

float roundbox( vec3 p, vec3 b, float r)
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}


float sphere(vec3 p, float r)
{
    return length(p)-r;
}

float map(vec3 p)
{
    
    p=rotate(p,vec3(0,iTime,iTime*.25));
    // p=mod(p,1.)-.5;
    float box=roundbox(p,vec3(1.),.0);
    float sph=sphere(p,1.4);
    float hollowcube=max(box,-sph);
    hollowcube=max(hollowcube,sphere(p,1.5));
    return mix(hollowcube,box,sin(iTime*.1)*.5+.5);
}

vec3 normal(vec3 p) 
{
    mat3 k = mat3(p,p,p) - mat3(0.001);
    return normalize(map(p) - vec3( map(k[0]),map(k[1]),map(k[2]) ) );
}

void main()
{
    p=ro;
    while(d>approximation && distance(p,ro)<100)
    {
        p+=d*rd;
        d=map(p);
        hit=d<approximation;
    }
    gl_FragColor=hit?vec4(normal(p)*.5+.5,1):vec4(vec3(.25),1.);
}