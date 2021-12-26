A 4K exegfx Template for Linux x86_64
Based on Blackles Linux OpenGL examples. https://github.com/blackle/Linux-OpenGL-Examples

## Tools used to do this production: 
Shader Minifier http://www.ctrl-alt-test.fr/glsl-minifier/
smol https://github.com/PoroCYon/smol
vondehi https://gitlab.com/PoroCYon/vondehi
oneKpaq https://github.com/temisu/oneKpaq

## Dependencies:
ibglib2.0-0
libgtk-3-0
libgl
libdispatch (When using oneKpaq)

## Build instructions:
Build LZMA-packed target with shell script dropper
  make sh
  
Build LZMA-packed target with vondehi dropper
  make vndh
  
Build oneKpaq target:
  make okp
  
  Build all three targets:
    make all
