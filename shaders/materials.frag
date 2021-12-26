uniform float iTime;
out vec3 color;

struct mat
{
    vec3 col;
    float rou;
    float spec;
};


vec2 uv=((gl_FragCoord.xy/vec2(i_X,i_Y))*2.-1.)*vec2(1.,i_Y/i_X);

vec3 n;
vec3 p;

vec3 ro=vec3(.0,.0,-10.);
vec3 rd=normalize(vec3(uv,1.));
vec3 ld=normalize(vec3(-1,1,-1));


mat materials[5];
mat cmat;

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

vec2 box( vec3 p, vec3 b, float r, float material)
{
  vec3 q = abs(p) - b;
  float d= length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
  return vec2(d,material);
}

vec2 _min(vec2 a, vec2 b)
{
    return a.x<b.x?a:b;
}

vec2 _max(vec2 a, vec2 b)
{
    return a.x<b.x?b:a;
}

vec2 map(vec3 p)
{
    vec3 ppos=rotate(p+vec3(0,5,0),vec3(3.14/4,0,0));
    vec3 cpos=rotate(p+vec3(3.,0,0),vec3(iTime,iTime,0));
    vec3 bpos=p+vec3(-3.,0,0);

    vec2 cube=box(cpos,vec3(1.5),.4,3);
    vec2 ball=box(bpos,vec3(.0),1.9,2);
    vec2 plane=box(ppos,vec3(100.,100.,1.),0.,1.);
    
    plane=_min(plane,cube);
    plane=_min(plane,ball);
    
    return plane;
}

vec3 normal(vec3 p) 
{
    mat3 k = mat3(p,p,p) - mat3(0.0001);
    return normalize(map(p).x - vec3( map(k[0]).x,map(k[1]).x,map(k[2]).x ) );
}

vec2 march(vec3 ro, vec3 rd)
{
    p=ro;
    vec2 state;
    for(int i=0;i<128;i++)
    {
        state=map(p);
        if(state.x<.0005)
        {
            return(state);
        }
        p+=rd*state.x;
    }
    return vec2(0);
}

void main()
{
    materials[0]=mat(vec3(.2),.0,.0);
    materials[1]=mat(vec3(.5,0,0),.0,.5);//red
    materials[2]=mat(vec3(0,.3,0),.5,2.);//green
    materials[3]=mat(vec3(0,0,.3),.5,.5);//blue
    vec2 state=march(ro,rd);
    cmat=materials[int(state.y)];

    if(state.y>0)
    {
        //color
        n=normal(p);
        float d=max(.0,dot(ld,n));
        float s=pow(d,cmat.spec*64);
        cmat.col=cmat.col+((d+s)*.3);
        ro=p+n*.001;

        //reflection
        if(cmat.rou>0)
        {
            float rou=cmat.rou;
            rd=reflect(rd,n);
            state=march(ro,rd);
            n=normal(p);
            float d=max(.0,dot(ld,n));
            float s=pow(d,cmat.spec*64);
            cmat.col=mix(cmat.col,cmat.col+(d+s)*.1,rou);
        }
        
        //shadow
        rd=ld;
        state=march(ro,rd);
        if(state.y>.0)
            cmat.col*=.5;

    }
    color=cmat.col;
}