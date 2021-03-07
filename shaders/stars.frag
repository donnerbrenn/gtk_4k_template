uniform float iTime;
vec3 color;
 
float hash21(vec2 p) 
{
  p = fract(p * vec2(233.34, 851.74))+dot(p, p + 23.45);
  return fract(p.x * p.y);
}

mat2 rotate(float a) 
{
  return mat2(cos(a), sin(a), -sin(a), cos(a));
}

void main(void) 
{
  vec2 uv = (2 * gl_FragCoord.xy - iResolution) / iResolution.y + vec2(1. + 2 * cos(iTime / 2), 2 * sin(iTime / 10)) * .5 *rotate(iTime / 10);
  for (int i = 0; i < 5; i ++) 
  {
    float z = fract((i*.2) + iTime / 10);
    float fade = smoothstep(.0, .5, z) * smoothstep(1., .8, z);
    vec2 fbmp=uv;
    float fbms;
    float fbmm;
    float fbma = .5;
    for (int i = 0; i < 8; i++) 
    {
      vec2 noisei = ceil(fbmp);
      vec2 noiseu = fract(fbmp) * fract(fbmp) * (3 - 2 * fract(fbmp));
      float noisea = hash21(noisei);
      float noiseb = hash21(noisei + vec2(1, 0));
      float noisec = hash21(noisei + vec2(0, 1));
      float noised = hash21(noisei + vec2(1, 1));

      fbms += fbma * (mix(mix(noisea, noiseb, noiseu.x), mix(noisec, noised, noiseu.x), noiseu.y));
      fbmm += fbma;
      fbma /= 2;
      fbmp *= 2;
    }
    color += ((fbms / fbmm) * .5 * mix(vec3(0, .5, .5), vec3(1, .5, 0), fade));
    vec2 layeruv=(rotate(i * 3.14) * uv * mix(5., .1, z) + i)*4;
    vec2 layeriv = floor(layeruv);
    vec2 layergv = fract(layeruv) - .5;
    vec2 layerr = (sin(vec2(hash21(layeriv), hash21(layeriv + hash21(layeriv))) * 25.)*.3);
    color += mix(vec3(0, 0, 1), vec3(1, .4, 0), mix(0, 1, z)) * (1. - smoothstep( .3 * hash21(layeriv),  .3 * hash21(layeriv) + .05, length(layergv - layerr))) * (1. / dot((layerr - layergv) * 25, (layerr - layergv) * 25)) *  (.7 * hash21(layeriv)) * fade + mix(.8 * sin(iTime / 5) * vec3(.5, .2, 0), vec3(0), length(.5 + uv / 2));
  }
  gl_FragColor.rgb=color;
}