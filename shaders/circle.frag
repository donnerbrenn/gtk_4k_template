uniform float iTime;
out vec3 color;
vec2 uv = UV*vec2(1,i_Y/i_X);

void main()
{
      color=length(uv)>.5?vec3(1):vec3(0);
}