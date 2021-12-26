void main()
{
  gl_FragColor=vec4(vec3(((int(gl_FragCoord.x)^int(gl_FragCoord.y))&255)*.004),1);
}