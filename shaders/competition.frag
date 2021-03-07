vec2 uv = ((gl_FragCoord.xy.xy/iResolution)*2-1)*vec2(1,iResolution.y/iResolution.x);
float threshold=.001;
vec3 ro=vec3(0.,0.,-6.);
vec3 rd=normalize(vec3(uv,1));
vec3 p=ro;
vec3 lp[3];
vec3 lc[3];
out vec3 color;
#define B vec3(-.015)
#define R vec3(.4,.0,.0)
#define G vec3(.03)

//by iq
float dot2( vec2 v ) { return dot(v,v); }
float hash21(vec2 p) 
{
    p = fract(p * vec2(233.34, 851.74));
    p += dot(p, p + 23.45);
    return fract(p.x * p.y);
}

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

struct MA
{
    float d;
    vec3 col;
    bool hit;
};

//by iq
MA sdCappedCone( vec3 p, float h, float r1, float r2, float r3, vec3 col )
{
  vec2 q = vec2( length(p.xz), p.y );
  vec2 k1 = vec2(r2,h);
  vec2 k2 = vec2(r2-r1,2.0*h);
  vec2 ca = vec2(q.x-min(q.x,(q.y<0.0)?r1:r2), abs(q.y)-h);
  vec2 cb = q - k1 + k2*clamp( dot(k1-q,k2)/dot2(k2), 0.0, 1.0 );
  float s = (cb.x<0.0 && ca.y<0.0) ? -1.0 : 1.0;
  float d = s*sqrt( min(dot2(ca),dot2(cb)))-r3;
  return MA(d,col,false);
}

//by iq
MA sdRoundBox( vec3 p, vec3 b, float r, vec3 color)
{
  vec3 q = abs(p) - b;
  float d= length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
  return MA(d,color,false);
}


//by iq
MA sdPlane( vec3 p, vec3 n, float h, vec3 color)
{
  float d=dot(p,n) + h;
  return MA(d,color,false);
}

MA _min(MA a, MA b)
{
    return a.d<b.d?a:b;
}

MA _max(MA a, MA b)
{
    return a.d>b.d?a:b;
}

float softmin(float f1, float f2, float val)
{
      float e = max(val - abs(f1 - f2), 0.0);
      return min(f1, f2) - e*e*0.25 / val;     
}

MA map(vec3 p)
{
    p=rotate(rotate(p,vec3(-.7,.0,-.04)),vec3(0,1.1,0));
    p.y-=1.05;
    p.x+=.5;
    MA plane = sdPlane(p+vec3(0,1.25,0),vec3(0,1,0),1.,G);
    MA stick = sdCappedCone(p+vec3(0,.1,0),1.,.15,.25,0,R);
    MA ring1 = sdCappedCone(p+vec3(0,.6,0),.05,.3,.3,.05,B);
    MA ring2 = sdCappedCone(p+vec3(0,1.,0),.3,.6,.6,.05,B);
    MA base1 = sdRoundBox(p+vec3(0,1.4,0),vec3(.9,.15,.9),.1,B);
    MA bbase1 = sdCappedCone(p+vec3(1.75,1.34,.75),.05,.55,.45,.02,R);
    bbase1.d-=.0005;
    MA bbase2 = sdCappedCone(p+vec3(1.75,1.34,-.75),.05,.55,.45,.02,R);
    bbase1.d-=.0005;
    MA button1 = sdCappedCone(p+vec3(1.75,1.27,.75),.05,.4,.4,.015,R);
    MA button2 = sdCappedCone(p+vec3(1.75,1.27,-.75),.05,.4,.4,.015,R);
    MA base2=sdRoundBox(p+vec3(.5,1.85,0),vec3(1.55,.0,1.05),.45,B);
    MA cable=sdRoundBox(p+vec3(10,sin(p.x*1.8)*.1+2.05,sin((p.x*.0)+sin(p.x*.7))+.75),vec3(8,0,0),.1,B);
    MA ball  = sdRoundBox(p+vec3(.0,-1.,.0),vec3(0),.5,R);
    vec3 mp=mod(p,.0001)-.00005;
    MA grid=sdRoundBox(mp,vec3(.0),hash21(p.xz)*.002,B);
    plane.d=mix(plane.d,grid.d,.05);
    p=rotate(rotate(p,vec3(-.5,0,0)),vec3(0,1.5,0));
    MA ringbase=MA(.0,B,true);
    ringbase.d=softmin(ring2.d,base1.d,.15);
    ringbase.d=softmin(ringbase.d,ring1.d,.05);
    ball = _min(ball,stick);
    ball = _min(ball,base2);
    ball.d=mix(ball.d,grid.d,.3);
    ball = _min(ball,ringbase);
    ball = _min(ball,bbase1);
    ball = _min(ball,bbase2);
    ball = _min(ball,button1);
    ball = _min(ball,button2);
    ball = _min(ball,plane);
    ball = _min(ball,cable);
    return ball;
}

MA march(vec3 ro, vec3 rd, float len)
{
    MA result;
    while( distance(ro,p)<len &&!result.hit)
    {
        p+=result.d*rd;
        result=map(p);
        result.hit=result.d<threshold;
    }
    return result;
}

vec3 normal(vec3 p) 
{
    mat3 k = mat3(p,p,p) - mat3(0.005);
    return normalize(map(p).d - vec3( map(k[0]).d,map(k[1]).d,map(k[2]).d ) );
}


//by iq
float softshadow( in vec3 ro, in vec3 rd, float mint, float maxt, float k )
{
    float res = 1.0;
    float ph = 1e20;
    for( float t=mint; t<maxt; )
    {
        float h = map(ro + rd*t).d;
        if( h<0.001 )
            return 0.0;
        float y = h*h/(2.0*ph);
        float d = sqrt(h*h-y*y);
        res = min( res, k*d/max(0.0,t-y) );
        ph = h;
        t += h;
    }
    return res;
}

vec3 calcLight(vec3 p, vec3 n, vec3 color, float power)
{
    // float diffuse,image,spec;
    // image=length(sin(n*2.5)*.5+.5)/sqrt(1.)*smoothstep(1.,-1.,n.z);
    // diffuse=image;
    // spec=pow(diffuse,128);
    // return color*(diffuse+spec)*power*3;
    vec3 oc;
    float diffuse[4];
    float specular[4];

    for(int i=0;i<3;i++)
    {

        diffuse[i]=max(.0,dot(reflect(lp[i],n),rd));

        specular[i]=pow(diffuse[i],64);
        float s=softshadow(p,lp[i],.1,20.,25);
        oc+=(diffuse[i]*power*.333+specular[i]*power*3)*lc[i]*s;
    }
    return color+oc;
}

void main()
{
    lp[0]=normalize(vec3(0,10,-2.));
    lp[1]=normalize(vec3(-50,20.,-50.));
    lp[2]=normalize(vec3(-50,60.,-7.));
    
    vec2 mlc=vec2(.5,.7);
    lc[0]=mlc.xxy*2;
    lc[1]=mlc.xyx;
    lc[2]=mlc.yxx*.75;

    MA res=march(ro,rd,20);
    vec3 n=normal(p);
    if(res.hit)
    {
        color=res.col;
        color=calcLight(p,n,res.col,.1);
        if(res.col==B)
        {
            p-=rd*.01;
            rd=normalize(reflect(rd,n));   
            res=march(p,rd,2.5);
            if(res.hit)
            {
                color=mix(color,calcLight(p,normal(p),res.col,.1),.1);
            }
        }
    }
    color*=1.-(distance(ro,p)*.05);
    color=pow(color,vec3(.4545));
}