# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2016 UnitedLayer, LLC.
#   All Rights Reserved.

"""mixins.py
"""

from __future__ import absolute_import

import json
import re
import paramiko
from functools32 import lru_cache
from MySQLdb import Connection
from django.db.models.query import QuerySet

from django.db import models
from django.db import IntegrityError
from agent.models import AgentConfig
from app.common.utils import Device
from app.inventory.managers import AllObjectsManager
from integ.ObserviumBackend.api import ObserviumAPI
from django.contrib.contenttypes.fields import GenericRelation
from django.core.validators import MaxValueValidator
from django.contrib.contenttypes.models import ContentType
from django.contrib.postgres.fields import ArrayField, JSONField

from django.conf import settings

from paramiko.transport import Transport
Transport._preferred_kex = settings.SSH_KEX_ALGORITHMS + Transport._preferred_kex  # Updating KEX Algo


from django.core.exceptions import ObjectDoesNotExist
from rest.core.exceptions import BadRequestError

import uuid

from integ.proxy.models import ReverseProxyCommon
from django.contrib.contenttypes.fields import GenericRelation
from app.common.fields import EncryptedPasswordField

from app.common.utils import Device, value_to_float

import logging

logger = logging.getLogger(__name__)


class AssetMixin(models.Model):
    """
    Mixin for all inventory objects that can have a 'status' and an asset_tag
    """
    STATUS_CHOICES = (
        ('NA', 'NA'),
        ('UP', 'UP'),
        ('DOWN', 'DOWN'),
    )
    status = models.CharField(
        max_length=16,
        choices=STATUS_CHOICES,
        default=STATUS_CHOICES[0][0],
        null=True
    )
    asset_tag = models.CharField(max_length=128, null=True, unique=True)

    # customer = models.ForeignKey('organization.Organization', null=True)

    class Meta:
        abstract = True


class AssetClassMixin(models.Model):
    """
    Provides asset_tag for asset "classes", such as hard drives, memory, which may have a
    stock-keeping numbers in Salesforce but individually are not labeled with asset tags.
    """
    asset_tag = models.CharField(max_length=128, null=True, unique=True)

    class Meta:
        abstract = True


class MotherboardComponent(models.Model):
    server = models.ForeignKey(
        'inventory.Server',
        null=True,
    )
    motherboard = models.ForeignKey(
        'inventory.Motherboard',
        null=True
    )

    class Meta:
        abstract = True


class IPAddressableMixin(models.Model):
    ip_address = models.ForeignKey('ip.IPv4Address')

    class Meta:
        abstract = True


class NetworkingDeviceClassMixin(models.Model):
    """
    For *models* of switches, load balancers, etc.
    e.g., a class of Cisco 3760-X switches
    """
    name = models.CharField(max_length=64, unique=True)
    num_ports = models.IntegerField(null=True, default=0)
    num_uplink_ports = models.IntegerField(default=0)
    manufacturer = models.ForeignKey('inventory.Manufacturer', null=True)

    class Meta:
        abstract = True


class DeviceCollectorMixin(models.Model):
    collector = models.ForeignKey(AgentConfig, null=True, on_delete=models.SET_NULL)

    class Meta:
        abstract = True


