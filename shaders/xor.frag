void main()
{
  gl_FragColor=vec4(vec3(float(((int(gl_FragCoord.x)^int(gl_FragCoord.y))&0xFF)/255.0)),1.);
}