#version 400
in vec2 UV;
float i_X=2560.;
float i_Y=1440.;
uniform float iTime;
void main() 
{
    float i_r=sin(UV.x + iTime * 0.123);
    float i_g=sin(UV.y - iTime * 0.321);
    float i_b=sin(UV.x-UV.y + iTime * 0.012);
    gl_FragColor.xyz = abs(vec3(i_r,i_g,i_b));
}