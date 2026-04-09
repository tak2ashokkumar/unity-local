# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2017 UnitedLayer, LLC.
#
# All Rights Reserved.

from __future__ import absolute_import
from __future__ import unicode_literals

from django.conf import settings
from django.contrib.sessions.models import (
    SessionManager, AbstractBaseSession
)
from django.db import models
from django.utils.translation import ugettext_lazy as _


class ULUserSession(AbstractBaseSession):
    """
    In addition to the model from django.contrib.sessions, this session
    model class providers the following properties:
        `user`
        `user_agent`
        `ip`
    """
    # session_key = models.CharField(_('session key'), max_length=40,
    #                                primary_key=True)
    # session_data = models.TextField(_('session data'))
    # expire_date = models.DateTimeField(_('expiry date'), db_index=True)
    # objects = SessionManager()

    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             null=True)
    user_agent = models.CharField(max_length=200, null=True, blank=True)
    last_activity = models.DateTimeField(auto_now=True)

    #    active_roles = models.ManyToManyField(ULDBRoles)

    ip = models.GenericIPAddressField(null=True)

    def __repr__(self):
        return u'%s' % self.user.username

    class Meta:
        db_table = ('ulusersession')
        verbose_name = _('ulsession')
        verbose_name_plural = _('ulsessions')

    def get_decoded(self):
        return SessionStore(None, None).decode(self.session_data)


# At bottom to avoid circular import
from .backends.db import SessionStore  # nopep8
