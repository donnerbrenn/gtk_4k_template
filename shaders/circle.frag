uniform float iTime;
out vec3 color;
vec2 uv = (gl_FragCoord.xy/vec2(i_X,i_Y)-.5)*vec2(1,i_Y/i_X);

void main()
{
      color=length(uv)>.5?vec3(1):vec3(0);
}