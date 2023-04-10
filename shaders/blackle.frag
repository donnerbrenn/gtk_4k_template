//Shader from blackles OpenGL Examples. (optimized)
void main()
{
    gl_FragColor = abs(gl_FragCoord.xy/vec2(i_X,i_Y)*vec2(1,i_Y/i_X)).yxyx;
}