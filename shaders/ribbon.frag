// Shadercode from To The Road Of Ribbon by FRequency, optimized by me https://www.pouet.net/prod.php?which=53939
uniform float iTime;

float tunnel(vec3 p){
	return cos(p.x)+cos(p.y*1.5)+cos(p.z)+cos(p.y*20.)*.05;
}

float ribbon(vec3 p){
	return length(max(abs(p-vec3(cos(p.z*1.5)*.3,-.5+cos(p.z)*.2,.0))-vec3(.125,.02,iTime+3.),vec3(.0)));
}

float scene(vec3 p){
	return min(tunnel(p),ribbon(p));
}

vec3 getNormal(vec3 p){
	vec3 i_eps=vec3(.1,0,0);
	return normalize(vec3(scene(p+i_eps.xyy),scene(p+i_eps.yxy),scene(p+i_eps.yyx)));
}

void main(){
	vec2 v=-1+2*gl_FragCoord.xy/vec2(i_X,i_Y);
	v.x*=1.8;
	
	vec3 org=vec3(sin(iTime*.1)*.5,cos(iTime*.5)*.25+.25,iTime);
	vec3 dir=normalize(vec3(v.x*1.6,v.y,1.));
	vec3 p=org;
	vec3 pp;
	
	//First raymarching
	for(int i=0;i<64;i++){
		p+=scene(p)*dir;
	}
	pp=p;
	float i_f=length(p-org)*.02;
	
	//Second raymarching (reflection)
	dir=reflect(dir,getNormal(p));
	p+=dir;
	for(int i=0;i<32;i++){
		p+=scene(p)*dir;
	}
	
	gl_FragColor=max(dot(getNormal(p),vec3(.1,.1,.0)),.0)+vec4(.3,cos(iTime*.5)*.5+.5,sin(iTime*.5)*.5+.5,1.)*min(length(p-org)*.04,1.);
	
	//Ribbon gl_FragColor
	if(tunnel(pp)>ribbon(pp))
	{
		gl_FragColor=mix(gl_FragColor,vec4(cos(iTime*.3)*.5+.5,cos(iTime*.2)*.5+.5,sin(iTime*.3)*.5+.5,1.),.3);
	}
	//Final gl_FragColor
	gl_FragColor=sqrt((gl_FragColor+vec4(i_f))+(1.-min(pp.y+1.9,1.))*vec4(1.,.8,.7,1.))*min(iTime*.5,1.);
}
