def indextovec2(index: int):
    x:int = index % 2-1
    y:int = index//2*2-1
    
    print(index, ":", x, y, ":", x+y)

for i in range(0, 4):
    indextovec2(i)
