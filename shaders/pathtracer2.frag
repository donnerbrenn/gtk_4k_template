#define samples 1000
// in vec2 UV;
out vec4 o_fragment;
vec2 u_resolution=vec2(i_X,i_Y);
float iTime=2;
vec2 uv=((gl_FragCoord.xy/u_resolution)*2-1)*vec2(1,u_resolution.y/u_resolution.x);
float threshold=.01;
float PI=acos(-1);
vec3 color;

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 rand3(vec3 co)
{
       return vec3(rand(co.xy),rand(co.zx),rand(co.yx));       
}

float vmax(vec3 v) {
       return max(max(v.x, v.y), v.z);
}


float sphere(vec3 p, float r)
{
    return length(p)-r;
}

vec3 erot(vec3 p, vec3 ax, float ro)
{
    return mix(dot(ax,p)*ax, p, cos(ro))+sin(ro)*cross(ax,p);
}

float fPlane(vec3 p, vec3 n, float distanceFromOrigin) {
       return dot(p, n) + distanceFromOrigin;
}

float fBox(vec3 p, vec3 b) {
       vec3 d = abs(p) - b;
       return length(max(d, vec3(0))) + vmax(min(d, vec3(0)));
}


float scene(vec3 p)
{
       float ground=fPlane(p,vec3(0,1,0),20);
       float ball=sphere(p+vec3(0,0,0),20);
       float dome=-sphere(p,400);
       
       p=erot(p,vec3(0,1,0),iTime);
       p+=vec3(40,0,0);
       p=erot(p,normalize(vec3(1,1,0)),iTime*.25);
       float box=fBox(p,vec3(10))-3;
       return min(min(min(ground,ball),dome),box);
}

vec3 normal(vec3 p)
{
    mat3 k=mat3(p,p,p)-mat3(threshold);
    return normalize(scene(p)-vec3(scene(k[0]),scene(k[1]),scene(k[2])));
}


float march(inout vec3 p, vec3 rd, float maxtravel)
{
       float d=1;
       while(d>threshold && maxtravel>0)
       {
              d=scene(p);
              p+=rd*d;
              maxtravel-=d;
       }
       return d;       
}

void main()
{
    vec3 p=vec3(0,0,-90);
    vec3 rd=normalize(vec3(uv,1));
    float d=march(p,rd,1000);
    
    
    float light;
    int hits=0;
    float idl=0;
    if(d<threshold)
    {
        vec3 rotation=vec3(p);
        vec3 nrd;
        vec3 n=normal(p);
        vec3 ld=normalize(vec3(0,1,-1));
        vec3 ld1=normalize(vec3(1,1,1));
        vec3 ld2=erot(n,vec3(-1,1,0),.96);
        vec3 ro=p-rd*.2;
        vec3 ron=n;

        light+=max(0,dot(ld,n));
        light+=max(0,dot(ld1,n));
        light+=max(0,dot(ld2,n));
        light/=3;
        light+=pow(light,1600);
        for(int i=0;i<samples;i++)
        {
               rotation=rand3(rotation);
               nrd=erot(n,rotation,PI*.49);
               march(p,nrd,1000);  
               if(d<threshold)
               {
                     n=normal(p);
                     // idl+=max(0,dot(ld,n));
                     // idl+=max(0,dot(ld1,n));
                     idl+=max(0,dot(ld2,n));
                     hits++;
               }
               p=ro;
               n=ron;
        }
    }
    light+=idl/hits;
    light/=2;   
    o_fragment=sqrt(vec4(vec3(.8)*light,1));
}