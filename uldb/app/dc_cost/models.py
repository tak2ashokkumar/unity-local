# -*- coding: utf-8 -*-
from __future__ import absolute_import
from __future__ import unicode_literals

import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone

from app.user2.models import User
from django.contrib.auth import get_user_model


def get_sentinel_user():
    return get_user_model().objects.get_or_create(username='deleted')[0]


class DatacenterBillingAccount(models.Model):
    """
    docstring for DatacenterBillingAccount
    """
    CABINET_CHOICES = (
        ('Full Cabinet', 'Full Cabinet'),
        ('RU', 'RU'),
    )

    uuid = models.UUIDField(default=uuid.uuid4, unique=True)
    datacenter = models.OneToOneField('CloudService.ColoCloud')
    cabinet_rental_model = models.CharField(max_length=30, choices=CABINET_CHOICES)
    cabinet_unit_cost = models.PositiveIntegerField()
    power_circuit = models.ForeignKey('datacenter.PowerCircuit')
    power_circuit_cost = models.PositiveIntegerField()
    redundant_power = models.BooleanField(default=False)
    contract_date = models.DateTimeField()

    created_by = models.ForeignKey(User, on_delete=models.SET(get_sentinel_user))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def organization_id(self):
        return self.datacenter.customer

    def __repr__(self):
        return u'%s' % self.datacenter.name

    def __unicode__(self):
        return u'%s' % self.datacenter.name
