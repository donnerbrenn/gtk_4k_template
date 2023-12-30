uniform float iTime;
out vec4 F;

void main()
{
      F=sin(gl_FragCoord*.1+iTime);
}