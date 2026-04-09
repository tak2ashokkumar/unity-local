# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2017 UnitedLayer, LLC.
#
# All Rights Reserved.

from __future__ import absolute_import
from __future__ import unicode_literals

from django.core.exceptions import ValidationError
from django.db import models

from app.organization.models import Organization
from app.common.models import TimeStampModel, UserStampModel


# Create your models here.


class Groups(TimeStampModel, UserStampModel):
    """ User Management """

    # Group Manager Class

    group_id = models.AutoField(primary_key=True)
    group_name = models.CharField(max_length=128, verbose_name="Group Name")

    # Organization
    org = models.ForeignKey('organization.Organization')

    # Role
    # role_id = models.ForeignKey("Roles")

    # Group Active/in-active - Group can be suspended
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'groups'
        permissions = (('view', 'Can view groups'),)
        unique_together = ('group_name', 'org')

    def __unicode__(self):
        return self.group_name

    def __repr__(self):
        return u'%s' % self.group_name

    @property
    def organization_id(self):
        return self.org.id

    def clean(self):
        if self.group_name and self.org and not self.group_id:
            if Groups.objects.filter(
                    group_name__iexact=self.group_name, org=self.org):
                raise ValidationError(
                    {'org': 'Group Name and Customer is unique together'})
        return
