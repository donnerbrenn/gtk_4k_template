uniform float iTime;

void main()
{
      gl_FragColor=sin(gl_FragCoord*.01+iTime);
}