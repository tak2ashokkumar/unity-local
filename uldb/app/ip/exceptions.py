#!/usr/bin/env python

"""
  exceptions.py

"""
from __future__ import absolute_import
from __future__ import print_function


class AllocationError(RuntimeError):
    pass


class IPSpecialUseError(RuntimeError):
    pass
