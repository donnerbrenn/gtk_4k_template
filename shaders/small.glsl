vec3 r = vec3(0, 0, -1);    // ray origin
vec2 uv=gl_FragCoord.xy/vec2(i_X/1.78,i_Y);
vec3 rd = vec3(uv, 1); // ray dir

void main()
{
    float i;
    for (i = 0; i < 128; i++) 
    {
        vec3 p=mod(r,.125) - .0625;   // repetition in all 3 axis
        if (sqrt(p.x*p.x + p.y*p.y + p.z*p.z) - .0175 < .001) break; //break out, when hit
        r += rd*.1; // step through scene
    }
    gl_FragColor=vec4(1)-i*.01;// (divided by a value if needbe)  
}
