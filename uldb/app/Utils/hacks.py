# -*- coding: utf-8 -*-
"""
    app.Utils.hacks

    :copyright: (C) 2016 UnitedLayer, LLC. All Rights Reserved.
    :author: rtapia@unitedlayer.com

"""

from __future__ import absolute_import
from django.db import connection
import uuid


def pg_bulk_multiupdate(model, key_column, kwargs):
    """
    todo: WARNING - this does a raw SQL query.  Please only use this function from protected code sources.

    originally by some phd:
    https://github.com/jfalkner/Efficient-Django-QuerySet-Use/blob/master/demo-optimized/django_pg_utils/__init__.py
    """
    keys = kwargs.keys()
    colnames = kwargs.itervalues().next().keys()
    values = ', '.join(["{col} = input.{name}".format(col=k, name=k) for k in colnames])
    series = [[kwargs[k][c] for k in keys] for c in colnames]
    series_copy = series[:]
    series_copy.insert(0, keys)
    with connection.cursor() as cursor:
        # @formatter:off
        sql = cursor.mogrify(
            "UPDATE \"" + model._meta.db_table + "\"" +
            " SET " + values +
            " FROM (SELECT unnest(%s), " + ','.join(["unnest(%s)" for _ in range(len(series))]) + ") "
            " AS INPUT (filter, " + ','.join(colnames) + " ) "
            " WHERE " + key_column + " = input.filter; ",
            series_copy
        )
        # @formatter:off
        cursor.execute(sql)
        cursor.execute("COMMIT;")


def generate_uuid():
    return uuid.uuid4()
