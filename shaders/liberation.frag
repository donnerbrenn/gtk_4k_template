
uniform float iTime;

vec3 objcol;
out vec3 color;

// by Dave_Hoskins
float hash12(vec2 p)
{
	vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

mat2 rot(float a){
    float i_s = sin(a);
    float i_c = cos(a);
    return mat2(i_c, i_s, -i_s, i_c);
}

float de(vec3 pos)
{
    float t = mod(iTime,17);
    float a=smoothstep(13,15,t)*8-smoothstep(4,0,t)*4;
    float f=sin(iTime*5.+sin(iTime*20)*.2);
    pos.xz *= rot(iTime+.5);
    pos.yz *= rot(iTime);
    vec3 p = pos;
    float s=1.;
    for (int i=0; i<4; i++){
        p=abs(p)*1.3-.5-f*.1-a;
        p.xy*=rot(radians(45));
        p.xz*=rot(radians(45));
        s*=1.3;
    }
    float fra = length(p)/s-.5;
    pos.xy *= rot(iTime);
    p = abs(pos) - 2 - a;
    float d = length(p) - .7;
    d = min(d, max(length(p.xz)-.1,p.y));
    d = min(d, max(length(p.yz)-.1,p.x));
    d = min(d, max(length(p.xy)-.1,p.z));
    p = abs(pos);
    p.x -= 4.+a+f*.5;
    d = min(d, length(p) - .7);
    d = min(d, length(p.yz-abs(sin(p.x*.5-iTime*10)*.3)));
    p = abs(pos);
    p.y -= 4.+a+f*.5;
    d = min(d, length(p) - .7);
    d = min(d, max(length(p.xz)-.1,p.y));
    d = min(d, fra);
    objcol = abs(p);
    if (d==fra) objcol=vec3(2,0,0);
    return d;
}


vec3 normal(vec3 p) {
    vec2 d = vec2(0, .01);
    return normalize(vec3(de(p+d.yxx), de(p+d.xyx), de(p+d.xxy))-de(p));
}

// Credits: Liberation of the True Self by Kali - Optimized https://www.shadertoy.com/view/tlGfzd
vec3 march(vec3 from, vec3 dir)
{
    float d = 0, td = 0;
    float i_maxdist = 30;
    vec3 p = from, col = vec3(0);
    for (int i = 0; i<100; i++)
    {
        float d2 = de(p) * (1-hash12(gl_FragCoord.xy+iTime)*.2);
        if (d2<0)
        {
            vec3 i_n = normal(p);
            dir = reflect(dir, i_n);
            d2 = .1;
          
        }
        d = max(.01, abs(d2));
        p += d * dir;
        td += d;
        if (td>i_maxdist) break;
        col += .01 * objcol;
    }
    return pow(col, vec3(2));
}

void main()
{
    vec2 uv = UV*vec2(i_X/i_Y,1);
    vec3 i_from = vec3(0,0,-10);
    vec3 i_dir = normalize(vec3(uv, 1));
    color = march(i_from, i_dir);
}