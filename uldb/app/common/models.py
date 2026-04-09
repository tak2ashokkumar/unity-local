# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2017 UnitedLayer, LLC.
#
# All Rights Reserved.
from __future__ import absolute_import
from __future__ import unicode_literals

from django.db import models
from django.utils import timezone
from django.contrib.postgres.fields import ArrayField
from app.common.fields import EncryptedPasswordField

from .func import _fix_salesforce, generate_uuid


class TimeStampModel(models.Model):
    """ TimeStampedModel
    An abstract base class model that provides self-managed "created" and
    "modified" fields.
    """
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)

    class Meta:
        get_latest_by = 'modified'
        ordering = ('-modified', '-created',)
        abstract = True


class TimestampedModel(models.Model):
    """
    Like TimeStampModel, but without database directives (ordering, etc).
    """
    created_at = models.DateTimeField(editable=False, default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super(TimestampedModel, self).save(*args, **kwargs)

    class Meta:
        abstract = True


class UserStampModel(models.Model):
    """ UserStampedModel
    An abstract base class that provides self-manged "Create user" and
    "modified user" fields.
    """
    created_user = models.CharField(max_length=128)
    modified_user = models.CharField(max_length=128)

    class Meta:
        abstract = True
        ordering = ('-modified_user', '-created_user')
        get_latest_by = 'modified_user'


class AddressableModel(models.Model):
    """
    Base class to define models that can be assigned IPs.
    """

    @property
    def object_class(self):
        return self.__class__.__name__

    class Meta:
        db_table = 'addressable'


class InventoryModel(models.Model):
    """
    Simple abstract model for instances.

    todo: consider renaming to UUID model
    """
    uuid = models.UUIDField(default=generate_uuid)
    created_at = models.DateTimeField(editable=False, auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def __unicode__(self):
        return '%s-%s' % (self._meta.model_name, self.uuid)

    def save(self, *args, **kwargs):
        _fix_salesforce(self)
        self.updated_at = timezone.now()
        if hasattr(self, 'asset_tag'):
            # pylint: disable=access-member-before-definition
            if not self.asset_tag:
                self.asset_tag = None
        super(InventoryModel, self).save(*args, **kwargs)


class IotBaseModel(models.Model):
    """
        Base Abstract Class for IoT/Non IT Devices
    """
    uuid = models.UUIDField(default=generate_uuid, editable=False, unique=True, db_index=True)
    name = models.CharField(max_length=128, blank=True, null=True, db_index=True)
    created_at = models.DateTimeField(editable=False, auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        abstract = True


class AIAgents(InventoryModel):
    name = models.CharField(max_length=256, blank=True, null=True)
    url = models.CharField(max_length=256, blank=True, null=True)
    org = models.ManyToManyField('organization.Organization', related_name='ai_agents')
    access_token = EncryptedPasswordField(blank=True, null=True)
    queries = ArrayField(
        models.CharField(max_length=512, blank=True, null=True),
        default=list,
    )


    class Meta:
        verbose_name = "AI Agents"