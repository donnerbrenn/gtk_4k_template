//Shader from blackles OpenGL Examples. (optimized)
void main()
{
    gl_FragColor = abs(UV*vec2(1,i_Y/i_X)).yxyx;
}