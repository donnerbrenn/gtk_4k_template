uniform float iTime;

float tixy(float t, int i, int x, int y)
{
      return sin(x*y+t);
}

void main()
{  
      float size=8;
      vec2 i_uv=UV*vec2(i_X/i_Y,1);
      vec2 index=floor(i_uv*size);
      vec2 offset=fract(i_uv*size)*2.-1.;
      float x=index.x;
      float y=index.y;
      float i=y*size+x;
      float r=clamp(tixy(iTime,int(i), int(x), int(y)),-.9,.9);

      gl_FragColor.x=float((length(offset)-abs(r))<0);
      gl_FragColor.xyz=r>0?gl_FragColor.xyz:gl_FragColor.xxx;  
}