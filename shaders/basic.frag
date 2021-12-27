
vec2 uv=UV*vec2(1.78,1);
vec3 i_ro=vec3(0,0,0);
vec3 p=i_ro;
vec3 i_rd=normalize(vec3(uv,1.));
vec3 i_ld=normalize(vec3(1,1,-1));
float i_lp=.5;
float aprx=1;
float li;
float i_threshold=.0001;


float map(vec3 p)
{
    return min(length(p-vec3(0,0,3))-1.5,dot(p,vec3(0,1,0))+2);  
}

void main()
{
    for(int i=0;i<1024 && aprx>i_threshold;i++)
    {        
        aprx=map(p);
        p+=i_rd*aprx;
    }
    mat3 k = mat3(p,p,p) - mat3(.05);
    n=normalize(map(p) - vec3( map(k[0]),map(k[1]),map(k[2])));
    li=((.33+max(dot(n,i_ld),0)+pow(max(dot(i_rd, reflect(i_ld,n)), .0), 8))*i_lp);
    gl_FragColor=vec4(vec3(li)*(n*.5+.5),1);
}