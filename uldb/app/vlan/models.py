# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2016 UnitedLayer, LLC.
#   All Rights Reserved.

"""models.py
"""

from __future__ import absolute_import
from __future__ import unicode_literals

import logging

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

from app.common.models import InventoryModel
from app.inventory.models import Switch, SwitchModel, Server

logger = logging.getLogger(__name__)  # logger from settings.py


class VLAN(InventoryModel):
    vlan_number = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(4096)])
    region = models.ForeignKey('datacenter.Location', on_delete=models.CASCADE)
    verified = models.BooleanField(default=False)

    ulid = models.IntegerField(null=True)  # for legacy purposes
    customer = models.ForeignKey('organization.Organization', null=True, on_delete=models.SET_NULL)

    def __repr__(self):
        return u'%s' % self.vlan_number

    class Meta:
        unique_together = (('vlan_number', 'region'))

    @property
    def organization_id(self):
        return self.customer.id
