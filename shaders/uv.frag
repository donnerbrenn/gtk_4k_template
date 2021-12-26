out vec4 color;
void main()
{
    color.xz=gl_FragCoord.xy/vec2(i_X,i_Y);
}