#! /usr/bin/python3
import sys
import os
from tabulate import tabulate


def addsize(list):
    for item in list:
        size = os.path.getsize(item[0])
        item.insert(0, size / 1024.0)
        item.insert(0, size)
    return list


def addrelativesize(list):
    biggest = list[-1][0]
    for item in list:
        item.append((float(item[0]) / biggest) * 100.0)
        item.append(abs((float(item[0]) / biggest) * 100.0 - 100))
    return list


def display(header, list):
    print(tabulate(list, headers=header, tablefmt="simple_outline", floatfmt=".3f"))


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
    list = [[item] for item in list]
    list = addsize(list)
    list.sort()
    list = addrelativesize(list)
    display(["Bytes", "KB", "Filename", "%Size", "%Saved"], list)


analyze(sys.argv[1:])
