# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from __future__ import absolute_import

from rest_framework import routers

from .views import DatacenterBillingAccountViewSet

dc_cost_router = routers.DefaultRouter()
dc_cost_router.register('account', DatacenterBillingAccountViewSet)
