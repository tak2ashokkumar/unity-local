from __future__ import absolute_import

import json
import os
import paramiko
import requests
import time
from celery import shared_task
from uldb.celery_dynamic_conditions import task_config
from utils.celeryutils import CeleryTaskProfiler

from django.contrib.contenttypes.models import ContentType
from rest_framework.exceptions import ValidationError

from app.inventory.recycle_pdu_script import recycle, call_pdu_recycle_api
from app.organization.models import Organization
from libraries.auditlog.models import LogEntry

from .models import PDU, DeviceConfigurationData, NetworkDevicesGroup, SmartPDU, Sensor, Switch, Firewall, LoadBalancer
from app.user2.models import User
from .utils import (
    poll_status_from_monitoring,
    get_status_via_collector,
    create_or_update_network_configurations,
    send_device_sync_email_notification,
    sync_latest_iot_device_data,
    delete_device_configurations,
    update_switch_lifecycle_dates,
    update_firewall_lifecycle_dates,
    update_load_balancer_lifecycle_dates,
    update_software_server_lifecycle_dates
)
from agent.models import AgentConfig
from integ.monitoring.utils import get_model_obj
from synchronize.models import JobResult
import logging

APP_QUEUE = ['veryfast']
APP_AUTOSCALE = {
    'veryfast': '16,1',
}
logger = logging.getLogger(__name__)


@task_config(speed='veryfast')
@shared_task
def recycle_PDU(pdu_id, username, password, ip_address, all_outlets, outlets, user_id):
    try:
        msg = ""
        instance = PDU.objects.get(pk=pdu_id)
        user = User.objects.get(pk=user_id)

        agent = user.org.agents.all().first()
        if agent:
            pyro = __import__('Pyro4')
            connection = "PYRO:Agent@{}:{}".format(agent.ip_address, agent.pyro_port)
            connect = pyro.core.Proxy(connection)
            try:
                response = connect.pdu_recycle(username, password, ip_address, all_outlets, outlets)
            except pyro.errors.CommunicationError as ce:
                logger.error("Communication error : %s", ce)
                data = {
                    'ip': instance.ip,
                    'username': instance.username,
                    'password': instance.password,
                    'all_outlets': all_outlets,
                    'outlets': json.loads(outlets) if outlets else None
                }
                response = call_pdu_recycle_api(agent, data)
        else:
            response = recycle(username, password, ip_address, all_outlets, outlets)

        if response:
            if all_outlets:
                msg += "All outlets"
            else:
                msg += "Outlets " + ",".join(str(i) for i in outlets)
            changes = {"PDU Recycled Outlets": [msg]}
            logger.info("PDU recycled: %s", changes)
            log_action = LogEntry.Action.RECYCLE
            le = LogEntry.objects.log_create(
                instance,
                actor=user,
                action=log_action,
                changes=json.dumps(changes),
            )
            logger.info("Log entry created: %s", le)
            return {'status': 1, 'data': 'PDU has been recycled successfully'}
        else:
            return {'status': 0, 'data': 'PDU could not be recycled, please try again later'}
    except Exception as e:
        logger.error("Error while recycliing PDU  : {}".format(e))
        return {'status': 0, 'data': e}


@task_config(speed='veryfast')
@shared_task
def sync_all_device_status():
    poll_status_from_monitoring()


@task_config(speed='veryfast')
@shared_task
def poll_device_status(agent_id, data):
    agent = AgentConfig.objects.get(id=agent_id)
    post_url = 'https://{ip_address}/discovery/device_status/'.format(
        ip_address=getattr(agent, 'ip_address', None)
    )
    agent.post_to_collector(post_url, data)


@task_config(speed='veryfast')
@shared_task
def get_status_via_collector_task(agent_id, request_user_id):
    agent = AgentConfig.objects.get(id=agent_id)
    request_user = User.objects.get(id=request_user_id)
    get_status_via_collector(org_id_list=[agent.customer.id], collector=agent, request_user=request_user)


