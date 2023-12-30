uniform float iTime;
void main()
{
    vec2 I = gl_FragCoord.xy+gl_FragCoord.xy-vec2 (i_X, i_Y);
    I*=mat2(cos(round(atan(I.y,I.x)*.95)/.955+vec4(0,11,33,0)));
    gl_FragColor=cos(mod(ceil(I.y/.3/I)+ceil(I=log(I)/.5-iTime),4.).x+vec4(6,5,2,0))+1;
    gl_FragColor/=2+max(I=fract(I)-.3,-I-I).x/.4;
}
