# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2017 UnitedLayer, LLC.
#
# All Rights Reserved.

"""
    views.py

"""

from __future__ import absolute_import
from __future__ import unicode_literals

from rest.core import *  # brings in rest_framework.status and all that good stuff

from .models import VLAN

from rest.core.serializers import VlanSerializer


class VlanViewSet(AbstractNonMetaModelViewSet):
    queryset = VLAN.objects.all().select_related(
        'customer',
        'region'
    )
    serializer_class = VlanSerializer
