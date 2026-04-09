# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2016 UnitedLayer, LLC.
#   All Rights Reserved.

"""managers.py
"""

from __future__ import absolute_import

from django.db import connection, models


class MaterializedViewManager(models.Manager):
    def refresh(self):
        cursor = connection.cursor()
        db_table = self.model._meta.db_table
        if False:
            cursor.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY %s;" % db_table)


class SingletonManager(models.Manager):
    def get_queryset(self):
        # todo: this doesn't work
        return super(SingletonManager, self).get_queryset().first()
