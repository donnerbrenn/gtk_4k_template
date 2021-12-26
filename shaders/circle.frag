uniform float iTime;
out vec3 color;
vec2 uv = (gl_FragCoord.xy/iResolution-.5)*vec2(1,iResolution.y/iResolution.x);

void main()
{
      color=length(uv)>.5?vec3(1):vec3(0);
}