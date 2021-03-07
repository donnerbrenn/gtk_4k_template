vec2 uv = ((gl_FragCoord.xy.xy/iResolution)*2-1)*vec2(1,iResolution.y/iResolution.x);
float threshold=.01;
float iter=.0;
uniform float iTime;
vec3 ro=vec3(0.,0.,-6.);
vec3 rd=normalize(vec3(uv,1));
vec3 p=ro;
vec3 lp[3];
vec3 lc[3];
out vec3 color;


#define black vec3(-.015)
#define red vec3(.4,.0,.0)
#define ground vec3(.03)
#define blue vec3(.4,.4,.8)
float PI=acos(-1.);


float hash21(vec2 p) {
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

struct material
{
    float d;
    vec3 col;
    bool hit;
};

//by iq
float dot2( vec2 v ) { return dot(v,v); }

//by iq
material sdCappedCone ( vec3 p, float h, float r1, float r2, float r3, vec3 col )
{
  vec2 q = vec2( length(p.xz), p.y );
  vec2 k1 = vec2(r2,h);
  vec2 k2 = vec2(r2-r1,2.0*h);
  vec2 ca = vec2(q.x-min(q.x,(q.y<0.0)?r1:r2), abs(q.y)-h);
  vec2 cb = q - k1 + k2*clamp( dot(k1-q,k2)/dot2(k2), 0.0, 1.0 );
  float s = (cb.x<0.0 && ca.y<0.0) ? -1.0 : 1.0;
  float d = s*sqrt( min(dot2(ca),dot2(cb)))-r3;
  return material(d,col,false);
}

//by iq
material sdRoundBox( vec3 p, vec3 b, float r, vec3 color)
{
  vec3 q = abs(p) - b;
  float d= length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
  return material(d,color,false);
}


//by iq
material sdPlane( vec3 p, vec3 n, float h, vec3 color)
{
  float d=dot(p,n) + h;
  return material(d,color,false);
}

material _min(material a, material b)
{
    return a.d<b.d?a:b;
}

material _max(material a, material b)
{
    return a.d>b.d?a:b;
}

float softmin(float f1, float f2, float val)
{
      float e = max(val - abs(f1 - f2), 0.0);
      return min(f1, f2) - e*e*0.25 / val;     
}

material map(vec3 p)
{
    vec3 planepos;
    vec3 ballpos=p-vec3(2.,0,0);
    vec3 cubepos=rotate(p+vec3(2.,0,0),vec3(iTime*.25));
    vec3 conepos=rotate(p+vec3(0,-16.,.0),vec3(PI*.5,PI*.5,0.));
    
    //material ( vec3 p, float h, float r1, float r2, float r3, vec3 col )
    
    planepos=p+vec3(0,1.25,0);
    planepos.y+=(sin(planepos.x+iTime)+sin(planepos.z+iTime*.98))*.1;
    planepos=rotate(rotate(planepos,vec3(-.7,.0,-.04)),vec3(0,1.1,0));


    
    material ball=sdRoundBox(ballpos,vec3(.0),1.,red);
    material cube=sdRoundBox(cubepos,vec3(.75),.25,red);
    material plane=sdPlane(planepos,vec3(0,1,0),1.,ground);
    material cone=sdCappedCone(conepos,100.,.2,.2,3.,blue);
    
    material final=_min(plane,ball);
    final=_min(final,cube);
    final=_min(final,cone);

    return final;
}

material march(vec3 ro, vec3 rd, float len)
{

    material result;
    while( iter<800&&distance(ro,p)<len &&!result.hit)
    {
        p+=result.d*rd;
        result=map(p);
        result.hit=result.d<threshold;
        iter+=1.;
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
    vec3 oc;
    float diffuse[4];
    float specular[4];

    for(int i=0;i<3;i++)
    {

        diffuse[i]=max(.0,dot(reflect(lp[i],n),rd));

        specular[i]=pow(diffuse[i],64);
        float s=softshadow(p,lp[i],.1,20.,100);
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

    material res=march(ro,rd,200);
    vec3 n=normal(p);
    if(res.hit)
    {
        color=calcLight(p+n*.01,n,res.col,.1);
//        if(res.col==red)
        {
            p+=n*.01;
            rd=normalize(reflect(rd,n));   
            res=march(p,rd,20.5);
            if(res.hit)
            {
                color=mix(color,calcLight(p,normal(p),res.col,.5),.1);
            }
        }
    }
//    color*=1.-(distance(ro,p)*.05);
    color=pow(color,vec3(.4545));
}