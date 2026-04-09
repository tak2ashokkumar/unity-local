# -*- coding: utf-8 -*-
"""
    tasks.py

    :copyright: (C) 2018 UnitedLayer, LLC. All Rights Reserved.
    :author: psorab@unitedlayer.com
"""
from __future__ import absolute_import

import json
from itertools import chain
from .utils import DatacenterWidgetData, CabinetWidget
from celery import shared_task
from uldb.celery_dynamic_conditions import task_config
from app.inventory.models import *
from app.organization.models import *
from integ.ObserviumBackend.models import ObserviumDevice
from rest.customer.utils import get_asset_stat
from cloud.CloudService.models import ColoCloud, ColoCloudData
from django.db.models import Model
from hubservice.hub import DataCenterHub, OrgHub
import logging

APP_QUEUE = ['veryfast']
APP_AUTOSCALE = {
    'veryfast': '16,1',
}

logger = logging.getLogger(__name__)


def _sync_colocloud_data(colo_cloud, user_id):
    user = User.objects.get(id=user_id)
    org = colo_cloud.customer
    datacenter = {}
    org_hub = OrgHub(user)
    dc_hub = DataCenterHub(org_hub, colo_cloud, user)
    datacenter['datacenter_name'] = colo_cloud.name
    datacenter['datacenter_uuid'] = str(colo_cloud.uuid)
    datacenter['co2_run_rate'] = dc_hub.sustainability.get_co2_run_rate(user_id)
    datacenter['cabinets'] = []

    for cab in colo_cloud.cabinets.visible():
        cabinet = CabinetWidget(cab, org, user)
        cabinets = {}
        total_devices = []
        cabinets['cabinet_name'] = cab.name
        cabinets['cabinet_uuid'] = str(cab.uuid)
        cabinets['capacity'] = cab.size
        cabinets['occupied'] = cabinet.get_occupied_size()

        up, down, unknown, non_configured = cabinet.get_status_count()
        alerts_count = cabinet.get_alerts_count()
        temperatur = cabinet.get_temperature()
        power = cabinet.get_power_utilization()

        cabinets['up_count'] = up
        cabinets['down_count'] = down
        cabinets['alerts'] = alerts_count
        cabinets['max_temperature'] = temperatur
        cabinets['total_power'] = power
        cabinets['pdus'] = cabinet.get_pdu_stats()
        datacenter['cabinets'].append(cabinets)

    ColoCloudData.objects.update_or_create(  # Will always as per the logged in user
        colo_cloud=colo_cloud,
        defaults={"data": datacenter}
    )
    return datacenter


@task_config(speed="veryfast")
@shared_task
def sync_org_colocloud(user_id):
    user = User.objects.get(id=user_id)
    colo_clouds = ColoCloud.objects.filter(customer=user.org)
    data = [_sync_colocloud_data(cc, user_id) for cc in colo_clouds]
    return {"data": data}


@task_config(speed='veryfast')
@shared_task(time_limit=600)
def sync_datacenter_status(user_id):
    try:
        user = User.objects.get(id=user_id)
        dc_status = {
            'status': 'NA',
            'category': 'Datacenter'
        }
        physical_devices_status = {
            'status': 'NA',
            'category': 'Physical Devices'
        }
        datacenters = ColoCloud.objects.filter(customer=user.org)
        for dc in datacenters:
            org = dc.customer
            physical_devices_count = 0  # Only monitoring enabled
            physical_devices_up = 0
            for cab in dc.cabinets.visible():
                cabinet = CabinetWidget(cab, org, user)
                up, down, unknown, non_configured = cabinet.get_status_count()
                physical_devices_up = up
                physical_devices_count = up + down + unknown + non_configured

            logger.info(
                "Physical Devices Count for %s: %s",
                dc.name,
                physical_devices_count
            )

            if physical_devices_count > 0:  # Devices monitored > 0
                logger.info(
                    "Physical Devices UP for %s : %s",
                    dc.name,
                    physical_devices_up
                )
                if physical_devices_count == physical_devices_up:  # All Devices up
                    logger.info("<------- Devices count equal ------->")
                    physical_devices_status['status'] = 'up'
                elif physical_devices_up > 0 and physical_devices_count != physical_devices_up:
                    logger.info("<------- Devices up partially ------->")
                    physical_devices_status['status'] = 'partially-up'
                elif physical_devices_up == 0:  # Devices up count
                    logger.info("<------- Devices count down ------->")
                    physical_devices_status['status'] = 'down'

                logger.info(
                    "Physical device status: %s ",
                    physical_devices_status
                )
                # Will change in future
                dc_status['status'] = physical_devices_status['status']

            # Update datacenter with status of datacenter and physical devices
            dqset = ColoCloud.objects.filter(
                uuid=dc.uuid,
                name=dc.name,
                customer=user.org
            )
            logger.info("Updating DC Status for %s: %s", dc.name, dc_status)
            dqset.update(
                status=[dc_status, physical_devices_status]
            )  # avoid audit log update signal

        return {'data': True}
    except Exception as error:
        logger.error("Error world map data sync: %s", error)
        return error