class DeviceGroupExtendedTask(CeleryTaskProfiler):

    def __call__(self, *args, **kwargs):
        task_id = getattr(self.request, "id", None)
        group_uuid = kwargs.get('uuid', None)
        if task_id and group_uuid:
            group = NetworkDevicesGroup.objects.get(uuid=group_uuid)
            job_schedule_instance = group._job_scheduled.all()[0]
            _, created = JobResult.objects.get_or_create(
                task_id=task_id,
                defaults={
                    'status': 'STARTED',
                    'job_schedule_id': job_schedule_instance.id
                }
            )
        return super(DeviceGroupExtendedTask, self).__call__(*args, **kwargs)

    def on_success(self, retval, task_id, args, kwargs):
        group = NetworkDevicesGroup.objects.get(uuid=kwargs['uuid'])
        job_schedule_instance = group._job_scheduled.all()[0]
        result, created = JobResult.objects.get_or_create(
            task_id=task_id,
            defaults={
                'status': 'SUCCESS',
                'job_schedule_id': job_schedule_instance.id
            }
        )
        if not created:
            result.status = 'SUCCESS'
            result.save()
        if result.executed_by:
            for data in retval:
                backup_uuids = data.get('backups', [])
                if backup_uuids:
                    backups = DeviceConfigurationData.objects.filter(uuid__in=backup_uuids)
                    if backups:
                        backups.update(executed_by=result.executed_by)
        if group.sync_success_notify:
            send_device_sync_email_notification(group, retval, result.status)

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        group = NetworkDevicesGroup.objects.get(uuid=kwargs['uuid'])
        job_schedule_instance = group._job_scheduled.all()[0]
        result, created = JobResult.objects.get_or_create(
            task_id=task_id,
            defaults={
                'status': 'FAILED',
                'job_schedule_id': job_schedule_instance.id
            }
        )
        if not created:
            result.status = 'FAILED'
            result.save()
        if result.executed_by and exc.args and isinstance(exc.args[0], list):
            for data in exc.args[0]:
                backup_uuids = data.get('backups', [])
                if backup_uuids:
                    backups = DeviceConfigurationData.objects.filter(uuid__in=backup_uuids)
                    if backups:
                        backups.update(executed_by=result.executed_by)
        if group.sync_failure_notify and exc.args and isinstance(exc.args[0], list):
            send_device_sync_email_notification(group, exc.args[0], result.status)


@task_config(speed='veryfast')
@shared_task(base=DeviceGroupExtendedTask, soft_time_limit=3600, time_limit=5400)
def sync_device_group_configurations(uuid):
    processed_devices_data = create_or_update_network_configurations(uuid)
    any_device_failed = False
    for device_data in processed_devices_data:
        if 'error' in device_data:
            any_device_failed = True
            break
    if any_device_failed:
        raise Exception(processed_devices_data)
    logger.info("Device Group Synced Successfully.")
    return processed_devices_data


