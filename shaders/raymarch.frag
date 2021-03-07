uniform float iTime;
out vec3 color;
float detail=10000;
//vec2 uv=gl_FragCoord.xy/vec2(runtime[1])-vec2(.5,.3);
vec2 uv = (gl_FragCoord.xy-vec2(iResolution.x)*0.5)/iResolution.x;

struct RR
{
      vec3 RC;
      vec3 RP;
      bool RH;
};

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


vec4 _min(vec4 a, vec4 b)
{
      return a.w<b.w?a:b;
}

vec4 _max(vec4 a, vec4 b, bool cut)
{
      b.w*=cut?-1:1;   
      return a.w<b.w?b:a;
}

vec4 softmin(vec4 f1, vec4 f2, float val)
{
      if(val==.0)
            return _min (f1,f2);
      vec4 res;
      float e = max(val - abs(f1.w - f2.w), 0.0);
      res=_min(f1, f2);
      
      res.w-=e*e*0.25 / val;
      res.xyz=mix(f1.xyz,f2.xyz,clamp(abs(f1.w-res.w)/abs(f1.w - f2.w),0,1));
      return res;
}

vec4 sdRoundBox( vec3 p, vec3 b, float r, vec3 color)
{
  vec3 q = abs(p) - b;
  return vec4(color,length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r);
}

vec4 sdCross(vec3 p, vec2 s, float r, vec3 color)
{
      return _min(_min(sdRoundBox(p,s.xyy,r,color),sdRoundBox(p,s.yxy,r,color)),sdRoundBox(p,s.yyx,r,color));
}

vec4 map(vec3 p)
{
      p.y+=2.;

//PILES
// vec3 pillarP=p;

// FIELD OF PILLARS
      // pillarP=rotate(pillarP,vec3(3.14/4,0.,0.));
      // pillarP.xy=mod(pillarP.xy,4.)-2.;
      // vec4 piles=sdRoundBox(pillarP,vec3(1,1,2),.2,vec3(1,0,0)); // sdSphere(pillarP,1.,vec3(1,0,0));
      // vec4 ground=sdRoundBox(rotate(p+vec3(0,2.5,0),vec3(3.14/4,0.,0.)),vec3(400,600,.01),.0,vec3(.6,.6,.6));
      // return _min(piles,ground);


//SIMPLE TEST SCENE
      // vec4 ground=sdRoundBox(rotate(p+vec3(0,2.5,0),vec3(1.,0.,0.)),vec3(40,16,.1),.0,vec3(.26,.26,.26));
      // vec4 sphere=sdRoundBox(p,vec3(0),1.,vec3(1));
      // return _min(sphere,ground);
LIVE


//SIMPLE TEST SCENE 2 CUBE, SPHERE, CUBE
      // vec4 ground=sdRoundBox(rotate(p+vec3(0,2.5,0),vec3(1.,0.,0.)),vec3(40,16,.1),.0,vec3(.6,.6,.6));
      // vec4 wall=sdRoundBox(p-vec3(0,2.5,2.0),vec3(40,16,.1),.0,vec3(.6,.6,.6));
      // vec4 cube=sdRoundBox(p+vec3(2.5,0,0),vec3(1),.0,vec3(1,0,0));
      // vec4 cube2=sdRoundBox(rotate(p-vec3(3.0,0,0),vec3(1,1,0)),vec3(1),.0,vec3(0,0,1));
      // vec4 sphere=sdRoundBox(p,vec3(0),1.,vec3(0,1,0));
      // return _min(_min(_min(_min(sphere,ground),cube),cube2),wall);

//SIMPLE TEST SCENE 3 INFINTE SPHERES
      // p=mod(p,6)-3.;
      // vec4 sphere=sdRoundBox(p,vec3(0),1.,vec3(1,0,0));
      // return sphere;

//SIMPLE TEST SCENE 4 2 SPHERES
      // vec4 ground=sdRoundBox(rotate(p+vec3(0,2.5,0),vec3(1.,0.,0.)),vec3(40,16,.1),.0,vec3(.26,.26,.26));
      // vec4 sphere=sdRoundBox(p-vec3(1.001,0,0),vec3(0),1.,vec3(1));
      // vec4 sphere2=sdRoundBox(p+vec3(1.001,0,0),vec3(0),1.,vec3(1));
      // return _min(_min(sphere,ground),sphere2);


//METABALL GALORE
      // vec4 ground=sdRoundBox(rotate(p+vec3(0,2.5,0),vec3(1.,0.,0.)),vec3(40,16,.1),.0,vec3(0,0,1.));
      // p+=vec3(0,1,0);
      // p=rotate(p,vec3(iTime*.5,iTime*.5,.0));
      // vec4 s1=sdRoundBox(p-vec3(sin(iTime)*2,-1.0,1.0),vec3(0),1.,vec3(.7,.7,.7));
      // vec4 s2=sdRoundBox(p-vec3(cos(iTime)*2,-1.0,.0),vec3(0),1.,vec3(.7,.7,.7));
      // vec4 s3=sdRoundBox(p-vec3(-cos(iTime*.5)*3,-1.0,.0),vec3(0),1.,vec3(.7,.7,.7));
      // vec4 object=softmin(softmin(s1,s2,1.2),s3,1.2);
      // return softmin(object,ground,.2);
      
      
// CUBETHING WITH A BALL IN THE MIDDLE
      vec4 ground=sdRoundBox(rotate(p+vec3(0,2.5,0),vec3(1.,0.,0.)),vec3(40,40,.1),.0,vec3(.2,.2,.2));
      p=rotate(p,vec3(iTime*.5,iTime*.5,.5));
      vec4 final=sdCross(p,vec2(4.5,.89),.21,vec3(.1,.1,.75));
      vec4 box=sdRoundBox(p,vec3(1.),.25,vec3(.1,.75,.1));
      final=_max(box,final, true);
      final=_min(final,sdRoundBox(p,vec3(.0),.4,vec3(.7,.0,.0)));
      final=mix(box,final,sin(iTime)*.5+.5);
      return _min(final,ground);
}

