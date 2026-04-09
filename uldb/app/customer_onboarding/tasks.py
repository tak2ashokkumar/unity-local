from __future__ import absolute_import

from celery import shared_task
from .networkScanner import startScan
from .models import NetworkScan
import json
from uldb.celery_dynamic_conditions import task_config

import logging

APP_QUEUE = ['veryfast']
APP_AUTOSCALE = {
    'veryfast': '16,1',
}

logger = logging.getLogger(__name__)


@task_config(speed='veryfast')
@shared_task
def startScanning(inet, obj_id):
    try:
        response = startScan(inet)
        obj = NetworkScan.objects.get(pk=obj_id)
        obj.scan_results = json.dumps(response)
        obj.scan_status = NetworkScan.SCAN_STATUS[1][0]
        obj.save()
    except Exception as e:
        logger.error("Failed to scan network for object %s: %s", obj_id, str(e))
