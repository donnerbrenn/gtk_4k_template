#version 400

float i_X=2560.;
float i_Y=1440.;
const float c_pi = acos(-1);
const float c_twopi = c_pi*2;
out vec4 fragColor;
#define threshold .001
vec3 attentuation=vec3(1);
uint state = uint (gl_FragCoord.x*gl_FragCoord.y);
#define SAMPLES 300
#define BOUNCES 8
vec3 albedo;


uint wang_hash(inout uint seed)
{
    seed = uint(seed ^ uint(61)) ^ uint(seed >> uint(16));
    seed *= uint(9);
    seed = seed ^ (seed >> 4);
    seed *= uint(0x27d4eb2d);
    seed = seed ^ (seed >> 15);
    return seed;
}
 
float RandomFloat01(inout uint state)
{
    return float(wang_hash(state)) / 4294967296.0;
}
 
vec3 RandomUnitVector(inout uint state)
{
    float z = RandomFloat01(state) * 2.0f - 1.0f;
    float a = RandomFloat01(state) * c_twopi;
    float r = sqrt(1.0f - z * z);
    float x = r * cos(a);
    float y = r * sin(a);
    return vec3(x, y, z);
}


float fSphere(vec3 p, float r) {
       return length(p)-r;
}

float fPlane(vec3 p, vec3 n, float distanceFromOrigin) {
    return dot(p, n) + distanceFromOrigin;
}

float vmax(vec3 v) {
	return max(max(v.x, v.y), v.z);
}

float fBox(vec3 p, vec3 b) {
	vec3 d = abs(p) - b;
	return length(max(d, vec3(0))) + vmax(min(d, vec3(0)));
}

float scene(vec3 p) {
    albedo=vec3(1);
        float box=-fBox(p,vec3(1,1.1,6));
        float ball=fSphere(p,1);
        float final=min(box,ball);
        if(final==ball)
            albedo=vec3(0,.3,0);
       return final;
}

vec3 normal(vec3 p)
{
    mat3 k=mat3(p,p,p)-mat3(.0005);
    return normalize(scene(p)-vec3(scene(k[0]),scene(k[1]),scene(k[2])));
}

bool march(inout vec3 p, vec3 dir) {
       float dst=1;
       for(uint cnt=0;cnt<512&&dst>threshold;cnt++) {
              p+=dir*dst;
              dst=scene(p);
       }
       return dst<threshold;  
}

void main() {
       vec2 uv = ((gl_FragCoord.xy/vec2(i_X,i_Y))*2-1)/vec2(1,i_X/i_Y);
    fragColor.rgb=vec3(0);
       vec3 n;
       
       for(int j=0;j<SAMPLES;j++) {
            vec3 d = normalize(vec3(uv,1));
            vec3 ro=vec3(0,0,-3);
            attentuation=vec3(1);
           for(int i=0;i<BOUNCES&&march(ro,d);i++) {
                n = normal(ro);
                fragColor.rgb+=albedo*max(dot(normalize(vec3(1,1,1))*attentuation,n),0);
                fragColor.rgb+=albedo*max(dot(normalize(vec3(-1,0,-1))*attentuation,n),0);
                fragColor.rgb+=albedo*max(dot(d,n)*attentuation,0);
                d=reflect(n,d); 
                if(i==0) 
                {
                     d=normalize(n+RandomUnitVector(state));
                }
                attentuation*=max(dot(d,n),0);
           }
       }
       fragColor.rgb=sqrt(fragColor.rgb/(SAMPLES*BOUNCES/3));
}