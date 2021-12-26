#version 400
float i_X=2560.;
float i_Y=1440.;
uniform float iTime;

void main()
{
      gl_FragColor=sin(gl_FragCoord*.01+iTime);
}