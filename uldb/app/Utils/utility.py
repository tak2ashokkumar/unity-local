# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2016 UnitedLayer, LLC.
#
# All Rights Reserved.

import random
import uuid
import json

from libraries.auditlog.models import LogEntry
from libraries.auditlog.diff import model_instance_diff
from defines import *
from django.contrib.contenttypes.models import ContentType

import logging
logger = logging.getLogger(__name__)  # logger from settings.py


def get_peripherals(mb_id=None, ph_type=None):
    # Get associated peripherals and relieve from system
    from app.server.models import MotherboardPeripheralMap
    peripheral_list = MotherboardPeripheralMap.objects.filter(
        motherboard_id=mb_id,
        peripheral_type__peripheral_type=ph_type
    ).values_list(
        'peripheral_id', flat=True
    )
    return peripheral_list


def random_serial_number(prefix=None):
    """
    Returns a random string, optionally prefixed with the string
    passed as a kwarg called 'prefix'.
    """
    if prefix is None:
        prefix = "MISSING"
    rand_32b = hex(random.getrandbits(SERIAL_NUMBER_ENTROPY))
    rand_str = "%s-%s" % (prefix, rand_32b)
    return rand_str


def generate_uuid():
    return uuid.uuid4()


ZABBIX_METRIC_MAP = {
    # VMs & Baremetal
    "system.cpu.util": {"metric_name": "cpu", "metric_unit": "percent", "device_types": ["vm", "baremetal"]},
    "system.mem.used": {"metric_name": "memory", "metric_unit": "bytes", "device_types": ["vm", "baremetal"]},
    "vm.memory.available[]": {"metric_name": "memory_available", "metric_unit": "bytes", "device_types": ["baremetal"]},
    "vm.memory.total[]": {"metric_name": "memory_total", "metric_unit": "bytes", "device_types": ["baremetal"]},
    "vfs.fs.size[/,used]": {"metric_name": "storage", "metric_unit": "bytes", "device_types": ["vm", "baremetal"]},

    # Network devices cpu and network
    # "net.if.in[eth0]": {"metric_name": "network_in", "metric_unit": "bps", "device_types": ["network"]},
    # "net.if.out[eth0]": {"metric_name": "network_out", "metric_unit": "bps", "device_types": ["network"]},

    # Optional metrics
    "system.cpu.num": {"metric_name": "cpu_cores", "metric_unit": "count", "device_types": ["baremetal"]},
    # "power.consumption": {"metric_name": "power_usage", "metric_unit": "watts", "device_types": ["baremetal"]},
}


def add_m2m_customers(customers, instance_id, content_type_id):
    try:
        obj = LogEntry.objects.get(object_pk=instance_id, action=0, content_type_id=content_type_id)
        obj.organizations.add(*customers)
        obj.save()
    except Exception as error:
        logger.error(error.message)


def add_m2m_audit_diff(new_data_list, instance_id, content_type_id, key):
    """
    :param new_data_list: list of m2m object id
    :param instance_id: instance id
    :content_type_id the model id
    :return:
    """
    m2m_diff = ["None", new_data_list]
    try:
        obj = LogEntry.objects.get(object_pk=instance_id, action=0, content_type_id=content_type_id)
        changes_json = json.loads(obj.changes) if obj.changes else {}
        changes_json.update({key: m2m_diff})
        obj.changes = json.dumps(changes_json)
        obj.save()
        logger.debug("audit log added for cabinet------------")
    except Exception as error:
        logger.error(error.message)


def update_m2m_audit_diff(old_data_list, new_data_list, old_instance, new_instance, m2m_column, Model):
    """
    :param old_data_list: list of m2m old object id
    :param new_data_list: list of m2m new object id
    :param old_instance: Model instance before updating
    :param new_instance: Model instance after updating
    :param m2m_column: m2m column name
    :param Model: Model Class
    :return:
    """
    diff = model_instance_diff(old_instance, new_instance)
    if diff is not None:
        # Ugly hack for MaintenanceSchedule model
        if (len(diff) == 1) and 'updated_at' in diff:
            diff = None
    ctype = ContentType.objects.get_for_model(model=Model)
    if old_data_list or new_data_list or diff:
        m2m_diff = [old_data_list, new_data_list]

        if diff is None:
            diff = {m2m_column: m2m_diff}
            data = {"object_pk": new_instance.id,
                    "object_id": new_instance.id,
                    "action": 1,
                    "changes": diff,
                    "content_type_id": ctype.id
                    }
            obj = LogEntry.objects.create(**data)
            obj.save()
        else:
            if old_data_list or new_data_list:
                diff.update({m2m_column: m2m_diff})
                obj = LogEntry.objects.filter(object_pk=new_instance.id, action=1, content_type_id=ctype.id).order_by("-timestamp").first()
                obj.changes = json.dumps(diff)
                obj.save()


def get_or_create_tags(tags, customer):
    from app.inventory.models import Tag
    tag_ids = []
    for tag in tags:
        tag_instance, created = Tag.objects.get_or_create(tag_name=tag, customer=customer)
        tag_ids.append(tag_instance.pk)
    return tag_ids


def create_or_update_tags(tags, customer):
    from app.inventory.models import Tag
    tag_ids = []
    for tag in tags:
        tag_instance, created = Tag.objects.update_or_create(tag_name=tag, customer=customer)
        tag_ids.append(tag_instance.pk)
    return tag_ids
