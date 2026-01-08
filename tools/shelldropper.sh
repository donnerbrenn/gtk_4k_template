#!/bin/sh
sed 1,2d<$0|unxz>i;chmod +x i;./i;rm i;exit
