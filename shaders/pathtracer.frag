float iTime=0;
vec2 iResolution=vec2(i_X,i_Y);
vec2 uv=(gl_FragCoord.xy/iResolution*2-1)*vec2(1.78,1)*.75;
vec3 ld1=normalize(vec3( 0, 1, 1));
vec3 ld2=normalize(vec3( 1, 0, -1));
vec3 ld3=normalize(vec3( 1, 0, -1));
vec3 ld4=normalize(vec3( 0, 1, 1));
float th=.01; // threshold;
const float PI=acos(-1);

out vec4 fragment;

vec3 RED   =  vec3(1,0,0);
vec3 GREEN =  vec3(0,1,0);
vec3 BLUE  =  vec3(0,0,1);
vec3 CURRENT;

vec3 erot(vec3 p, vec3 ax, float ro) 
{
  return mix(dot(ax,p)*ax, p, cos(ro))+sin(ro)*cross(ax,p);
}


float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 rand3(vec3 co)
{
       return vec3(rand(co.xy),rand(co.zx),rand(co.yx));       
}

float sphere(vec3 p, float r)
{
    return length(p)-r;
}

float plane(vec3 p, vec3 n, float distanceFromOrigin) {
       return dot(p, n) + distanceFromOrigin;
}

float vmax(vec3 v) {
       return max(max(v.x, v.y), v.z);
}

float box(vec3 p, vec3 b) {
       vec3 d = abs(p) - b;
       return length(max(d, vec3(0))) + vmax(min(d, vec3(0)));
}

float scene(vec3 p)
{
       float heaven=1, ground=1, cube=1, ball=1;
       vec3 pp=p+vec3(0,0,0);
       heaven=-sphere(pp,50);
       ground=plane(p,vec3(0,1,0),5);
       ball=sphere(p+vec3(0,1.,-10),3.5);
       pp=p+vec3(0,2,-10);
       pp.x=mod(pp.x,20)-10;
       pp=erot(pp,normalize(vec3(1,.1,.5)),mod(iTime,6.28));
       cube=box(pp,vec3(4));
       float nearest=min(min(min(cube,heaven),ground),ball);
       if(nearest==cube)
              CURRENT=RED;
       else
              if(nearest==ball)
                     CURRENT=GREEN;
              else
                     CURRENT=BLUE;
       return nearest-.5;
}

vec3 normal(vec3 p)
{
    mat3 k=mat3(p,p,p)-mat3(.0005);
    return normalize(scene(p)-vec3(scene(k[0]),scene(k[1]),scene(k[2])));
}

float calcLight(vec3 p, vec3 mrd, float power, float specularity)
{
       vec3 n=normal(p);
       float light=max(0,dot(reflect(mrd,-n),ld1));
       light+=max(0,dot(reflect(mrd,-n),ld2));
       light+=max(0,dot(reflect(mrd,-n),ld3));
       light+=max(0,dot(reflect(mrd,-n),ld4));
       light/=2;
       light+=pow(light,specularity);
       return (light*power)*.8+.2;
}

vec3 calcMat(vec3 matColor, vec3 p, vec3 mrd, float power, float specularity)
{
       return matColor*calcLight(p, mrd, power, specularity);
}


struct RAY
{
       int    mb;     //max bounces
       int    bnc;      // bounces
       float  dst;      //distance
       float  trvl;      //travel
       float  lgt;      //collected light
       vec3   rd;     //ray direction
       vec3   pos;      //position
       vec3   nrm;      //normal
       vec3   mat;      //material
};

void march(inout RAY ray)
{   
       ray.dst=1;
       while(ray.dst>th && ray.trvl>0)
       {
              ray.dst=scene(ray.pos);
              ray.trvl-=ray.dst;
              ray.pos+=ray.rd*ray.dst;              
       }
       ray.mat+=calcMat(BLUE,ray.pos,ray.rd,.3,64.);
       ray.lgt+=calcLight(ray.pos,ray.rd,.3,64.);
       ray.nrm=normal(ray.pos);
}

void trace(inout RAY ray)
{
       while(ray.bnc<ray.mb && ray.trvl>0)
       {
              march(ray);
              if(ray.dst<th)
              {
                     ray.bnc++;
                     ray.rd=reflect(ray.nrm,ray.rd);
                     ray.pos+=ray.rd;
              }
       }
       ray.lgt/=ray.bnc;
}

void main(void)
{
       RAY target;
       target.pos=vec3(0,0,-3);
       target.rd=normalize(vec3(uv,1));
       target.trvl=100.;
       target.mb=3;
       march(target);
       fragment.xyz=CURRENT;
       if(target.dst<th)
       {
              float l;
              int samples=1800;
              for(int i=0;i<samples;i++)
              {
                     RAY s=target;
                     s.trvl=40;
                     s.rd=erot(s.nrm,normalize(rand3(s.nrm+s.pos+i)),PI);
                     s.pos+=s.rd;
                     trace(s);
                     if(s.dst<th)
                     {
                            l+=s.lgt/(1+s.bnc*.1);
                            fragment.xyz+=(l/samples/s.mb)*.001;
                     }
              }
              fragment.xyz*=target.lgt;
              fragment=sqrt(fragment);
       }
}