@task_config(speed='veryfast')
@shared_task(soft_time_limit=3600, time_limit=5400)
def restore_configuration_task(config_uuid):
    restore_config_file = DeviceConfigurationData.objects.get(uuid=config_uuid)
    device = restore_config_file.device
    device_data = {
        'device_type': device.config_device_type,
        'device_ip': device.management_ip,
        'username': device.ncm_credentials.username,
        'password': device.ncm_credentials.password,
        'enable_password': device.enable_mode_password if device.enable_mode_password else '',
        'port': 22,
        'org_name': restore_config_file.customer.name,
        'uuid': str(restore_config_file.uuid)
    }
    agent_ip_address = device.collector.ip_address
    agent_username = device.collector.ssh_username
    agent_password = device.collector.ssh_password
    device_data['ssh_ip_address'] = agent_ip_address
    device_data['ssh_username'] = agent_username
    device_data['ssh_password'] = agent_password
    device_data['config_file_type'] = device.config_file_type
    if device.config_device_type == 'fortinet':  # Currently supported for only Fortinet/Fortigate
        device_data['encrypted_password'] = restore_config_file.file_password
    headers = device.collector.get_auth_token_headers()
    test_connection_url = 'https://' + device.collector.ip_address + '/discovery/test_connection/'
    response = requests.post(
        test_connection_url,
        data=json.dumps(device_data),
        headers=headers,
        verify=False,
        timeout=120
    )
    if response.status_code != 200:
        raise Exception('Credentials are invalid.')
    restore_file_path = restore_config_file.config_file
    root_media_url = 'https://' + device.collector.ip_address + '/discovery/media_directory/'
    response = requests.get(
        root_media_url,
        headers=headers,
        verify=False,
        timeout=60
    )
    if response.status_code != 200:
        raise Exception('Failed to get root media.')
    agent_file_dir = response.json()['path'] + 'configurations'
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(agent_ip_address, username=agent_username, password=agent_password)
    sftp = ssh.open_sftp()
    try:
        sftp.stat(agent_file_dir)
    except IOError:
        sftp.mkdir(agent_file_dir)
    agent_file_path = os.path.join(agent_file_dir, os.path.basename(restore_file_path))
    sftp.put(restore_file_path, agent_file_path)
    restore_configuration_url = 'https://' + device.collector.ip_address + '/discovery/restore_configuration/'
    restore_data = {
        'file_path': agent_file_path,
        'device_data': device_data
    }
    response = requests.post(
        restore_configuration_url,
        data=json.dumps(restore_data),
        headers=headers,
        verify=False,
        timeout=120
    )
    if response.status_code != 200:
        raise Exception('Config restoration failed.')
    task_id = response.json()['task_id']
    while True:
        task_url = 'https://' + device.collector.ip_address + '/discovery/task/{}/'.format(task_id)
        response = requests.get(
            task_url,
            headers=headers,
            verify=False,
            timeout=60
        )
        if response.status_code == 200:
            task_result = response.json()
            if task_result.get('state') in ['SUCCESS', 'PENDING', 'STARTED', 'FAILURE']:
                if task_result.get('state') == 'SUCCESS':
                    break
                elif task_result.get('state') == 'FAILURE':
                    result = task_result.get('result')
                    logger.error(result)
                    raise Exception('Restoration Failed!')
        time.sleep(25)  # Wait time for celery
    changes = {'action': ['{} - Restore Operation Completed.'.format(device.name)]}
    LogEntry.objects.log_create(
        restore_config_file,
        action=LogEntry.Action.DEVICE_RESTORE_OPERATION,
        changes=json.dumps(changes),
    )
    logger.info("Device Configuration Restored Successfully.")


@shared_task(bind=True, soft_time_limit=1200, time_limit=3600)
def sync_sensor_temperature(self):
    sensors = Sensor.objects.all()
    for sensor in sensors:
        sync_latest_iot_device_data(sensor.uuid, sensor.DEVICE_TYPE, 'temperature')


@shared_task(bind=True, soft_time_limit=1200, time_limit=3600)
def sync_sensor_humidity(self):
    sensors = Sensor.objects.all()
    for sensor in sensors:
        sync_latest_iot_device_data(sensor.uuid, sensor.DEVICE_TYPE, 'humidity')


@shared_task(bind=True, soft_time_limit=1200, time_limit=3600)
def sync_sensor_airflow(self):
    sensors = Sensor.objects.all()
    for sensor in sensors:
        sync_latest_iot_device_data(sensor.uuid, sensor.DEVICE_TYPE, 'airflow')


@shared_task(bind=True, soft_time_limit=1200, time_limit=3600)
def sync_smart_pdu_current(self):
    smart_pdus = SmartPDU.objects.all()
    for smart_pdu in smart_pdus:
        sync_latest_iot_device_data(smart_pdu.uuid, smart_pdu.DEVICE_TYPE, 'current')


@shared_task(bind=True, soft_time_limit=1200, time_limit=3600)
def sync_smart_pdu_power(self):
    smart_pdus = SmartPDU.objects.all()
    for smart_pdu in smart_pdus:
        sync_latest_iot_device_data(smart_pdu.uuid, smart_pdu.DEVICE_TYPE, 'power')


@shared_task(bind=True, soft_time_limit=1200, time_limit=3600)
def sync_smart_pdu_voltage(self):
    smart_pdus = SmartPDU.objects.all()
    for smart_pdu in smart_pdus:
        sync_latest_iot_device_data(smart_pdu.uuid, smart_pdu.DEVICE_TYPE, 'voltage')


@shared_task(bind=True, soft_time_limit=1200, time_limit=3600)
def perform_ncm_retention_policy(self):
    delete_device_configurations(Switch)
    delete_device_configurations(Firewall)
    delete_device_configurations(LoadBalancer)


@shared_task(bind=True, soft_time_limit=1200, time_limit=3600)
def sync_model_lifecycle_dates(self):
    update_switch_lifecycle_dates()
    update_firewall_lifecycle_dates()
    update_load_balancer_lifecycle_dates()
    update_software_server_lifecycle_dates()
