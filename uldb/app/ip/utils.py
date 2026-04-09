#!/usr/bin/env python

"""
  utils.py

"""
from __future__ import absolute_import
from __future__ import print_function


def cidr_to_bitmask(cidr, version=4):
    if version == 4:
        return 0xFFFFFFFF & (0xFFFFFFFF << (32 - int(cidr)))
