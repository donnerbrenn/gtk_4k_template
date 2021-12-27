#version 400
in vec2 UV;
float i_X=2560.;
float i_Y=1440.;
//Shader from blackles OpenGL Examples. (optimized)
void main()
{
    gl_FragColor = abs(UV*vec2(1,i_Y/i_X)).yxyx;
}