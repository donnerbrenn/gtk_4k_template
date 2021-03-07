uniform float iTime;
vec2 uv= gl_FragCoord.xy/iResolution.xy-.5;


out vec3 color;

float sdCircle(vec2 p, float r)
{
      return length(p)-r;
}

// float sdBox( vec2 p, vec2 b )
// {
//   vec2 q = abs(p) - b;
//   return length(max(q,0.0)) + min(max(q.x,max(q.y,q.x)),0.0);
// }

void main()
{
      float time=25+iTime;
      uv.x/=iResolution.y/iResolution.x;

      for (int i=0;i<10;i++)
      {
            time+=i*5;
            vec2 pos=vec2(sin(time*(i+1*4.99)*.125),cos(time*(i+1*4)*.1))*.35;
            float d=sdCircle(-uv+pos,.1);
            if(d<0)
                  color+=vec3(-d+vec3(abs(uv),0));
      }
}