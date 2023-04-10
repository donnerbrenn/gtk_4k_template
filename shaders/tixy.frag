uniform float iTime;
out vec3 fragColor;

// float tixy(float t, int i, int x, int y)
// {
//       return sin(x*y*i+t);
// }

void main()
{  
      float i_size=8;
      vec2 uv=gl_FragCoord.xy/vec2(i_X,i_Y)*vec2(i_X/i_Y,1);
      vec2 index=floor(uv*i_size);
      vec2 offset=fract(uv*i_size)*2.-1.;
      // float r=clamp(tixy(iTime,int(index.y*i_size+index.x), int(index.x), int(index.y)),-.9,.9);
      float r=sin(int(index.x)*int(index.y)*int(index.y*i_size+index.x)+iTime);
      fragColor.x=float((length(offset)-abs(r))<0);
      fragColor=r>0?fragColor:fragColor.xxx;  
}