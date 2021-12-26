#! /usr/bin/python3
import py_compile
import sys
import os


def gettotalsize(list):
    total = 0
    for item in list:
        total += item[0]
    return total

def addsize(list):
    for item in list:
        item.insert(0,os.path.getsize(item[0]))
    return list

def addrelativesize(list):
    biggest = list[-1][0]
    for item in list:
        item.append(round((float(item[0])/biggest)*100, 1))
    return list


def stringify(list):
    stringlist = []
    for item in list:
        stringlist.append([str(int(item[0])), item[1], str(item[2])+"%"])
    return stringlist


def maxlen(list):
    maxlength = [0, 0, 0]
    for item in list:
        for i in range(0, 3):
            if len(item[i]) > maxlength[i]:
                maxlength[i] = len(item[i])
    return maxlength


def format(list):
    maxlength = maxlen(list)
    list.insert(0, ["Size", "File", "RSize"])
    for i in range(0, 3):
        list[0][i] = list[0][i].ljust(maxlength[i])
    for item in list[1:]:
        item[0] = item[0].rjust(maxlength[0])
        item[1] = item[1].ljust(maxlength[1])
        item[2] = item[2].rjust(maxlength[2])
    return list


def display(list, size):
    print()
    list.append([str(size), "", ""])
    list = format(list)
    delimiter = "     "
    length = len(list[1][0])+len(list[1][1])+len(list[1][2])+len(delimiter)*2
    print(list[0][0]+delimiter+list[0][1]+delimiter+list[0][2])
    print(length*"–")
    for item in list[1:-1]:
        print(item[0]+delimiter+item[1]+delimiter+item[2])
    print(length*"–")
    print(size, "\n")


def check(list):
    for item in list:
        if not os.path.isdir(item):
            if not os.path.isfile(item):
                print("File", item, "not found - removing")
                list.remove(item)
        else:
            print(item, "is a folder - removing")
            list.remove(item)
    if len(list) == 0:
        print("No files given")
        exit(-1)
    return list


def analyze(list):
    check(list)
    list=[[item] for item in list]
    list = addsize(list)
    list.sort()
    totalsize = gettotalsize(list)
    list = addrelativesize(list)
    list = stringify(list)
    display(list, totalsize)


analyze(sys.argv[1:])