class ObserviumMonitoringEnablerMixin(object):

    @property
    def observium_id(self):
        pass

    @staticmethod
    def get_observium_class_map():
        from integ.ObserviumBackend.models import (
            ObserviumFirewall, ObserviumSwitch, ObserviumServer,
            ObserviumVMwareVM, ObserviumHypervVM, ObserviumOpenStackVM,
            ObserviumPDU, ObserviumLoadBalancer, ObserviumStorageDevice,
            ObserviumMacDevice, ObserviumCustomCloudVM,
        )
        return {
            'firewall': (ObserviumFirewall, 'firewall'),
            'switch': (ObserviumSwitch, 'switch'),
            'server': (ObserviumServer, 'server'),
            'vmwarevmmigration': (ObserviumVMwareVM, 'instance'),
            'hypervvm': (ObserviumHypervVM, 'instance'),
            'openstackvmmigration': (ObserviumOpenStackVM, 'instance'),
            'pdu': (ObserviumPDU, 'pdu'),
            'loadbalancer': (ObserviumLoadBalancer, 'load_balancer'),
            'storagedevice': (ObserviumStorageDevice, 'storage_device'),
            'macdevice': (ObserviumMacDevice, 'mac_device'),
            'virtualmachine': (ObserviumCustomCloudVM, 'instance')
        }

    def configure_observium_monitoring(self):
        logger.info("================ Inside enable_monitoring ======================")
        from integ.ObserviumBackend.models import ObserviumInstance
        device_id = None
        observium_class_and_field = self.get_observium_class_map().get(
            self._meta.model_name
        )
        logger.debug("Observium Class  & Field : %s", observium_class_and_field)
        observium_class = observium_class_and_field[0]
        observium_field = observium_class_and_field[1]

        logger.debug("Before assigning")
        # obs_class = observium_class.objects.filter(observium_field=self)
        # logger.debug("OBS class : %s", obs_class)
        filter_device = {
            observium_field: self
        }
        if not observium_class.objects.filter(**filter_device):
            snmp_walk_command = None
            if self.snmp_version == 'v2c':
                snmp_walk_command = "snmpget -v2C {} -c {} .1.3.6.1.2.1.1.1.0".format(
                    self.ip_address, self.snmp_community
                )

            elif self.snmp_version == 'v3':
                if self.snmp_authlevel == 'authNoPriv':
                    snmp_walk_command = "snmpget -v3 -u {} -A {} -l {} -a {} {} .1.3.6.1.2.1.1.1.0".format(
                        self.snmp_authname, self.snmp_authpass, self.snmp_authlevel,
                        self.snmp_authalgo, self.ip_address
                    )
                elif self.snmp_authlevel == 'authPriv':
                    snmp_walk_command = "snmpget -v3 -u {} -A {} -l {} -a {}  -x {} -X {} {} .1.3.6.1.2.1.1.1.0".format(
                        self.snmp_authname, self.snmp_authpass, self.snmp_authlevel, self.snmp_authalgo,
                        self.snmp_cryptoalgo, self.snmp_cryptopass,
                        self.ip_address
                    )

            logger.debug("CMD : %s", snmp_walk_command)
            lookup = {}

            organization = self.organization_id

            if isinstance(organization, QuerySet):
                lookup = {
                    'customer__in': organization
                }
                customer = organization.first()
            else:
                lookup = {
                    'customer': organization
                }
                customer = organization

            agents_available = AgentConfig.objects.filter(
                **lookup
            )

            logger.info('agents_available : %s', agents_available)
            logger.info('Obs host : %s', settings.OBSERVIUM_HOST_URL)

            observium_instance = ObserviumInstance.objects.get_default_one(
                customer
            )

            if observium_instance:
                observium_client = ObserviumAPI(observium_instance)

                for agent in agents_available:
                    client = paramiko.SSHClient()
                    client.load_system_host_keys()
                    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                    client.connect(
                        agent.ip_address,
                        username=agent.ssh_username,
                        password=agent.ssh_password,
                        port=agent.ssh_port,
                        banner_timeout=60
                    )

                    # perfrom SNMP walk from agent
                    logger.info('snmp_walk_command : %s', snmp_walk_command)
                    (stdin, stdout, stderr) = client.exec_command(snmp_walk_command)

                    # If SNMP walk is successfull add device to the devices table using cursor.
                    if stdout.channel.recv_exit_status() == 0:
                        logger.info("Got an snmp successfull")

                        # create an entry in the observium database using cursor.
                        OBSERVIUM_CONFIG = settings.OBSERVIUM_CONFIG

                        mysql_connection = Connection(
                            host=observium_instance.db_host,
                            port=observium_instance.db_port,
                            user=observium_instance.db_user,
                            passwd=observium_instance.db_password,
                            db=observium_instance.db_name
                        )

                        cursor = mysql_connection.cursor()
                        if self.snmp_version == 'v2c':
                            add_device_query = (
                                "INSERT INTO devices "
                                "(hostname, snmp_community, poller_id) "
                                "VALUES (%s, %s, %s)"
                            )

                            device_data = (self.ip_address, self.snmp_community, agent.poller_id)
                        elif self.snmp_version == 'v3':
                            if self.snmp_authlevel == 'noAuthNoPriv':
                                add_device_query = (
                                    "INSERT INTO devices "
                                    "(hostname, snmp_version, snmp_authlevel, poller_id) "
                                    "VALUES (%s, %s, %s, %s)"
                                )

                                device_data = (
                                    self.ip_address, self.snmp_version, self.snmp_authlevel, agent.poller_id
                                )

                            elif self.snmp_authlevel == 'authNoPriv':
                                add_device_query = (
                                    "INSERT INTO devices "
                                    "(hostname, snmp_version, snmp_authlevel, snmp_authname, snmp_authpass, snmp_authalgo, poller_id) "
                                    "VALUES (%s, %s, %s, %s, %s, %s, %s)"
                                )

                                device_data = (
                                    self.ip_address, self.snmp_version, self.snmp_authlevel, self.snmp_authname,
                                    self.snmp_authpass, self.snmp_authalgo,
                                    agent.poller_id
                                )

                            elif self.snmp_authlevel == 'authPriv':
                                add_device_query = (
                                    "INSERT INTO devices "
                                    "(hostname, snmp_version, snmp_authlevel, snmp_authname, snmp_authpass, "
                                    "snmp_authalgo, snmp_cryptopass, snmp_cryptoalgo, poller_id) "
                                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
                                )

                                device_data = (
                                    self.ip_address, self.snmp_version, self.snmp_authlevel, self.snmp_authname,
                                    self.snmp_authpass, self.snmp_authalgo,
                                    self.snmp_cryptopass, self.snmp_cryptoalgo, agent.poller_id
                                )

                        cursor.execute(add_device_query, device_data)
                        mysql_connection.commit()

                        get_device_id_query = (
                            "SELECT device_id FROM devices "
                            "WHERE hostname = %s AND poller_id = %s"
                        )

                        query_params = (self.ip_address, agent.poller_id)

                        cursor.execute(get_device_id_query, query_params)
                        query_result = cursor.fetchone()

                        if query_result:
                            device_id = query_result[0]

                        cursor.close()
                        mysql_connection.close()

                        break

                    else:
                        continue
                    client.close()

                if not device_id:
                    if self.snmp_version == 'v1':
                        data = {'hostname': self.ip_address, 'snmp_version': 'v1', 'snmp_community': self.snmp_community}
                    if self.snmp_version == 'v2c':
                        data = {'hostname': self.ip_address, 'snmp_version': 'v2c', 'snmp_community': self.snmp_community}
                    elif self.snmp_version == 'v3':
                        if self.snmp_authlevel == 'noAuthNoPriv':
                            data = {
                                'hostname': self.ip_address,
                                'snmp_version': self.snmp_version,
                                'snmp_authlevel': self.snmp_authlevel
                            }
                        elif self.snmp_authlevel == 'authNoPriv':
                            data = {
                                'hostname': self.ip_address,
                                'snmp_version': self.snmp_version,
                                'snmp_authlevel': self.snmp_authlevel,
                                'snmp_authname': self.snmp_authname,
                                'snmp_authpass': self.snmp_authpass,
                                'snmp_authalgo': self.snmp_authalgo
                            }
                        elif self.snmp_authlevel == 'authPriv':
                            data = {
                                'hostname': self.ip_address,
                                'snmp_version': self.snmp_version,
                                'snmp_authlevel': self.snmp_authlevel,
                                'snmp_authname': self.snmp_authname,
                                'snmp_authpass': self.snmp_authpass,
                                'snmp_authalgo': self.snmp_authalgo,
                                'snmp_cryptopass': self.snmp_cryptopass,
                                'snmp_cryptoalgo': self.snmp_cryptoalgo
                            }

                    response = observium_client.add_device(data)
                    logger.debug("Response : %s, %s", response, response.content)
                    if response.status_code == 200:
                        response_content = json.loads(response.content) if response.content else None
                        logger.debug("Response content : %s", response_content)
                        if response_content:
                            if response_content.get('device', None):
                                device_id = response_content.get('device').get('device_id', None)
                            else:
                                device_id = response_content.get(
                                    'device_id', None
                                )
                            logger.debug("Device id : %s", device_id)
                if device_id:
                    self.map_observium_device(device_id, observium_instance)
                    return True
            return False

    def get_device_monitored(self):
        from integ.ObserviumBackend.models import ObserviumInstance
        observium_class_and_field = self.get_observium_class_map().get(self._meta.model_name)
        observium_class = observium_class_and_field[0]
        observium_field = observium_class_and_field[1]
        try:
            device_monitored = observium_class.objects.get(**{observium_field: self.id})
        except Exception as error:
            device_monitored = None
        return device_monitored

    def get_observium_client(self):
        if self.observium_host:
            return ObserviumAPI(self.observium_host)
        else:
            return None

    def delete_observium_monitoring(self):
        device_monitored = self.get_device_monitored()
        if device_monitored:
            device_monitored.delete()

    def disable_observium_monitoring(self):
        device_monitored = self.get_device_monitored()
        if device_monitored:
            device_monitored.disable()

    def enable_observium_monitoring(self):
        device_monitored = self.get_device_monitored()
        if device_monitored:
            device_monitored.enable()

    def map_observium_device(self, device_id, observium_instance=None):
        from integ.ObserviumBackend.models import ObserviumInstance

        observium_model, observium_field = self.get_observium_class_map().get(self._meta.model_name)
        organization = self.organization_id

        if isinstance(organization, QuerySet):
            customer = organization.first()
        else:
            customer = organization

        if not observium_instance:
            observium_instance = ObserviumInstance.objects.get_default_one(customer)

        data = {
            observium_field: self,
            'defaults': {
                'observium_instance': observium_instance,
                'device_id': device_id
            }
        }
        return observium_model.objects.update_or_create(**data)


