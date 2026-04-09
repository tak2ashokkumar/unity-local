# -*- coding: utf-8 -*-
"""
    apps.py

    :copyright: (C) 2016 UnitedLayer, LLC. All Rights Reserved.
    :author: rtapia@unitedlayer.com
"""
from __future__ import absolute_import

from django.apps import AppConfig


class UserConfig(AppConfig):
    name = 'app.user2'
    verbose_name = "User App"
    label = 'user'
