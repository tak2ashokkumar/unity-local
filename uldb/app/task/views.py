# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2016 UnitedLayer, LLC.
#   All Rights Reserved.

"""views.py
"""

from __future__ import absolute_import
from __future__ import unicode_literals

from uuid import UUID
from django.views.decorators.cache import never_cache

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication, TokenAuthentication

from uldb import celery_app

import logging

logger = logging.getLogger(__name__)  # logger from settings.py


class Task(APIView):
    authentication_classes = (SessionAuthentication, TokenAuthentication)

    @never_cache
    def get(self, request, task_id=None, format=None):
        """
        Returns a dictionary of values corresponding to the task.

        Requires 'task_id' passed in as a GET param.
        """
        # logger.debug(
        #     "Task -- get %s" %
        #     self.request.query_params.get(
        #         'task_id',
        #         None))
        try:
            UUID(task_id)
        except ValueError:
            return Response("{}")
        if task_id is None:
            return Response("{}")
        result = celery_app.AsyncResult(task_id)
        if isinstance(result.result, Exception):
            r = {
                'error': str(result.result.__class__),
                'message': result.result.args
            }
        else:
            r = result.result
        result_values = {
            'result': r,
            'state': result.state
        }
        return Response(result_values)