class ProxyManagementMixin(object):
    # proxy_mapping = GenericRelation('inventory.PDUSocketMappings', object_id_field='proxy_id', related_query_name='rdevice')

    DEVICE_MODEL_CLASS = {
        'Firewall': 'firewall',
        'Switch': 'switch',
        'LoadBalancer': 'loadbalancer',
        'StorageDevice': 'storagedevice',
        'Server': 'server',
        'PDU': 'pdu',
        'MacDevice': 'macdevice'
    }

    @property
    def device_type(self):
        model_name = self.__class__.__name__
        return self.DEVICE_MODEL_CLASS[model_name]

    def create_device_proxy(self, url=None, proxy_type=None):
        from rest.customer.utils import create_proxy
        if url:
            if proxy_type:
                if url.startswith('https://'):
                    backend_url = url
                else:
                    backend_url = 'https://{}'.format(url)
                try:
                    res = create_proxy(
                        self.name,
                        backend_url,
                        proxy_type,
                        self.id,
                        self.device_type
                    )
                    logger.debug('create proxy response: {}'.format(res))
                except Exception as error:
                    logger.error("Failed to create proxy for: {}".format(error))

    def update_device_proxy(self, url=None, proxy_type=None):
        from rest.customer.utils import create_proxy, regenerate_proxy
        device_type = self.device_type
        content_type = ContentType.objects.get(model=device_type)
        if url:
            if url.startswith('https://'):
                backend_url = url
            else:
                backend_url = 'https://{}'.format(url)
            if proxy_type:
                try:
                    proxy_obj = ReverseProxyCommon.objects.get(
                        device_id=self.id,
                        content_type=content_type.id,
                        proxy_type=proxy_type)
                except:
                    proxy_obj = None
                    msg = 'Reversy proxy for {} does not exit, Creating new proxy'.format(self.name)
                    logger.debug(msg)
                    res = create_proxy(
                        self.name,
                        backend_url,
                        proxy_type,
                        self.id,
                        device_type
                    )

                if proxy_obj:
                    # Remove DNS settings for old private cloud
                    if not ReverseProxyCommon.objects.filter(
                            device_id=self.id,
                            content_type=content_type.id,
                            backend_url=backend_url).exists():
                        proxy_obj.delete_func()()
                        # Update proxy object
                        proxy_obj.name = self.name
                        proxy_obj.proxy_url = uuid.uuid4()
                        proxy_obj.backend_url = backend_url
                        proxy_obj.save()

                        # Recreate proxy with updated values
                        res = regenerate_proxy(proxy_obj.id)
                        logger.debug('Regenerate proxy response {}'.format(res))
        else:
            try:
                proxy_obj = ReverseProxyCommon.objects.filter(
                    device_id=self.id,
                    content_type=content_type.id,
                    proxy_type=proxy_type)
                for obj in proxy_obj:
                    obj.delete_func()()
            except Exception as error:
                logger.error("Unable to delete proxy")

    def delete_device_proxy(self, proxy_type=None):
        content_type = ContentType.objects.get(model=self.device_type)
        try:
            proxy_obj = ReverseProxyCommon.objects.filter(
                device_id=self.id,
                content_type=content_type.id,
                proxy_type=proxy_type)
            for obj in proxy_obj:
                obj.delete_func()()
        except Exception as error:
            logger.error("Unable to delete proxy")


class NetworkingDeviceMixin(models.Model, ObserviumMonitoringEnablerMixin):
    name = models.CharField(max_length=128, null=True)
    serial_number = models.CharField(max_length=128, null=True)
    cabinet = models.ForeignKey('datacenter.Cabinet', null=True)
    customers = models.ManyToManyField('organization.Organization', related_name="%(app_label)s_%(class)s_customers")

    observium_host = models.OneToOneField('monitoring.ObserviumHost', null=True)
    is_shared = models.BooleanField(default=False)
    management_ip = models.GenericIPAddressField(null=True, blank=True)

    # ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        abstract = True


