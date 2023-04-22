float it=0.;
out vec4 Frag;
vec2 iResolution=vec2(i_X,i_Y);
uniform float iTime;

mat2 rot(float a) {
    float s=sin(a),c=cos(a);
    return mat2(c,s,-s,c);
}

float hash(vec2 p)
{
    vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float de(vec3 p) {
    p.yz*=rot(-.5);
    p.xz*=rot(iTime*.2);
    float d=100.;
    p*=.2;
    for (float i=0.; i<12.; i++) {
        p.xy=sin(p.xy*2.);
        p.xy*=rot(1.);
        p.xz*=rot(1.5);
        float l=length(p.xy)+.01;
        if (i>1.) d=min(d,l);
        if (d==l) it=i;
    }
    return d*.3;
}

vec3 march(vec3 from, vec3 dir) {
    float d, td=hash(gl_FragCoord.xy+iTime)*.2;
    vec3 p, col=vec3(0.);
    for (int i=0; i<200; i++){
        p=from+dir*td;
        d=max(.005,abs(de(p)));
        td+=d;
        if (td>10.) break;
        vec3 c=vec3(1.,-.5,0.);
        c.rb*=rot(-it*.15+iTime*.1);
        c=normalize(1.+c);
        c*=exp(-.15*td);
        c*=exp(-.5*length(p));
        c/=1.+d*1500.;
        c*=.3+abs(pow(abs(fract(length(p)*.15-iTime*.2+it*.02)-.5)*2.,30.))*4.;
        col+=c;
        col+=exp(-5.*length(p))*.15;
    }
    return col;
}

void main()
{
    vec2 uv = (gl_FragCoord.xy-iResolution.xy*.5)/iResolution.y;
    vec3 from=vec3(0.,0.,-3.-cos(iTime*.5));
    vec3 dir=normalize(vec3(uv,1.2));
    vec3 col=march(from, dir);
    Frag = vec4(col,1.0);
}