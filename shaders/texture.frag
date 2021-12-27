
out vec3 color;
float approx=.001;
float renderDist=15;
float maxIter=1000;
uniform float iTime;
vec3 ro=vec3(0);

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

float sdPlane(vec3 p, vec4 n)
{
    return dot(p, n.xyz) + n.w;
}

float sdRoundbox( vec3 p, vec3 b, float r)
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}

float hash21(vec2 p) {
    p = fract(p * vec2(233.34, 851.74));
    p += dot(p, p + 23.45);
    return fract(p.x * p.y);
}

vec2 hash22(vec2 p) {
    float k = hash21(p);
    return vec2(k, hash21(p + k));
}


float map(vec3 p)
{

    p.z+=iTime;
    p=rotate(p,vec3(0,0,sin(iTime*1+p.z))*.25);
    float plane=sdPlane(p,vec4(0,3.14/4,0,.5));   
    p.xz=mod(p.xz,2)-1;

    float sphere=sdRoundbox(p,vec3(.1,8,.3),.1);
    return min(plane,sphere);
}

vec3 normal(vec3 p) 
{
    mat3 k = mat3(p,p,p) - mat3(0.005);
    return normalize(map(p) - vec3( map(k[0]),map(k[1]),map(k[2])) );
}

float lightRender(vec3 n,vec3 l, vec3 v, float strength)
{
      return ((dot(n,normalize(l))*.5+.5)+pow(max(dot(v,reflect(normalize(l),n)),0),10))*strength;
}

vec3 triplanarMap(vec3 p, vec3 n, float o)
{
//        p.z+=iTime;
        p=rotate(p,vec3(0,0,sin(iTime+p.z))*.25);

    // Take projections along 3 axes, sample texture values from each projection, and stack into a matrix
    mat3 triMapSamples = mat3(
    step(vec3(mod(p.yz,.2),.2),vec3(.1)),
    step(vec3(mod(p.xz,.2),.2),vec3(.1)),
    step(vec3(mod(p.xy,.2),.2),vec3(.1))
    );
 
    // Weight three samples by absolute value of normal components
    return triMapSamples * abs(n);
}

void main()
{
    vec2 uv=UV*vec2(1,i_Y/i_X);
    
    vec3 rd=normalize(vec3(uv,1));
    vec3 p=ro;

    float iterations;
    float d=1;
    while(distance(p,ro)<renderDist&&d>approx&&iterations<maxIter)
    {
        d=map(p);
        p+=d*rd;
        iterations++;
    }
    if(d<approx)
    {
        vec3 n=normal(p);
        color=triplanarMap(p+vec3(0,0,iTime),n,.5);
        color*=lightRender(n,vec3(10),rd,.5);
        color*=pow((1.-distance(ro,p)/renderDist),2);
    }
    color=sqrt(color);
//    color.yz=vec2(0);
//    color.r+=iterations*(1/maxIter);
//    if(color.r==1.) color.g=1;
//    else color.b=1;
}
