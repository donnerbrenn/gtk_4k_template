#! /usr/bin/python3

import sys
def main():
    if len(sys.argv)>1:
        path = sys.argv[1]
        file = open(path,'r')
        content=str(file.read())
        file.close()
        changed=False
        if "UV" in content:
            content=content.replace("UV","A")
            changed=True
        if "u_time" in content:
            content=content.replace("u_time","B")
            content=content.replace("# define SHADERS_H_","# define SHADERS_H_\n#define VAR_ITIME B")
            changed=True
        if changed:
            file = open(path,'w')
            file.write(content)
            file.close()
main()