class NetworkDetailMixin(models.Model):
    alias_name = models.CharField(max_length=255, null=True, blank=True)
    dns_name = models.CharField(max_length=255, null=True, blank=True)
    environment = models.CharField(max_length=255, null=True, blank=True)
    # status = models.CharField(max_length=255, null=True, blank=True)
    description = models.CharField(max_length=255, null=True, blank=True)
    version_number = models.CharField(max_length=255, null=True, blank=True)
    # serial_number = models.CharField(max_length=255, null=True, blank=True)
    discovery_method = models.CharField(max_length=255, null=True, blank=True)
    first_discovered = models.DateTimeField(null=True, blank=True)
    last_discovered = models.DateTimeField(null=True, blank=True)
    number_of_ports = models.IntegerField(null=True, blank=True)
    # IPsec_tunnel = models.BooleanField(default=False)
    last_rebooted = models.DateTimeField(null=True, blank=True)
    os_name = models.CharField(max_length=255, null=True, blank=True)
    os_type = models.CharField(max_length=255, null=True, blank=True)
    cpu = models.IntegerField(null=True, blank=True)
    memory = models.BigIntegerField(null=True, blank=True)
    disk_space = models.FloatField(null=True, blank=True)
    fan = models.IntegerField(null=True, blank=True)
    power_supply1 = models.ForeignKey('inventory.PDU', related_name="%(class)s_power_supply1", null=True, blank=True)
    power_supply2 = models.ForeignKey('inventory.PDU', related_name="%(class)s_power_supply2", null=True, blank=True)
    firmware_version = models.CharField(max_length=255, null=True, blank=True)
    last_updated = models.DateTimeField(null=True, blank=True)
    power_socket1 = models.IntegerField(null=True, blank=True)
    power_socket2 = models.IntegerField(null=True, blank=True)
    interfaces = JSONField(null=True)
    uptime = models.CharField(max_length=255, null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    system_object_oid = models.CharField(max_length=100, null=True)
    short_description = models.CharField(max_length=255, null=True, blank=True)
    host_name = models.CharField(max_length=255, null=True, blank=True)
    primary_capability = models.CharField(max_length=255, blank=True, null=True)
    capability_list = JSONField(null=True)
    flash_memory = models.CharField(max_length=255, blank=True, null=True)
    supported = models.BooleanField(default=True)
    physical_memory = models.CharField(max_length=255, null=True, blank=True)
    boot_rom_supported = models.BooleanField(default=True)
    dhcp_use = models.BooleanField(default=True)
    system_type = models.CharField(max_length=255, null=True, blank=True)
    integrity = models.BooleanField(default=True)
    expansion = models.CharField(max_length=255, blank=True, null=True)
    frequency = models.CharField(max_length=255, null=True, blank=True)
    input_current = models.CharField(max_length=255, null=True, blank=True)
    input_voltage = models.CharField(max_length=255, null=True, blank=True)
    reset_limit = models.CharField(max_length=255, null=True, blank=True)
    ports_per_slot = models.CharField(max_length=255, null=True, blank=True)
    max_consumption = models.CharField(max_length=255, null=True, blank=True)
    number_of_slots = models.CharField(max_length=255, null=True, blank=True)
    configuration_options = models.CharField(max_length=255, null=True, blank=True)
    reset_count = models.CharField(max_length=255, null=True, blank=True)
    data_rate = models.CharField(max_length=255, null=True, blank=True)
    chassis_bootup_state = models.CharField(max_length=255, null=True, blank=True)
    thermal_state = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        abstract = True


class ServerDetailMixin(models.Model):
    # alias_name = models.CharField(max_length=255, null=True, blank=True)
    dns_name = models.CharField(max_length=255, null=True, blank=True)
    environment = models.CharField(max_length=255, null=True, blank=True)
    # status = models.CharField(max_length=255, null=True, blank=True)
    discovery_method = models.CharField(max_length=255, null=True, blank=True)
    first_discovered = models.DateTimeField(null=True, blank=True)
    last_discovered = models.DateTimeField(null=True, blank=True)
    out_of_band_management_ip = models.CharField(max_length=255, null=True, blank=True)
    out_of_band_management_type = models.CharField(max_length=10, null=True, blank=True)
    last_rebooted = models.DateTimeField(null=True, blank=True)
    logical_cpu = models.IntegerField(null=True, blank=True)
    fan = models.IntegerField(null=True, blank=True)
    pdu1 = models.ForeignKey('inventory.PDU', related_name="%(class)s_power_supply1", null=True, blank=True)
    pdu2 = models.ForeignKey('inventory.PDU', related_name="%(class)s_power_supply2", null=True, blank=True)
    firmware_version = models.CharField(max_length=255, null=True, blank=True)
    last_updated = models.DateTimeField(null=True, blank=True)
    power_socket1 = models.IntegerField(null=True, blank=True)
    power_socket2 = models.IntegerField(null=True, blank=True)
    interfaces = JSONField(null=True)
    hypervisor = models.BooleanField(default=False)
    note = models.TextField(null=True, blank=True)
    uptime = models.CharField(max_length=255, null=True, blank=True)
    cpu_type = models.CharField(max_length=255, null=True, blank=True)
    cpu_speed = models.CharField(max_length=100, null=True, blank=True)
    disk_space = models.FloatField(null=True, blank=True)
    system_object_oid = models.CharField(max_length=100, null=True)
    os_build_version = models.CharField(max_length=255, null=True, blank=True)
    service_pack = models.CharField(max_length=255, null=True, blank=True)
    snapshot_available = models.BooleanField(default=False)
    cpu_model = models.CharField(max_length=255, null=True, blank=True)
    fqdn = models.CharField(max_length=255, null=True, blank=True)
    mac_address = models.CharField(max_length=100, null=True, blank=True)
    server_type = models.CharField(max_length=50, default="Virtual")
    os_type = models.CharField(max_length=100, null=True, blank=True)
    short_description = models.CharField(max_length=255, null=True, blank=True)
    primary_capability = models.CharField(max_length=255, blank=True, null=True)
    capability_list = JSONField(null=True)
    flash_memory = models.CharField(max_length=255, blank=True, null=True)
    frequency = models.CharField(max_length=255, null=True, blank=True)
    input_current = models.CharField(max_length=255, null=True, blank=True)
    input_voltage = models.CharField(max_length=255, null=True, blank=True)
    reset_limit = models.CharField(max_length=255, null=True, blank=True)
    ports_per_slot = models.CharField(max_length=255, null=True, blank=True)
    supported = models.BooleanField(default=True)
    boot_rom_supported = models.BooleanField(default=True)
    dhcp_use = models.BooleanField(default=True)
    system_type = models.CharField(max_length=255, null=True, blank=True)
    max_consumption = models.CharField(max_length=255, null=True, blank=True)
    other_capability_description = models.CharField(max_length=255, blank=True, null=True)
    media_supported = models.CharField(max_length=255, blank=True, null=True)
    admin_password_status = models.CharField(max_length=255, blank=True, null=True)
    reset_count = models.CharField(max_length=255, null=True, blank=True)
    data_rate = models.CharField(max_length=255, null=True, blank=True)
    number_of_slots = models.CharField(max_length=255, null=True, blank=True)
    configuration_options = models.CharField(max_length=255, null=True, blank=True)
    chassis_bootup_state = models.CharField(max_length=255, null=True, blank=True)
    reset_capability = models.CharField(max_length=255, null=True, blank=True)
    end_of_security_support = models.DateTimeField(blank=True, null=True)
    end_of_extended_support = models.DateTimeField(blank=True, null=True)

    class Meta:
        abstract = True


class StorageDetailMixin(models.Model):
    # alias_name = models.CharField(max_length=255, null=True, blank=True)
    dns_name = models.CharField(max_length=255, null=True, blank=True)
    environment = models.CharField(max_length=255, null=True, blank=True)
    serial_number = models.CharField(max_length=255, null=True, blank=True)
    interfaces = JSONField(null=True)
    discovery_method = models.CharField(max_length=255, null=True, blank=True)
    first_discovered = models.DateTimeField(null=True, blank=True)
    last_discovered = models.DateTimeField(null=True, blank=True)
    service_pack = models.CharField(max_length=255, null=True, blank=True)
    last_rebooted = models.DateTimeField(null=True, blank=True)
    cpu = models.IntegerField(null=True, blank=True)
    memory = models.BigIntegerField(null=True, blank=True)
    storage_capacity = models.BigIntegerField(null=True, blank=True)
    storage_used = models.BigIntegerField(null=True, blank=True)
    logical_cpu = models.IntegerField(null=True, blank=True)
    fan = models.IntegerField(null=True, blank=True)
    pdu1 = models.ForeignKey('inventory.PDU', related_name="%(class)s_power_supply1", null=True, blank=True)
    pdu2 = models.ForeignKey('inventory.PDU', related_name="%(class)s_power_supply2", null=True, blank=True)
    firmware_version = models.CharField(max_length=255, null=True, blank=True)
    last_updated = models.DateTimeField(null=True, blank=True)
    power_socket1 = models.IntegerField(null=True, blank=True)
    power_socket2 = models.IntegerField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    uptime = models.CharField(max_length=255, null=True, blank=True)
    system_object_oid = models.CharField(max_length=100, null=True)

    class Meta:
        abstract = True


class VMDetailMixin(models.Model):
    dns_name = models.CharField(max_length=255, null=True, blank=True)
    environment = models.CharField(max_length=255, null=True, blank=True)
    # status = models.CharField(max_length=255, null=True, blank=True)
    discovery_method = models.CharField(max_length=255, null=True, blank=True)
    first_discovered = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    last_discovered = models.DateTimeField(null=True, blank=True)
    service_pack = models.CharField(max_length=255, null=True, blank=True)
    last_rebooted = models.DateTimeField(null=True, blank=True)
    vcpu_count = models.IntegerField(null=True, blank=True)
    memory = models.BigIntegerField(null=True, blank=True)
    storage = models.BigIntegerField(null=True, blank=True)
    firmware_version = models.CharField(max_length=255, null=True, blank=True)
    last_updated = models.DateTimeField(null=True, blank=True)
    snapshot_available = models.BooleanField(default=False)
    hypervisor = models.ForeignKey('inventory.Hypervisor', related_name="%(class)s_hypervisor", null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    uptime = models.CharField(max_length=255, null=True, blank=True)
    serial_number = models.CharField(max_length=255, null=True, blank=True)
    manufacturer = models.CharField(max_length=255, null=True, blank=True)
    cpu_speed = models.CharField(max_length=255, null=True, blank=True)
    cpu_model = models.CharField(max_length=255, null=True, blank=True)
    fqdn = models.CharField(max_length=255, null=True, blank=True)
    mac_address = models.CharField(max_length=100, null=True, blank=True)
    model = models.CharField(max_length=255, null=True, blank=True)
    os_build_version = models.CharField(max_length=255, null=True, blank=True)
    server_type = models.CharField(max_length=50, default="Virtual")
    os_type = models.CharField(max_length=100, null=True, blank=True)
    description = models.CharField(max_length=255, null=True, blank=True)
    short_description = models.CharField(max_length=255, null=True, blank=True)
    primary_capability = models.CharField(max_length=255, blank=True, null=True)
    capability_list = JSONField(null=True)
    flash_memory = models.CharField(max_length=255, blank=True, null=True)
    frequency = models.CharField(max_length=255, null=True, blank=True)
    input_current = models.CharField(max_length=255, null=True, blank=True)
    input_voltage = models.CharField(max_length=255, null=True, blank=True)
    reset_limit = models.CharField(max_length=255, null=True, blank=True)
    ports_per_slot = models.CharField(max_length=255, null=True, blank=True)
    supported = models.BooleanField(default=True)
    physical_memory = models.CharField(max_length=255, null=True, blank=True)
    boot_rom_supported = models.BooleanField(default=True)
    dhcp_use = models.BooleanField(default=True)
    system_type = models.CharField(max_length=255, null=True, blank=True)
    max_consumption = models.CharField(max_length=255, null=True, blank=True)
    other_capability_description = models.CharField(max_length=255, blank=True, null=True)
    media_supported = models.CharField(max_length=255, blank=True, null=True)
    admin_password_status = models.CharField(max_length=255, blank=True, null=True)
    reset_count = models.CharField(max_length=255, null=True, blank=True)
    data_rate = models.CharField(max_length=255, null=True, blank=True)
    number_of_slots = models.CharField(max_length=255, null=True, blank=True)
    configuration_options = models.CharField(max_length=255, null=True, blank=True)
    reset_capability = models.CharField(max_length=255, null=True, blank=True)
    end_of_life = models.DateTimeField(blank=True, null=True)
    end_of_support = models.DateTimeField(blank=True, null=True)
    end_of_security_support = models.DateTimeField(blank=True, null=True)
    end_of_extended_support = models.DateTimeField(blank=True, null=True)
    chassis_bootup_state = models.CharField(max_length=255, null=True, blank=True)
    rack_number = models.CharField(max_length=50, null=True, blank=True)
    rack_position = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        abstract = True


class CabinetDetailMixin(models.Model):
    number_of_devices = models.IntegerField(default=0)
    pduA = models.ForeignKey('inventory.PDU', related_name="%(class)s_pduA", null=True, blank=True)
    pduB = models.ForeignKey('inventory.PDU', related_name="%(class)s_pduB", null=True, blank=True)
    pduC = models.ForeignKey('inventory.PDU', related_name="%(class)s_pduC", null=True, blank=True)
    pduD = models.ForeignKey('inventory.PDU', related_name="%(class)s_pduD", null=True, blank=True)
    co2_value = models.FloatField(default=0.0)
    note = models.TextField(null=True, blank=True)

    class Meta:
        abstract = True


class PDUDetailMixin(models.Model):
    alias_name = models.CharField(max_length=255, null=True, blank=True)
    dns_name = models.CharField(max_length=255, null=True, blank=True)
    environment = models.CharField(max_length=255, null=True, blank=True)
    os_name = models.CharField(max_length=255, null=True, blank=True)
    os_type = models.CharField(max_length=255, null=True, blank=True)
    discovery_method = models.CharField(max_length=255, null=True, blank=True)
    first_discovered = models.DateTimeField(null=True, blank=True)
    last_discovered = models.DateTimeField(null=True, blank=True)
    last_rebooted = models.DateTimeField(null=True, blank=True)
    number_of_ports = models.IntegerField(null=True, blank=True)
    last_updated = models.DateTimeField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    system_object_oid = models.CharField(max_length=100, null=True)

    class Meta:
        abstract = True


class PortMapMixin(models.Model):
    PORT_TYPES = (
        ('STANDARD', 'STANDARD'),
        ('UPLINK', 'UPLINK'),
        ('MIXED', 'MIXED'),
    )
    port_type = models.CharField(max_length=32, choices=PORT_TYPES, default=PORT_TYPES[0][0])
    physical_port_number = models.IntegerField()
    interface_name = models.CharField(max_length=64, null=True)

    class Meta:
        abstract = True


class ServerMixin(models.Model):
    name = models.CharField(max_length=128, verbose_name='Name')
    description = models.CharField(max_length=256, null=True)
    manufacturer = models.ForeignKey('inventory.ServerManufacturer', null=True)
    serial_number = models.CharField(max_length=128, null=True)
    last_known_state = models.CharField(max_length=128, null=True)
    last_checked = models.DateTimeField(null=True, )
    model = models.ForeignKey('inventory.ServerModel', null=True)
    management_ip = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        abstract = True


class ComputeMixin(models.Model):
    """
    Shared attributes between Server and VirtualMachine
    """
    alias = models.CharField(max_length=128, null=True)
    num_cpus = models.IntegerField(null=True)
    num_cores = models.IntegerField(null=True)
    memory_mb = models.BigIntegerField(null=True)
    capacity_gb = models.BigIntegerField(null=True)

    class Meta:
        abstract = True


class PrivateCloudComponentMixin(models.Model):
    private_cloud = models.ForeignKey('CloudService.PrivateCloud', null=True)

    class Meta:
        abstract = True


class CabinetMixin(models.Model):
    cabinet = models.ForeignKey('datacenter.Cabinet', null=True, on_delete=models.SET_NULL)
    position = models.PositiveSmallIntegerField(default=0)
    size = models.PositiveSmallIntegerField(default=1, validators=[MaxValueValidator(20)])

    class Meta:
        abstract = True


class ProxyMixin(models.Model, ProxyManagementMixin):
    device = GenericRelation('proxy.ReverseProxyCommon', object_id_field='device_id')

    class Meta:
        abstract = True


class PositionSizeProxyMixin(models.Model):
    """
        Cabinet Visualization - drag and drop
    """
    position = models.PositiveSmallIntegerField(default=0)
    size = models.PositiveSmallIntegerField(default=1, validators=[MaxValueValidator(20)])
    device = GenericRelation('proxy.ReverseProxyCommon',
                             object_id_field='device_id')  # Generic Relationship with Proxy common table

    @property
    def name(self):
        if self.name:
            return self.name
        else:
            return self.hostname

    class Meta:
        abstract = True


class SNMPDeviceMixin(models.Model):
    VERSIONS = (
        ('v1', 'v1'),
        ('v2c', 'v2c'),
        ('v3', 'v3'),
    )

    AUTH_LEVELS = (
        ('noAuthNoPriv', 'noAuthNoPriv'),
        ('authNoPriv', 'authNoPriv'),
        ('authPriv', 'authPriv'),
    )

    AUTH_ALGOS = (
        ('MD5', 'MD5'),
        ('SHA1', 'SHA1'),
        ('SHA224', 'SHA224'),
        ('SHA256', 'SHA256'),
        ('SHA384', 'SHA384'),
        ('SHA512', 'SHA512'),
    )

    CRYPTO_ALGOS = (
        ('DES', 'DES'),
        ('AES128', 'AES128'),
        ('AES192', 'AES192'),
        ('AES256', 'AES256'),
        ('AES192C', 'AES192C'),
        ('AES256C', 'AES256C'),
    )

    CONNECTION_TYPES = (
        ('SNMP', 'SNMP'),
        ('Agent', 'Agent'),
        ('HTTP', 'HTTP'),
        ('API', 'API')
    )

    connection_type = models.CharField(max_length=50, choices=CONNECTION_TYPES, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    snmp_version = models.CharField(max_length=16, null=True, choices=VERSIONS, default='v2c')
    snmp_community = EncryptedPasswordField(null=True)
    snmp_authlevel = models.CharField(max_length=32, choices=AUTH_LEVELS, null=True, blank=True)
    snmp_authname = models.CharField(max_length=256, null=True, blank=True)
    snmp_authpass = EncryptedPasswordField(null=True)
    snmp_authalgo = models.CharField(max_length=16, choices=AUTH_ALGOS, null=True, blank=True)
    snmp_cryptopass = EncryptedPasswordField(null=True)
    snmp_cryptoalgo = models.CharField(max_length=16, choices=CRYPTO_ALGOS, null=True, blank=True)
    mtp_templates = ArrayField(models.IntegerField(), blank=True, null=True)

    class Meta:
        abstract = True

    def clear_snmp_fields(self):
        self.snmp_version = ''
        self.snmp_community = None
        self.snmp_authlevel = None
        self.snmp_authname = None
        self.snmp_authpass = None
        self.snmp_authalgo = None
        self.snmp_cryptopass = None
        self.snmp_cryptoalgo = None
        self.mtp_templates = None


class TagMixin(models.Model):
    """
    Mixin for all devices that can have associated tags.

    Provides 'tags' for device "classes", such as Switches, Load balancers etc.
    """
    tags = models.ManyToManyField('inventory.Tag', blank=True, related_name="%(class)s_tags")

    def get_tag_names(self):
        return list(self.tags.values_list('tag_name', flat=True))

    class Meta:
        abstract = True


class WatchMethodsMixin(object):
    @property
    def watch(self):
        related_name = self.WATCH_RELATED_NAME
        if not related_name:
            raise Exception('Related name not defined in model')
        if not hasattr(self, related_name):
            field = self._meta.get_field(related_name)
            watch_model = field.related_model
            reverse_field_name = field.remote_field.name
            watch_obj, created = watch_model.objects.get_or_create(**{reverse_field_name: self})
            setattr(self, related_name, watch_obj)
        return getattr(self, related_name)


class MonitoringMethodsMixin(models.Model, WatchMethodsMixin):
    """
    Mixin to contain all the monitoring methods used by the Device models
    """
    # CONNECTION_TYPES = (
    #     ('SNMP', 'SNMP'),
    #     ('Agent', 'Agent'),
    # )
    # connection_type = models.CharField(max_length=50, choices=CONNECTION_TYPES, null=True, blank=True)

    # allert notification config
    alerts_notification_enabled = models.BooleanField(default=True)
    notify_alerts_to = ArrayField(models.IntegerField(), blank=True, default=list)  # hold list of user ids

    class Meta:
        abstract = True

    def get_email_list_to_notify(self, org):
        emails = org.users.active().filter(id__in=self.notify_alerts_to).values_list('email', flat=True)
        return list(set(emails))

    def get_sms_list_to_notify(self, org):
        sms = org.users.active().filter(id__in=self.notify_alerts_to).values_list('phone_number', flat=True)
        return list(set(sms))

    @property
    def zabbix(self):
        try:
            return self._zabbix.all()[0]
        except Exception:
            return None

    @property
    def observium(self):
        try:
            if self.DEVICE_TYPE == 'vm':
                return getattr(self, Device.observium_model_map.get(self.DEVICE_TYPE).get(self.PLATFORM_TYPE))
            return getattr(self, Device.observium_model_map.get(self.DEVICE_TYPE))
        except Exception as e:
            return None

    @property
    def monitor_by(self):
        customer = self.get_customer()
        if self.DEVICE_TYPE == Device.hypervisor:
            if hasattr(self, 'bm_server'):
                return getattr(customer.monitoring_config, self.bm_server.DEVICE_TYPE)
        return getattr(customer.monitoring_config, self.DEVICE_TYPE)

    @property
    def monitor(self):
        if self.zabbix:
            return self.zabbix
        elif self.observium:
            return self.observium
        else:
            return None

    @property
    def vm_stats(self):
        monitor_by = self.monitor_by
        if monitor_by.get('zabbix') and self.zabbix:
            response = {}
            cpu_usage = self.zabbix.cpu_usage()
            memory_usage = self.zabbix.memory_usage()
            if cpu_usage:
                response['cpu'] = cpu_usage
            if memory_usage:
                response['memory'] = memory_usage
            return response
        elif monitor_by.get('observium') and self.observium:
            return self.observium.vm_stats
        else:
            return {}

    def get_customer(self):
        if hasattr(self, 'customer'):
            return self.customer

        customers = self.customers.all()
        # TODO: Using the first customer for shared devices
        # Needs to be fixed in the future
        if len(customers) >= 1:
            return customers[0]
        else:
            raise BadRequestError(detail='Invalid request for shared device')

    def update_monitoring_log_entry(self, action, message):
        from libraries.auditlog.models import LogEntry
        if action:
            log_action = getattr(LogEntry.Action, action)
        else:
            message = 'N/A'

        changes = {message: ['Success']}

        le = LogEntry.objects.log_create(
            self,
            action=log_action,
            changes=json.dumps(changes),
        )

    def save_obj_only(self, data):
        """
        This method will update the current obj with the
        snmp details provided in the request data and save it.
        """
        self.connection_type = data.get('connection_type')
        if self.connection_type != 'API':
            self.ip_address = data.get('ip_address')
        self.snmp_community = data.get('snmp_community')
        self.snmp_version = data.get('snmp_version')
        self.snmp_authlevel = data.get('snmp_authlevel')
        self.snmp_authname = data.get('snmp_authname')
        self.snmp_authpass = data.get('snmp_authpass')
        self.snmp_authalgo = data.get('snmp_authalgo')
        self.snmp_cryptopass = data.get('snmp_cryptopass')
        self.snmp_cryptoalgo = data.get('snmp_cryptoalgo')
        if self.DEVICE_TYPE == Device.hypervisor:
            if hasattr(self, 'bm_server'):
                # If the request data has bmc_type field
                if data.get('bmc_type'):
                    self.bm_server.bmc_type = data.get('bmc_type')
                    self.bm_server.save()
                    self.bm_server.save_controller(
                        bmc_type=data.get('bmc_type'),
                        version=data.get('version'),
                        ip=data.get('ip'),
                        username=data.get('username'),
                        password=data.get('password'),
                        proxy_url=data.get('proxy_url')
                    )
        self.save()
        return True

    def activate(self, data):
        customer = self.get_customer()
        monitor_by = self.monitor_by
        template_ids = data.get('mtp_templates', None)

        if self.DEVICE_TYPE == Device.hypervisor:
            if hasattr(self, 'bm_server'):
                zabbix_object = self._bm_server_zabbix
            else:
                zabbix_object = self._server_zabbix
        elif self.DEVICE_TYPE == Device.vm:
            if hasattr(self, 'esxi'):
                zabbix_object = self._esxi_zabbix
            else:
                zabbix_object = self._zabbix
        else:
            zabbix_object = self._zabbix

        if monitor_by.get('zabbix'):
            if self.zabbix:
                if template_ids:
                    self.zabbix.save(template_ids=template_ids)
                    return True
                self.zabbix.save()
                return True
            else:
                try:
                    zabbix_customer_proxy = customer.zabbixcustomer.proxies.get(collector=self.collector)
                except ObjectDoesNotExist:
                    raise BadRequestError(
                        "Collector monitoring configuration is incomplete, contact admin!!"
                    )
                try:
                    zab_obj = zabbix_object.model(
                        # zabbix_customer=customer.zabbixcustomer,
                        zabbix_customer_proxy=zabbix_customer_proxy,
                        device_object=self
                    )
                    if template_ids:
                        zab_obj.save(template_ids=template_ids)
                        return True
                    zab_obj.save()

                except IntegrityError as e:
                    raise BadRequestError(
                        "Monitoring configuration already exists for this device"
                    )
                return True
        elif monitor_by.get('observium'):
            configure_observium_monitoring = self.configure_observium_monitoring()
            if configure_observium_monitoring:
                return True
            return False

    def configure_monitoring(self, data):
        self.save_obj_only(data)
        return self.activate(data)

    def auto_configure_monitoring(self):
        pass

    def stop_monitoring(self):
        monitor_by = self.monitor_by
        if monitor_by.get('zabbix') and self.zabbix:
            is_stoped = self.zabbix.disable()
            for component in self.get_related_components():
                component.stop_monitoring()
            return is_stoped
        elif monitor_by.get('observium'):
            return self.disable_observium_monitoring()
        else:
            return None

    def start_monitoring(self):
        monitor_by = self.monitor_by
        if monitor_by.get('zabbix') and self.zabbix:
            is_started = self.zabbix.enable()
            for component in self.get_related_components():
                component.start_monitoring()
            return is_started
        elif monitor_by.get('observium'):
            return self.enable_observium_monitoring()
        else:
            return None

    def delete_monitoring(self):
        monitor_by = self.monitor_by
        del_item = None
        if monitor_by.get('zabbix') and self.zabbix:
            del_item = self.zabbix.delete()
            for component in self.get_related_components():
                    component.delete_monitoring()

        elif monitor_by.get('observium'):
            del_item = self.delete_observium_monitoring()

        self.clear_snmp_fields()
        self.connection_type = None
        self.save()

        if not del_item:
            return False
        return True

    def enable_snmptrap(self):
        monitor_by = self.monitor_by
        if monitor_by.get('zabbix'):
            if self.zabbix:
                return self.zabbix.enable_snmptrap()

    def get_related_components(self):
        return []

    def enable_snmptrap(self):
        monitor_by = self.monitor_by
        if monitor_by.get('zabbix'):
            if self.zabbix:
                self.zabbix.enable_snmptrap()
                for component in self.get_related_components():
                    if not component.zabbix:
                        component.auto_configure_monitoring()
                    component.enable_snmptrap()

    def disable_snmptrap(self):
        monitor_by = self.monitor_by
        if monitor_by.get('zabbix'):
            if self.zabbix:
                self.zabbix.disable_snmptrap()
                for component in self.get_related_components():
                    if component.zabbix:
                        component.disable_snmptrap()

    def running_status(self):
        monitor_by = self.monitor_by
        if monitor_by.get('zabbix') and self.zabbix:
            status = self.zabbix.running_status()
            if self.DEVICE_TYPE == Device.storage and self.is_cluster:
                if status == "ok":
                    status = "1"
                elif status == "":
                    status = "-1"
            elif status is None:
                status = '-1'
            else:
                status = str(status)
            return status
        elif monitor_by.get('observium') and self.observium:
            status = self.observium.observium_status()
            if status is not None:
                status = str(status)
            return status

    def get_uptime(self):
        monitor_by = self.monitor_by
        if monitor_by.get('zabbix') and self.zabbix:
            return self.zabbix.get_uptime()
        elif monitor_by.get('observium') and self.observium:
            return self.observium.uptime_status
        else:
            return None

    def sensor_data(self):
        monitor_by = self.monitor_by
        if monitor_by.get('zabbix') and self.zabbix:
            temperature_response = self.zabbix.temperature_data()
            temperature_response = self.format_zabbix_sensor_response(temperature_response, key='temperature')

            power_response = self.zabbix.power_data()
            power_response = self.format_zabbix_sensor_response(power_response, key='power')

            zabbix_response = temperature_response.copy()
            zabbix_response.update(power_response)

            return zabbix_response
        elif monitor_by.get('observium') and self.observium:
            return self.observium.sensor_data()
        else:
            return None

    def temperature_data(self):
        monitor_by = self.monitor_by
        if monitor_by.get('zabbix') and self.zabbix:
            temperature_response = self.zabbix.temperature_data()
            if temperature_response:
                temperature_response = self.format_zabbix_sensor_response(temperature_response, key='temperature')
                return temperature_response.get('temperature', [])
        elif monitor_by.get('observium') and self.observium:
            sensor_data = self.observium.sensor_data()
            if sensor_data:
                return sensor_data.get('temperature', [])
        else:
            return None

    def power_data(self):
        monitor_by = self.monitor_by
        if monitor_by.get('zabbix') and self.zabbix:
            power_response = self.zabbix.power_data()
            if power_response:
                power_response = self.format_zabbix_sensor_response(power_response, key='power')
                return power_response.get('power', [])
        elif monitor_by.get('observium') and self.observium:
            sensor_data = self.observium.sensor_data()
            if sensor_data:
                return sensor_data.get('power', [])
        else:
            return None

    def get_power_history(self, start=None, end=None):
        monitor_by = self.monitor_by
        if monitor_by.get('zabbix') and self.zabbix:
            return self.zabbix.get_power_history(start=start, end=end)

    def get_uptime_history(self, start=None, end=None):
        monitor_by = self.monitor_by
        if monitor_by.get('zabbix') and self.zabbix:
            return self.zabbix.get_uptime_history(start=start, end=end)

    def power_in_kw(self):
        power_value = 0.0
        power_data = self.power_data()
        if power_data:
            for data in power_data:
                for item in data.itervalues():
                    if item.get('sensor_unit').lower() == 'kw':
                        power_value += value_to_float(item.get('sensor_value', 0.0)) * 1000
                    if item.get('sensor_unit').lower() == 'w':
                        power_value += value_to_float(item.get('sensor_value', 0.0))
            power_value = power_value / 1000.0
        return power_value

    def monitoring_alerts(self, alert_type=None):
        monitor_by = self.monitor_by
        if monitor_by.get('zabbix') and self.zabbix:
            return self.zabbix.get_alerts()
        elif monitor_by.get('observium') and self.observium:
            alerts = self.observium.get_alerts(alert_type=alert_type)
            return alerts
        else:
            return None

    def get_device_cloud(self, device_type):
        """
        Return the cloud name(s) that each device belongs to

        Args:
            self: Instance of the class.
            device_type: Device type as saved in the
            ZabbixCustomerAlerts table.

        Returns:
            list of cloud name(s). If none exist, returns
            an empty list.
        """
        if device_type in ('switch', 'firewall', 'load_balancer'):
            clouds = self.cloud_set.all()
            if clouds:
                return [cloud.name for cloud in clouds]

        if (device_type in
           ('hypervisor', 'bm_server', 'storage_device', 'mac_device')):
            if self.private_cloud:
                return [self.private_cloud.name]

        if device_type == 'vm':
            if (self.PLATFORM_TYPE in
               (Device.vmware, Device.vcloud, Device.open_stack)):
                if self.cloud:
                    return [self.cloud.name]
            elif self.PLATFORM_TYPE == Device.hyperv:
                if self.cluster.private_cloud:
                    return [self.cluster.private_cloud.name]
            elif self.PLATFORM_TYPE == Device.customvm:
                if self.private_cloud:
                    return [self.private_cloud.name]

        return []

    def delete(self, *args, **kwargs):
        self.delete_monitoring()
        return super(MonitoringMethodsMixin, self).delete(*args, **kwargs)

    @classmethod
    def get_customer_alerts(cls, customer):
        monitor_by = getattr(customer.monitoring_config, cls.DEVICE_TYPE)
        platform_type = cls.PLATFORM_TYPE if hasattr(cls, 'PLATFORM_TYPE') else None
        if monitor_by.get('zabbix'):
            zabbix_customer = customer.zabbixcustomer
            return zabbix_customer.get_alerts(device_type=cls.DEVICE_TYPE, platform_type=platform_type)
        elif monitor_by.get('observium'):
            observium_model = Device.get_observium_device_model(device_type=cls.DEVICE_TYPE, platform_type=platform_type)
            return observium_model.get_customer_alerts(customer=customer, alert_type='failed')

    @staticmethod
    def format_zabbix_sensor_response(response_data, key=None):
        formatted_data = {key: []}
        if response_data:
            for item in response_data:
                item_data = {}
                name = item.get('name')
                item_data[name] = {}
                item_data[name] = {
                    "sensor_unit": item.get('units'),
                    "graph": None,
                    "sensor_value": item.get('lastvalue'),
                    "row_class": None,
                }
                if key:
                    formatted_data[key].append(item_data)
        return formatted_data


class MonitorableFieldsMixin(models.Model):
    '''
    temporary mix, later it should be merged with MonitoringMethodsMixin
    '''
    m_co2_emission_value = models.FloatField(null=True, blank=True)
    m_status = models.IntegerField(null=True, blank=True)

    @property
    def co2_emission_value(self):
        return self.m_co2_emission_value or 0.00

    @property
    def status(self):
        return str(self.m_status) if self.m_status else self.m_status

    def get_co2_emission_value(self):
        from cloud.CloudService.models import CO2Matrix
        co2_per_kwh = 0.0
        power_value = 0.0
        result = 0
        if hasattr(self.cabinet, 'colocloud_set'):
            colo_cloud = self.cabinet.colocloud_set.first()
            if colo_cloud:
                for co2_matrix in CO2Matrix.objects.all():
                    if re.search(co2_matrix.location, colo_cloud.location):
                        co2_per_kwh = co2_matrix.co2_emission_value
        if co2_per_kwh:
            sensor_data = self.sensor_data()
            if sensor_data and sensor_data.get('power'):
                for sensor in sensor_data.get('power'):
                    for data in sensor.values():
                        if data.get('sensor_unit').lower() == 'kw':

                            power_value += value_to_float(data.get('sensor_value', 0.0)) * 1000
                        else:
                            power_value += value_to_float(data.get('sensor_value', 0.0))

            power_in_kw = power_value / 1000.0
            result = (power_in_kw * 8760 * co2_per_kwh) / 1000
        self.m_co2_emission_value = result
        self.save()
        return result

    def running_status(self):
        status = super(MonitorableFieldsMixin, self).running_status()
        self.m_status = status
        self.save()
        return status

    class Meta:
        abstract = True


class MacDetailMixin(models.Model):
    dns_name = models.CharField(max_length=255, null=True, blank=True)
    environment = models.CharField(max_length=255, null=True, blank=True)
    discovery_method = models.CharField(max_length=255, null=True, blank=True)
    first_discovered = models.DateTimeField(null=True, blank=True)
    last_discovered = models.DateTimeField(null=True, blank=True)
    last_rebooted = models.DateTimeField(null=True, blank=True)
    description = models.CharField(max_length=255, null=True)
    last_updated = models.DateTimeField(null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    system_object_oid = models.CharField(max_length=100, null=True)

    class Meta:
        abstract = True


class SmartPDUDetailMixin(models.Model):
    dns_name = models.CharField(max_length=256, blank=True, null=True)
    environment = models.CharField(max_length=256, blank=True, null=True)
    discovery_method = models.CharField(max_length=256, blank=True, null=True)
    first_discovered = models.DateTimeField(blank=True, null=True)
    last_discovered = models.DateTimeField(blank=True, null=True)
    last_rebooted = models.DateTimeField(blank=True, null=True)
    description = models.CharField(max_length=256, blank=True, null=True)
    last_updated = models.DateTimeField(blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    os_name = models.CharField(max_length=256, blank=True, null=True, db_index=True)
    fan = models.IntegerField(default=0)
    mac_address = models.CharField(max_length=256, blank=True, null=True)

    class Meta:
        abstract = True


class SensorDetailMixin(models.Model):
    discovery_method = models.CharField(max_length=256, blank=True, null=True)
    first_discovered = models.DateTimeField(blank=True, null=True)
    last_discovered = models.DateTimeField(blank=True, null=True)
    last_rebooted = models.DateTimeField(blank=True, null=True)
    description = models.CharField(max_length=256, blank=True, null=True)
    last_updated = models.DateTimeField(blank=True, null=True)
    note = models.TextField(blank=True, null=True)

    class Meta:
        abstract = True


class NetworkDeviceConfigurationMixin(models.Model):
    ncm_credentials = models.ForeignKey('unity_discovery.DiscoveryCredential', blank=True, null=True, on_delete=models.SET_NULL, related_name='%(class)ss')
    credentials_m2m = models.ManyToManyField(
        'unity_discovery.DiscoveryCredential',
        blank=True,
        related_name='%(class)s_credentials'
    )
    credentials_type = models.CharField(max_length=128, null=True, blank=True)
    config_device_type = models.CharField(max_length=128, blank=True, null=True)
    config_file_type = models.CharField(max_length=128, blank=True, null=True)
    enable_mode_password = EncryptedPasswordField(null=True)
    default_encryption_password = EncryptedPasswordField(null=True)  # Default password for file encryption (Currently for Fortinet only)
    is_ncm_enabled = models.BooleanField(default=False)
    is_in_progress = models.BooleanField(default=False)

    class Meta:
        abstract = True

    def delete_configuration(self):
        self.config_device_type = None
        self.config_file_type = None
        self.default_encryption_password = None
        self.ncm_credentials = None
        self.enable_mode_password = None
        self.is_ncm_enabled = False
        self.is_in_progress = False
        self.save()


class DeviceCredentialsMixin(models.Model):
    credentials = models.ForeignKey('unity_discovery.DiscoveryCredential', null=True, blank=True, on_delete=models.SET_NULL, related_name='%(class)ss')
    credentials_m2m = models.ManyToManyField(
        'unity_discovery.DiscoveryCredential',
        blank=True,
        related_name='%(class)s_credentials'
    )
    credentials_type = models.CharField(max_length=128, null=True, blank=True)

    class Meta:
        abstract = True


class CustomAttributeMixin(models.Model):
    custom_attribute_data = JSONField(null=True)

    class Meta:
        abstract = True


class DeviceCTIMixin(object):
    DEVICE_CTI_CATEGORY = None
    DEVICE_CTI_ITEM = None
    DEVICE_CTI_TYPE = None
    COMPANY = None


class ContentTypeMixin(models.Model):
    """
        Mixin that provides a cached content type ID for the model.
    """

    class Meta:
        abstract = True

    @classmethod
    @lru_cache(maxsize=1)
    def get_content_type(cls):
        return ContentType.objects.get_for_model(cls)


class SoftDeleteMixin(models.Model):
    is_deleted = models.BooleanField(default=False)

    all_objects = AllObjectsManager()      # include deleted

    class Meta:
        abstract = True

    # soft delete
    def delete(self, using=None, keep_parents=False):
        self.is_deleted = True
        self.save(update_fields=["is_deleted"])

class LifeCycleStageMixin(models.Model):
    LIFE_CYCLE_STAGE_CHOICES = (
        ('Defective', 'Defective'),
        ('Deploy', 'Deploy'),
        ('End of Life', 'End of Life'),
        ('End of Operation', 'End of Operation'),
        ('Inventory', 'Inventory'),
        ('Missing', 'Missing'),
        ('Operational', 'Operational'),
        ('Purchase', 'Purchase'),
        
    )
    
    life_cycle_stage = models.CharField(max_length=50,
        choices=LIFE_CYCLE_STAGE_CHOICES,
        blank=True,
        null=True)

    class Meta:
        abstract = True

class LifeCycleStageStatusMixin(models.Model):
    LIFE_CYCLE_STAGE_STATUS_CHOICES = (
        ('Buy Out', 'Buy Out'),
        ('Disposed', 'Disposed'),
        ('Donated', 'Donated'),
        ('In Transit', 'In Transit'),
        ('Lease Return', 'Lease Return'),
        ('Pending Certificate', 'Pending Certificate'),
        ('Pending Disposal', 'Pending Disposal'),
        ('Retired', 'Retired'),
        ('RMA', 'RMA'),
        ('Sold', 'Sold'),
        ('Vendor Credit', 'Vendor Credit'),
        ('In Stock', 'In Stock'),
        ('Pending Transfer', 'Pending Transfer'),
        ('Reserved', 'Reserved'),
        ('Test', 'Test'),
        ("In Use","In Use"),
        ("Pending Retirement","Pending Retirement")
    )
    life_cycle_stage_status = models.CharField(max_length=50,
        choices=LIFE_CYCLE_STAGE_STATUS_CHOICES,
        blank=True,
        null=True)

    class Meta:
        abstract = True