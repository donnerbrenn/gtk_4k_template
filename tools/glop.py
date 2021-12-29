#! /usr/bin/python3

import sys
import os
import re

class shader:
    version=""
    sourcecode=""
    functions=[]
    before=0
    after=0

    def extractFunctions(self):
        pass        
    def extractVersion(self):
        self.version=(re.findall("#version [\d][\d][\d]\n",self.sourcecode)[0])
        self.sourcecode=(re.sub("#version [\d][\d][\d]\n","",self.sourcecode))
        

    def cleanUp(self):
        lines=self.sourcecode.split("\n")
        for i in range(0,len(lines)):
            lines[i]=lines[i].strip(' ')
        self.sourcecode='\n'.join(lines)
        self.sourcecode=self.sourcecode.replace("  "," ")
        self.sourcecode=self.sourcecode.replace("  ","")
        self.sourcecode=self.sourcecode.replace(", ",",")
        self.sourcecode=self.sourcecode.replace("\n","")
        self.sourcecode=self.sourcecode.replace("{ ","{")
        self.sourcecode=self.sourcecode.replace(" }","}")
        self.sourcecode=self.sourcecode.replace("( ","(")
        self.sourcecode=self.sourcecode.replace(" )",")")
        self.sourcecode=self.sourcecode.replace("[ ","[")
        self.sourcecode=self.sourcecode.replace(" ]","]")

    def openShader(self,filename):
        if not os.path.isfile(filename):
            print("File not found")
            exit(-1)
        file = open(filename,'r')
        self.sourcecode=str(file.read())
        file.close()
        self.before=len(self.sourcecode)
        self.extractVersion()
        self.cleanUp()
        self.extractFunctions()
        self.sourcecode=self.version+self.sourcecode
        self.after=len(self.sourcecode)
        print(self.sourcecode)
        print("Before:".ljust(10),self.before)
        print("After:".ljust(10),self.after)

def main():
    cShader=shader()
    if len(sys.argv)>1:
        path = sys.argv[1]
        cShader.openShader(path)

main()