vec3 normal(vec3 p) 
{
    mat3 k = mat3(p,p,p) - mat3(0.001);
    return normalize(map(p).w - vec3( map(k[0]).w,map(k[1]).w,map(k[2]).w ) );
}

float lightRender(vec3 n,vec3 l, vec3 v, float strength)
{
      return ((dot(n,normalize(l))*.5+.5)+pow(max(dot(v,reflect(normalize(l),n)),0),128))*strength;
}

RR march(vec3 ro, vec3 rd, float maxl, float aprox)
{
      rd=normalize(rd);
      RR res;
      res.RP=ro;
      res.RH=false;
      vec4 d;
      for(float l=0; l<maxl;)
      {
            d=map(res.RP);
            if(d.w<aprox)
            {
                  res.RH=true;
                  res.RC=d.xyz;
                  break;
            }
            res.RP+=rd*d.w;
            l+=d.w;
      }
      return res;
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

//Raymarcher
void main()
{
      
      vec3 ro=vec3(.0,.0,-10.5); 
      vec3 n;
      vec3 rd=normalize(vec3(uv,1.));
      float light=.0;

      vec3 l1=vec3(sin(iTime)*3,1.,cos(iTime));
      vec3 l2=vec3(-.3,2.15,-2.25);
      vec3 l3=vec3(-4.2,1.5,-2.25);

      RR res=march(ro,rd,40.,1./detail);

      if (res.RH==true)
      {
            n=normal(res.RP);
            light=lightRender(n,l1+vec3(hash22(uv),.0)*.15,rd,.5);
            light+=lightRender(n,l2,rd,.350);
            light+=lightRender(n,l3,rd,.125);

            color=res.RC*light;
            if(res.RH)
            {
                  res.RP-=rd*.001;
                  vec3 nrd=reflect(rd,n);
                  RR reflection=march(res.RP,nrd,20.,3./detail);
                  n=normal(reflection.RP);
                  light=lightRender(n,l1,nrd,.4);
                  // light+=lightRender(n,l2,nrd,.350);
                  // light+=lightRender(n,l3,nrd,.125);
                  reflection.RC*=light;

                  // nrd=normalize(l1-reflection.RP);
                  // RR shadow=march(reflection.RP*.999,nrd,20.,1./detail);
                  // if(shadow.RH)
                  //       reflection.RC*=.5;
                  color=mix(color, reflection.RC,.125);

                  RR shadow=march(res.RP,l1-res.RP,20.,1./detail);
                  if(shadow.RH)
                        color*=.5;
                  // reflection.RP-=normalize(l1-res.RP)*.001;
                  // shadow=march(reflection.RP,l1-res.RP,20.,1./detail);
                  // if(shadow.RH)
                  //       color*=.5;
            }
      }
      //show raymap
      // color*=0;
      // color.r=length(1./length(res.RP));
}
