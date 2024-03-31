#version 400

float i_X=2560.;
float i_Y=1440.;
// watch in your browser at https://www.shadertoy.com/view/3dScRc
uniform float iTime;
out vec3 Frag;

vec3 rotate(vec3 p, vec3 t) {
    vec3 c = cos(t);
    vec3 s = sin(t);
    return mat3(
        vec3(c.y * c.z, s.x * s.y * c.z - s.z * c.x, s.x * s.z + c.x * s.y * c.z),
        vec3(c.y * s.z, s.x * s.y * s.z + c.x * c.z, c.x * s.y * s.z - s.x * c.z),
        vec3(-s.y, s.x * c.y, c.x * c.y)
    ) * p;
}

//SDF-Functions
float sdRoundBox(vec3 p,vec3 b,float r)
{
    vec3 q=abs(p)-b;
    return length(max(q,0))+min(max(q.x,max(q.y,q.z)),0)-r;
}

float softmin(float f1,float f2,float val)
{
    float i_e=max(val-abs(f1-f2),0);
    return min(f1,f2)-pow(i_e/2,2)/val;
}

float map(vec3 p)
{
    float i_myplane=sdRoundBox(rotate(p,vec3(1.5,0,0))-vec3(0,0,1.5),vec3(20,20,1e-2),.1);
    float i_mycube=sdRoundBox(rotate(p,vec3(1,iTime,sin(iTime*.5)*.5))+vec3(0,.5,0),vec3(.75/2),.1);
    return(softmin(i_myplane,i_mycube,1));
}

vec3 normal(vec3 p)
{
    mat3 k=mat3(p,p,p)-mat3(1e-3);
    return normalize(map(p)-vec3(map(k[0]),map(k[1]),map(k[2])));
}

float ambient_omni(vec3 p,vec3 l)
{
    float i_d=1.-abs(length(p-l))/100;
    return pow(i_d,32)*1.5;
}

//SHADOW
float softshadow(in vec3 ro,in vec3 rd,float mint,float maxt,float k)
{
    float res=1;
    float ph=1e20;
    for(float t=mint;t<maxt;)
    {
        float h=map(ro+rd*t);
        if(h<1e-4)return 0;
        float y=h*h/(2*ph);
        float i_d=sqrt(h*h-y*y);
        res=min(res,k*i_d/max(0,t-y));
        ph=h;
        t+=h;
    }
    return res;
}

// MAINLOOP
void main()
{
    vec2 uv=(gl_FragCoord.xy/vec2(i_X,i_Y)*2-1)*vec2(1,i_Y/i_X);
    vec3 i_ro=vec3(0,0,-3.5);
    vec3 p=i_ro;
    vec3 i_rd=normalize(vec3(uv,1));
    bool hit=false;
    
    while(p.z<20)
    {
        float d=map(p);
        if(d<1e-4)
        {
            hit=true;
            break;
        }
        p+=i_rd*d;
    }
    
    float t=length(i_ro-p);
    if(hit)
    {
        vec3 i_n=normal(p);
        vec3 i_l1=vec3(1,.5,-.25);
        float rl=ambient_omni(p,i_l1)*(dot(i_n,normalize(i_l1))*.5+.5)*.25+pow(max(dot(i_rd,reflect(normalize(i_l1),i_n)),0),128)*.9;
        Frag=vec3(rl)+vec3(.1,.4,.1);
        Frag=mix(vec3(0),Frag,softshadow(i_ro+t*i_rd,normalize(i_l1),1e-2,10,20)*.25+.75);
    }
    Frag*=mix(Frag,vec3(1),1-exp(-.1*pow(t,128)));
    Frag-=t*.05;
}