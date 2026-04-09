# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2016 UnitedLayer, LLC.
#   All Rights Reserved.

"""response.py
"""

from __future__ import absolute_import

from rest_framework import status
from rest_framework.response import Response


class TaskResponse(Response):

    def __init__(self, task, custom_data=None):
        task_response = {
            'task_id': task.task_id,
        }
        if custom_data:
            task_response.update(custom_data)
        super(TaskResponse, self).__init__(
            task_response, status=status.HTTP_202_ACCEPTED)

# class TaskResponse(Response):

#     def __init__(self, task):
#         super(TaskResponse, self).__init__({
#             'task_id': task.task_id,
#             # 'task_name': task.task_name   # deprecated
#         }, status=status.HTTP_202_ACCEPTED)
