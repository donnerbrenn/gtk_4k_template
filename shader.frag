#version 400
float i_X=2560.;
float i_Y=1440.;
//Shader from blackles OpenGL Examples. (optimized)
void main()
{
    gl_FragColor = abs((((gl_FragCoord.xy/vec2(i_X*.5,i_Y*.5)) - 1)*vec2(1,i_Y/i_X)).yxyx);
}