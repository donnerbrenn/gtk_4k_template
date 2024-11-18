#! /bin/python
#   gl_Position=vec4(gl_VertexID%2*2-1,gl_VertexID/2*2-1,1,1);
def indextouv(index: int):
    x: int = index % 2 * 2 - 1
    y: int = index // 2 * 2 - 1
    print(index, ":", x, y)

for i in range(0, 4):
    indextouv(i)
