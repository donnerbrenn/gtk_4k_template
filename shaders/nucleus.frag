out vec4 o_fragment;
vec2 u_resolution=vec2(i_X,i_Y);
uniform float iTime;
vec2 uv=((gl_FragCoord.xy/u_resolution)*2-1)*vec2(1,u_resolution.y/u_resolution.x);
float threshold=.1;
float farplane=100;
float PI=acos(-1);
vec3 color;

float vmax(vec2 v) {
	return max(v.x, v.y);
}

float sphere(vec3 p, float r)
{
	return length(p)-r;
}

float pipe(vec2 p, float r)
{
	return length(p) - r;
}

vec3 erot(vec3 p, vec3 ax, float ro)
{
	return mix(dot(ax,p)*ax, p, cos(ro))+sin(ro)*cross(ax,p);
}

void moda (inout vec2 p, float rep)
{
	float per = (2*PI)/rep;
	float a = atan(p.y,p.x);
	float l = length(p);
	float id = floor(a/per);
	a = mod(a,per)-per*0.5;
	p = vec2(cos(a),sin(a))*l;
}

float cylinder(vec3 p, float r, float height) {
	float d = length(p.xz) - r;
	d = max(d, abs(p.y) - height);
	return d;
}

float pMod1(inout float p, float size) {
	float halfsize = size*0.5;
	float c = floor((p + halfsize)/size);
	p = mod(p + halfsize, size) - halfsize;
	return c;
}

int even(int x)
{
	return (x%2)>0?-1:1;
}

float scene(vec3 p)
{
	vec3 pp=p;
	float row=pMod1(pp.y,12);
	pp=erot(pp,normalize(vec3(0,1,0)), iTime*even(int(row)));
	moda(pp.xz,7);
	pp.x-=12;
	float balls=sphere(pp,5);
	pp=p;
	pp=erot(pp,vec3(0,1,0),iTime+pp.y*.03);
	moda(pp.xz,5);
	pp.x-=25;
	float bars=pipe(pp.xz,2.5);
	pp=p;
	pp.y=mod(pp.y,82)-41;
	float top=cylinder(pp,28,1);
	top=max(top,-cylinder(pp,22,2));
	float result=min(min(balls,bars),top);
	color=result==balls?vec3(1,0,0):result==top?vec3(1):vec3(0,0,1);
	if(abs(p.y)<42)
		return result;
}

vec3 normal(vec3 p)
{
	mat3 k=mat3(p,p,p)-mat3(.0125);
	return normalize(scene(p)-vec3(scene(k[0]),scene(k[1]),scene(k[2])));
}

void main()
{
	float d=1;
	vec3 p=vec3(0,0,-120);
	vec3 rd=normalize(vec3(uv,1));
	while(d>threshold && p.z < farplane)
	{
		d=scene(p);
		p+=rd*d;
	}
	if(d<threshold)
	{
		vec3 n=normal(p);
		vec3 ld=normalize(vec3(1,-1,-1));
		float light=max(0,dot(normalize(vec3(1,1,-1)),n));
		light+=pow(light,16)+.3;
		o_fragment=(vec4(color,1)*light)*.5;
	}
	else
	{
		uv.y=uv.y*.5+.5;
		o_fragment=vec4(0,uv.y/2,0,1);
	}
}
