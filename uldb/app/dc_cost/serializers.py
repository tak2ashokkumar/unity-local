# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from __future__ import absolute_import

from rest.core.fields import ColoCloudRelatedField, PowerCircuitRelatedField
from .models import *
from rest_framework import serializers


class DatacenterBillingAccountSerializer(serializers.ModelSerializer):
    """docstring for DatacenterBillingAccountSerializer"""
    datacenter = ColoCloudRelatedField()
    power_circuit = PowerCircuitRelatedField()

    class Meta:
        model = DatacenterBillingAccount
        fields = '__all__'
