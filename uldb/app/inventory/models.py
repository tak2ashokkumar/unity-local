# -*- coding: utf-8 -*-
"""
    models.py

    Copyright (C) 2016 UnitedLayer, LLC.
    All Rights Reserved.

"""
from __future__ import unicode_literals

import logging
import json
import re
import itertools
import paramiko
import socket
from paramiko.ssh_exception import AuthenticationException, SSHException
from getpass import getpass
import requests
from requests.auth import HTTPBasicAuth
import StringIO
from django.contrib.sites.models import Site
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import connection, IntegrityError, models
from django.db.models import Q
from django.db.models.signals import post_save, post_delete, pre_delete
from django.dispatch import receiver
from django.template.defaultfilters import slugify
from django.conf import settings
from django.urls import reverse as django_reverse
from paramiko.transport import Transport
Transport._preferred_kex = settings.SSH_KEX_ALGORITHMS + Transport._preferred_kex  # Updating KEX Algo
import time
from app.common.func import _fix_salesforce
from app.common.models import *
from app.common.managers import MaterializedViewManager
from app.rbac.utils import RBACModelManager
from app.Utils.utility import random_serial_number, generate_uuid
from integ.salesforce.models import SalesforceMixin, NonstrictSalesforceMixin
from app.common.fields import EncryptedPasswordField
from app.common.utils import Device, value_to_float, SSHManager
from agent.models import AgentConfig
from integ.zabbix.zabbix_backend_models import ZabbixHosts
from rest.core.exceptions import MonitoringNotConfigured, BadRequestError

from integ.ipmi.ipmi import ipmitool
from django.contrib.postgres.fields import ArrayField, JSONField

from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.fields import GenericRelation

from .mixins import (
    AssetMixin, AssetClassMixin, MonitorableFieldsMixin, MonitoringMethodsMixin,
    MotherboardComponent, NetworkingDeviceClassMixin,
    ObserviumMonitoringEnablerMixin, NetworkingDeviceMixin, PortMapMixin,
    ServerMixin, ComputeMixin, PositionSizeProxyMixin,
    ProxyManagementMixin, CabinetMixin, ProxyMixin,
    SNMPDeviceMixin, TagMixin, WatchMethodsMixin, NetworkDetailMixin,
    ServerDetailMixin, PDUDetailMixin, StorageDetailMixin, MacDetailMixin,
    VMDetailMixin, DeviceCredentialsMixin, DeviceCTIMixin, SmartPDUDetailMixin,
    SensorDetailMixin, ContentTypeMixin, LifeCycleStageMixin, LifeCycleStageStatusMixin
)
from app.inventory.managers import (
    ServerDeviceManager,
    ManufactureModelBaseManager,
    OperatingSystemManager,
    SwitchManager,
    FirewallManager,
    LoadBalancerManager,
    PDUManager,
    CustomDeviceManager,
    StorageDeviceManager,
    SmartPDUManager,
    SensorManager,
    DeviceCommonBaseManager
)
from integ.UptimeRobot.api import UptimeRobotAPI
from integ.ObserviumBackend.api import ObserviumAPI
from uldb.settings import UPTIME_ROBOT_API_KEY
from integ.netapp.ontap.api import OnTapApiManager
from integ.netapp.ontap.models import Node, Aggregate, SVM, Volume, LUN, Snapmirror, ClusterPeer, FC, Ethernet
from integ.netapp.ontap.models import Cluster as OntapCluster
from integ.netapp.ontap.models import Disk as OntapDisk
from integ.netapp.ontap.utils import aggr_model_total
from integ.purestorage.models import PureStorageArray, PureStorageHost, PureStorageHostGroup, PureStorageVolume, PureStorageSnapShot
from synchronize.mixins import JobScheduleModelMixin, JobScheduleNotifyMixin
from synchronize.models import SyncMixin, JobSchedule, IntervalSchedule, PeriodicTask
from mixins import DeviceCollectorMixin, NetworkDeviceConfigurationMixin, CustomAttributeMixin, SoftDeleteMixin
from integ.redfish.mixins import RedFishModelMixin
import configparser
from rest.customer.cmdb_mixin import CMDBManager
from integ.BmcHelix.BMCHelixMixin import BMCNetworkMixin, BMCBMServerMixin
from topology.models import AdvancedNeighborInformation


logger = logging.getLogger(__name__)  # logger from settings.py


class InterfaceStatus:
    inactive = 0
    active = 1
    CHOICES = (
        (active, 'Active'),
        (inactive, 'Inactive'),
    )
    CHOICES_BY_NAME = {v: k for k, v in CHOICES}
    CHOICES_BY_VALUE = {k: v for k, v in CHOICES}

    @classmethod
    def get_value_by_name(cls, name):
        return cls.CHOICES_BY_NAME.get(name)

    @classmethod
    def get_name_by_value(cls, value):
        return cls.CHOICES_BY_VALUE.get(value)


class Interface(models.Model):
    """
        Model to save ports/interfaces of other devices like switches / routers
    """
    uuid = models.UUIDField(null=True, blank=True, verbose_name='UUID', default=generate_uuid)
    name = models.CharField(max_length=128, null=True, blank=True)
    interface_index = models.PositiveIntegerField(null=False, blank=False)
    description = models.CharField(max_length=512, null=True, blank=True)
    mac_address = models.CharField(max_length=64, null=True, blank=True)
    status = models.PositiveIntegerField(choices=InterfaceStatus.CHOICES, default=InterfaceStatus.inactive)
    content_type = models.ForeignKey(ContentType, on_delete=models.DO_NOTHING, related_name='interfaces')
    device_id = models.PositiveIntegerField(null=False, blank=False)
    device = GenericForeignKey('content_type', 'device_id')

    def __str__(self):
        return u'%s' % self.name if self.name else u'%s' % self.interface_index


class DeviceModelBase(models.Model):
    power_consumption = models.IntegerField(null=True, blank=False)
    end_of_life = models.DateTimeField(null=True, blank=True)
    end_of_service = models.DateTimeField(null=True, blank=True) # or end_of_support
    end_of_extended_support = models.DateTimeField(null=True, blank=True)
    end_of_security_support = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True


class ServerManufacturer(InventoryModel):
    """
    A company that offers assembled servers as products, such as SuperMicro.
    """
    name = models.CharField(max_length=128, unique=True)
    objects = ManufactureModelBaseManager()

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        verbose_name = 'Server Manufacturer'
        permissions = (('view', 'Can view system manufacturer'),)


class ServerModel(InventoryModel, DeviceModelBase):
    name = models.CharField(max_length=128, unique=True)
    manufacturer = models.ForeignKey(ServerManufacturer, null=True, on_delete=models.SET_NULL)

    objects = ManufactureModelBaseManager()


class StorageManufacturer(InventoryModel):
    """
    A company that offers assembled Storage as products, such as Nimble.
    """
    name = models.CharField(max_length=128, unique=True)

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        verbose_name = 'Storage Manufacturer'
        permissions = (('view', 'Can view storage manufacturer'),)


class StorageModel(InventoryModel, DeviceModelBase):
    name = models.CharField(max_length=128, unique=True)
    manufacturer = models.ForeignKey(StorageManufacturer, null=True, on_delete=models.SET_NULL)


class PDUManufacturer(InventoryModel):
    """
    A company that offers assembled Storage as products, such as Nimble.
    """
    name = models.CharField(max_length=128, unique=True)

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        verbose_name = 'PDU Manufacturer'
        permissions = (('view', 'Can view pdu manufacturer'),)


class DatabaseType(InventoryModel):
    name = models.CharField(max_length=128, unique=True)


class Manufacturer(InventoryModel):
    """
    A company that offers any server component or computer networking device as a product.
    """
    name = models.CharField(max_length=128, unique=True)

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        verbose_name = 'Server Manufacturer'
        permissions = (('view', 'Can view manufacturer'),)


class MotherboardModel(InventoryModel):
    """
    A motherboard model, such as a X8DTU-F.
    """
    name = models.CharField(max_length=128, unique=True)
    num_cpu_sockets = models.IntegerField(null=True)
    num_dimm_slots = models.IntegerField(null=True)
    max_memory_capacity_gb = models.IntegerField(null=True)
    num_sata_ports = models.IntegerField(null=True)
    num_sas_ports = models.IntegerField(null=True)
    num_nic_ports = models.IntegerField(default=0)
    has_onboard_ipmi = models.BooleanField(default=False)

    disk_controller = models.ManyToManyField('DiskControllers')
    cpu_socket_type = models.ForeignKey('CPUSocketType', null=True, on_delete=models.SET_NULL)
    ipmi_controller = models.ForeignKey('IPMITypes', null=True, on_delete=models.SET_NULL)
    nic_model = models.ForeignKey('NICTypes', null=True, on_delete=models.SET_NULL)
    manufacturer = models.ForeignKey(Manufacturer, null=True, on_delete=models.SET_NULL)

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        verbose_name = 'Motherboard model'
        permissions = (('view', 'Can view motherboard models'),)


class Motherboard(InventoryModel, AssetMixin):
    """
    A physical motherboard (instantiation) with a model class as defined above.
    """
    serial_number = models.CharField(max_length=128, null=True)

    server = models.ForeignKey('inventory.Server', null=True, related_name='motherboards', on_delete=models.SET_NULL)
    model = models.ForeignKey(MotherboardModel, null=True, related_name='motherboards', on_delete=models.SET_NULL)

    def __unicode__(self):
        return u'%s' % self.asset_tag

    def __repr__(self):
        return u'%s' % self.asset_tag

    class Meta:
        verbose_name = 'Motherboard'
        permissions = (('view', 'Can view motherboard'),)

    @property
    def organization_id(self):
        return self.server.customer.id


class MemoryModel(InventoryModel, AssetClassMixin, NonstrictSalesforceMixin):
    """
    A class of memory, e.g., "Kingston DDR3-1866".

    Not an actual stick of memory.
    """
    buffered = models.BooleanField(default=True, verbose_name='Buffered')
    ddr_generation = models.CharField(max_length=32, null=True)
    ddr_clock_speed = models.IntegerField(null=True)
    ecc = models.BooleanField(default=True, verbose_name='ECC')
    memory_mb = models.BigIntegerField()
    model_name = models.CharField(max_length=255, null=True)
    name = models.CharField(max_length=255, null=True)

    manufacturer = models.ForeignKey('Manufacturer', null=True, related_name='memory', on_delete=models.SET_NULL)
    description = models.TextField(null=True)

    def __unicode__(self):
        return '%s-%s-%s-%s-%s' % (self.manufacturer,
                                   self.name,
                                   self.ddr_generation,
                                   self.ddr_clock_speed,
                                   self.memory_mb)

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        verbose_name = 'Memory types'
        unique_together = (('manufacturer', 'name'),)
        permissions = (('view', 'Can view memorytypes'),)


class Memory(InventoryModel, AssetMixin, MotherboardComponent):
    """
    A stick of memory.
    """
    serial_number = models.CharField(max_length=128, null=True)

    model = models.ForeignKey(MemoryModel, null=True, related_name='memory_sticks', on_delete=models.SET_NULL)

    def __repr__(self):
        return u'%s-%s' % (self.model.name, self.serial_number)

    class Meta:
        verbose_name = 'Memory'
        permissions = (('view', 'Can view memory'),)


class DiskController(InventoryModel):
    name = models.CharField(max_length=255, unique=True, null=True)

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        verbose_name = 'Disk Controller'


class DiskModel(InventoryModel, AssetClassMixin, NonstrictSalesforceMixin):
    """
    A class of disk objects, such as a Samsung 850 EVO or an HGST Deskstar.

    Not an actual physical object, just a product model.
    """
    FORM_FACTORS = (
        (u'3.5', u'3.5'),
        (u'2.5', u'2.5'),
        (u'M.2', u'M.2'),
        (u'mSATA', u'mSATA'),
    )
    MEDIA_TYPE = (
        (u'HDD', u'HDD'),
        (u'SSD', u'SSD'),
    )
    INTERFACE = (
        (u'SATA', u'SATA'),
        (u'SCSI', u'SCSI'),
        (u'IDE', u'IDE'),
        (u'M.2', u'M.2'),
        (u'PCI Express', u'PCI Express'),
    )

    capacity_gb = models.FloatField(null=True)
    form_factor = models.CharField(max_length=40, null=True, choices=FORM_FACTORS, default=FORM_FACTORS[0][0])
    interface = models.CharField(max_length=10, null=True, choices=INTERFACE, default=INTERFACE[0][0])
    media_type = models.CharField(max_length=45, null=True, choices=MEDIA_TYPE, default=MEDIA_TYPE[0][0])
    name = models.CharField(max_length=128)
    random_iops = models.BigIntegerField(null=True)
    seq_read_mbyte_per_sec = models.BigIntegerField(null=True)
    seq_write_mbyte_per_sec = models.BigIntegerField(null=True)
    rpm = models.IntegerField(null=True, default=7200)

    controller = models.ForeignKey(DiskController, null=True, related_name='disk_models', on_delete=models.SET_NULL)
    manufacturer = models.ForeignKey(Manufacturer, null=True, related_name='disk_models', on_delete=models.SET_NULL)

    def __unicode__(self):
        return '%s-%s' % (self.manufacturer, self.name)

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        verbose_name = 'Disk types'
        permissions = (('view', 'Can view disktypes'),)
        unique_together = (('manufacturer', 'name'),)


class DiskControllers(models.Model):
    """
    TODO: delete this
    """
    controller = models.CharField(
        max_length=128,
        unique=True,
        null=False,
        blank=False,
        verbose_name='Controller')
    ports = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        verbose_name='Ports')
    raid_support = models.CharField(
        max_length=128,
        default='RAID 0 1 5 10',
        verbose_name='RAID Support')

    def __unicode__(self):
        return '%s, %s, %s' % (self.controller, self.ports, self.raid_support)

    def __repr__(self):
        return '%s, %s, %s' % (self.controller, self.ports, self.raid_support)

    class Meta:
        verbose_name = 'Disk Controllers'
        db_table = 'diskcontrollers'
        ordering = ['controller']
        permissions = (('view', 'Can view diskcontrollertypes'),)


class RaidConfig(models.Model):
    type = models.CharField(max_length=64)
    server = models.ForeignKey('Server', on_delete=models.CASCADE)

    @property
    def virtual_size(self):
        """
        Returns the true accessible size of the raid array.

        For RAID-5, returns the sum of the size of all disks except the one with least capacity.
        """
        if self.type == "RAID-5":
            if self.disks:
                return sum([d.model.capacity_gb
                            for d
                            in sorted(self.disks.all(), key=lambda x: x.model.capacity_gb)[1:]])
            else:
                return 0

    @property
    def organization_id(self):
        return self.server.customer.id

    def __repr__(self):
        return u'%s' % self.type

    class Meta:
        verbose_name = 'Raid'


class Disk(InventoryModel, AssetMixin, MotherboardComponent):
    """
    A physical hard disk drive, SSD, or other persistent storage medium.

    asset_tag is unused in this context, but left available for future use.
    """
    model = models.ForeignKey(DiskModel, null=True)
    serial_number = models.CharField(max_length=128, null=True)
    raid_config = models.ForeignKey(
        RaidConfig,
        related_name='disks',
        null=True,
        on_delete=models.SET_NULL
    )

    def __repr__(self):
        return u'%s' % self.serial_number

    class Meta:
        verbose_name = 'Disk'
        permissions = (('view', 'Can view disk'),)


class RAIDControllers(InventoryModel):
    """
    A physical raid controller.
    """
    id = models.AutoField(primary_key=True)
    serialnumber = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        default='NOT ENTERED',
        verbose_name='Serial Number')
    assettag = models.SlugField(
        max_length=128,
        blank=True,
        null=True,
        verbose_name='AssetTag')
    controller = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        unique=True,
        verbose_name='Controller')
    ports = models.CharField(
        max_length=128,
        default='8PORT',
        verbose_name='Ports')
    raid_support = models.CharField(
        max_length=128,
        default='RAID 0 1 5 10',
        verbose_name='RAID Support')
    manufacturer = models.ForeignKey(
        'Manufacturer',
        null=True,
        blank=True,
        verbose_name='Manufacturer')
    is_allocated = models.BooleanField(default=False, verbose_name='State')

    def __unicode__(self):
        # return '%s, (%s, %s)' % (self.raid_controller_id, self.controller,
        # self.raid_support)
        return self.assettag

    def __repr__(self):
        return u'%s' % self.assettag

    class Meta:
        verbose_name = 'Raid Controller'
        db_table = 'raidcontrollers'
        ordering = ['controller']
        permissions = (('view', 'Can view raid controllers'),)

    def clean(self):
        if self.controller and not self.raid_controller_id:
            if RAIDControllers.objects.filter(
                    controller__iexact=self.controller):
                raise ValidationError(
                    {'controller': 'Controller must be in unique'})
        if self.controller and self.raid_controller_id:
            if RAIDControllers.objects.filter(
                    controller=self.controller, raid_controller_id=self.raid_controller_id):
                pass
            else:
                if RAIDControllers.objects.filter(
                        controller__iexact=self.controller):
                    raise ValidationError(
                        {'controller': 'Controller must be in unique'})
        return

    def save(self, *args, **kwargs):
        self.assettag = slugify('%s-%s-%sPORTS -%s' % ('RAID',
                                                       self.controller,
                                                       self.ports,
                                                       self.raid_support))
        if self.serialnumber == '' or self.serialnumber == 'NOT ENTERED' or self.serialnumber is None:
            self.serialnumber = random_serial_number(prefix="MISSING")
        super(RAIDControllers, self).save(*args, **kwargs)


class SASControllers(models.Model):
    """
    A physical instance of a SAS controller card.
    """
    id = models.AutoField(primary_key=True)
    sascontroller_type = models.CharField(
        max_length=128,
        default='LSI 2008 8 port SAS controller',
        unique=True,
        verbose_name='Type')
    sas_raid_support = models.CharField(
        max_length=128, verbose_name='RAID Support')

    def __unicode__(self):
        return '%s, (%s, %s)' % (self.sascontroller_id,
                                 self.sascontroller_type, self.sas_raid_support)

    def __repr__(self):
        return '%s, (%s, %s)' % (self.sascontroller_id,
                                 self.sascontroller_type, self.sas_raid_support)

    class Meta:
        verbose_name = 'Sas controllers'
        db_table = 'sascontrollers'
        ordering = ['sascontroller_type']
        permissions = (('view', 'Can view sascontrollertypes'),)

    def clean(self):
        if self.sascontroller_type and not self.sascontroller_id:
            if SASControllers.objects.filter(
                    sascontroller_type__iexact=self.sascontroller_type):
                raise ValidationError(
                    {'sascontroller_type': 'SAScontroller type must be in unique'})
        if self.sascontroller_type and self.sascontroller_id:
            if SASControllers.objects.filter(
                    sascontroller_type=self.sascontroller_type, sascontroller_id=self.sascontroller_id):
                pass
            else:
                if SASControllers.objects.filter(
                        sascontroller_type__iexact=self.sascontroller_type):
                    raise ValidationError(
                        {'sascontroller_type': 'SASController type must be in unique'})
        return


class CPUSocketType(InventoryModel):
    name = models.CharField(max_length=128, unique=True)

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        verbose_name = 'CPU Socket Type'
        permissions = (('view', 'Can view cpu socket types'),)


class CPUModel(TimestampedModel, AssetClassMixin, NonstrictSalesforceMixin):
    """
    A brand/product/offering of a CPU.
    """
    name = models.CharField(max_length=128, unique=True)
    clock_speed_mhz = models.IntegerField(null=True)
    cores = models.IntegerField(null=True)
    perf_index = models.IntegerField(null=True)
    threads_per_core = models.IntegerField(null=True)
    turbo_clock_speed_mhz = models.IntegerField(null=True)

    manufacturer = models.ForeignKey(Manufacturer, null=True, related_name='cpu_models')
    socket_type = models.ForeignKey('CPUSocketType', null=True, related_name='cpu_models')

    def __unicode__(self):
        return u'%s %s' % (self.manufacturer, self.name)

    def __repr__(self):
        return u'%s %s' % (self.manufacturer, self.name)

    class Meta:
        verbose_name = 'CPU Types'
        permissions = (('view', 'Can view cputypes'),)


class CPU(InventoryModel, AssetMixin, MotherboardComponent):
    """
    A physical instance of a CPU model.
    """
    model = models.ForeignKey(CPUModel, null=True, related_name='cpus')
    serial_number = models.CharField(max_length=128, null=True)

    def __unicode__(self):
        return 'CPU-%s' % (self.uuid)

    def __repr__(self):
        return 'CPU-%s' % (self.uuid)

    class Meta:
        verbose_name = 'CPU'
        permissions = (('view', 'Can view cpu'),)


class FirewallModel(InventoryModel, NetworkingDeviceClassMixin, DeviceModelBase):
    operating_system = models.CharField(max_length=128, null=True)

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        verbose_name = 'Firewall Types'
        permissions = (('view', 'Can view firewallmodels'),)


class Firewall(InventoryModel, NetworkingDeviceMixin, AddressableModel, AssetMixin,
               NonstrictSalesforceMixin, PositionSizeProxyMixin, ProxyManagementMixin,
               SNMPDeviceMixin, TagMixin, MonitoringMethodsMixin, NetworkDetailMixin,
               DeviceCollectorMixin, NetworkDeviceConfigurationMixin, CustomAttributeMixin,
               DeviceCTIMixin, ContentTypeMixin, BMCNetworkMixin, SoftDeleteMixin):
    DEVICE_TYPE = Device.firewall
    WATCH_RELATED_NAME = 'firewall_watch'

    model = models.ForeignKey(FirewallModel, null=True)
    is_root_device = models.BooleanField(default=False)
    service_contracts = models.ManyToManyField('billing.ServiceContract', related_name='firewalls')
    device_mapping = GenericRelation('inventory.PDUSocketMappings', object_id_field='device_id')
    datacenter = models.ForeignKey('CloudService.ColoCloud', null=True, blank=True, on_delete=models.SET_NULL)
    _zabbix = GenericRelation('zabbix.ZabbixHostFirewallMap', object_id_field='device_id', for_concrete_model=False)
    # _events = GenericRelation('aiops.Event', object_id_field='device_id')
    domain = models.CharField(max_length=255, null=True, blank=True)

    objects = FirewallManager()

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        verbose_name = 'Firewall'
        default_related_name = 'firewalls'
        permissions = (('view', 'Can view firewall'),)

    @property
    def organization_id(self):
        return self.customers.all()

    @property
    def manufacturer(self):
        return self.model.manufacturer

    @property
    def address(self):
        return self.ip_address or self.management_ip

    @property
    def org_name(self):
        return self.datacenter.customer.name

    def extract_domain(self, fqdn):
        if fqdn:
            parts = fqdn.split('.')
            if len(parts) > 1:
                return '.'.join(parts[-2:])
        return None

    def save(self, *args, **kwargs):
        fqdn = getattr(self, 'name', None)  # or getattr(self, 'dns_name', None)
        if fqdn:
            self.domain = self.extract_domain(fqdn)
            if not self.domain:
                fqdn = getattr(self, 'dns_name', None)
                if fqdn:
                    self.domain = self.extract_domain(fqdn)
        super(Firewall, self).save(*args, **kwargs)


RBACModelManager.register(Firewall, [RBACModelManager.Modules.DATACENTER])


class CustomDevice(InventoryModel, NetworkingDeviceMixin, AddressableModel, AssetMixin, NonstrictSalesforceMixin,
                   PositionSizeProxyMixin, TagMixin, MonitoringMethodsMixin, DeviceCollectorMixin,
                   CustomAttributeMixin, DeviceCTIMixin):

    DEVICE_TYPE = Device.custom
    DEVICE_CATEGORY = Device.custom_device
    WATCH_RELATED_NAME = 'custom_device_watch'
    name = models.CharField(max_length=128, null=False)
    description = models.CharField(max_length=256, null=True)
    type = models.CharField(max_length=128, null=False)
    uptime_robot_id = models.CharField(max_length=256, null=False)
    device = GenericRelation('monitoring.DashboardDevice', object_id_field='device_id')
    device_mapping = GenericRelation('inventory.PDUSocketMappings', object_id_field='device_id')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    snmp_community = EncryptedPasswordField(null=True) 
    datacenter = models.ForeignKey('CloudService.ColoCloud', null=True, blank=True, on_delete=models.SET_NULL)
    _zabbix = GenericRelation('zabbix.ZabbixHostCustomDeviceMap', object_id_field='device_id', for_concrete_model=False)
    # _events = GenericRelation('aiops.Event', object_id_field='device_id')
    is_monitoring = models.BooleanField(default=False)
    polling_interval_min = models.PositiveIntegerField(default=0)
    polling_interval_sec = models.PositiveIntegerField(default=0)
    domain = models.CharField(max_length=255, null=True, blank=True)

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    def extract_domain(self, fqdn):
        if fqdn:
            parts = fqdn.split('.')
            if len(parts) > 1:
                return '.'.join(parts[-2:])
        return None

    def save(self, *args, **kwargs):
        fqdn = getattr(self, 'name', None)  # or getattr(self, 'dns_name', None)
        if fqdn:
            self.domain = self.extract_domain(fqdn)
            if not self.domain:
                fqdn = getattr(self, 'dns_name', None)
                if fqdn:
                    self.domain = self.extract_domain(fqdn)
        super(CustomDevice, self).save(*args, **kwargs)

    class Meta:
        verbose_name = 'Other Device'
        default_related_name = 'customdevice'
        permissions = (('view', 'Can view CustomDevice'),)

    objects = CustomDeviceManager()

    @property
    def organization_id(self):
        return self.customers.all()

    @property
    def category(self):
        return 'customdevice'

    @property
    def device_uuid(self):
        return self.uuid

    def running_status(self):
        if self.zabbix:
            status = self.zabbix.running_status()
            if status is not None:
                status = str(status)
            return status

    def get_status(self):
        if self.zabbix:
            zabbix_db_ip = self.zabbix.zabbix_customer_proxy.zabbix_customer.zabbix_instance.ip_address
            host_id = self.zabbix.host_id
            try:
                status = ZabbixHosts.objects.using(zabbix_db_ip).get(host_id=host_id).status
                status = "1" if str(status) == "0" else "0"
            except Exception as e:
                status = "-1"
            watch_obj = self.watch
            if watch_obj:
                watch_obj.status = status
                watch_obj.save()
            return str(status)

    def delete_urls(self, uuids, single=True):
        if self.zabbix:
            if single:
                url_instances = URL.objects.filter(device=self)
                remove_instance = url_instances.exclude(uuid__in=uuids)
                for instance in remove_instance:
                    self.zabbix.api.delete_web_scenario(instance.name)

    def get_last_check(self):
        if self.zabbix:
            items = self.zabbix.get_items()
            filtered_keys = [entry['key'] for entry in items if entry['key'].startswith('web.test.fail')]
            clock = None
            for key in filtered_keys:
                clock = self.zabbix.api.get_last_check(key)
            return clock

    def stop_monitoring(self):
        if self.zabbix:
            return self.zabbix.disable()

    def start_monitoring(self):
        if self.zabbix:
            return self.zabbix.enable()

    def delete_monitoring(self):
        if self.zabbix:
            self.zabbix.delete()

    @property
    def uptime_status(self):
        if self.zabbix:
            return self.zabbix.get_uptime()

    @property
    def failed_alerts(self):
        return None

    @property
    def address(self):
        return self.ip_address or self.management_ip

    @property
    def customer(self):
        return self.customers.first()

    def configure_monitoring(self, data):
        if self.zabbix:
            self.zabbix.save()
        else:
            try:
                zabbix_customer_proxy = self.customer.zabbixcustomer.proxies.get(collector=self.collector)
            except ObjectDoesNotExist:
                raise BadRequestError(
                    "Collector monitoring configuration is incomplete"
                )
            zabbix_db = self._zabbix.create(
                zabbix_customer_proxy=zabbix_customer_proxy,
                device_object=self)
            zabbix_db.save()
        return True

    @property
    def zabbix(self):
        try:
            return self._zabbix.all()[0]
        except Exception:
            return None

    def monitoring_alerts(self):
        return self.zabbix.get_alerts()

    def stop_monitoring(self):
        return self.zabbix.disable()


class URL(models.Model):
    uuid = models.UUIDField(default=generate_uuid)
    device = models.ForeignKey(CustomDevice, on_delete=models.CASCADE)
    name = models.CharField(max_length=128)
    url = models.URLField()
    url_availabilty = models.BooleanField(default=True)
    login_availability = models.BooleanField(default=False, )
    response_availability = models.BooleanField(default=False, )
    string_availabilty = models.BooleanField(default=False)
    login_username = models.CharField(max_length=128, null=True)
    login_password = EncryptedPasswordField( null=True)
    response_status = models.CharField(max_length=128, null=True)
    string_pattern = models.CharField(max_length=128, null=True)


class PanelDevice(InventoryModel):
    BLANK_PANEL = 1
    CABLE_ORGANIZER = 2
    PATCH_PANEL = 3
    PANEL_TYPE = ((BLANK_PANEL, 'Blank Panel'),
                  (CABLE_ORGANIZER, 'Cable Organizer'),
                  (PATCH_PANEL, 'Patch Panel'))
    name = models.CharField(max_length=128, null=False)
    panel_type = models.PositiveSmallIntegerField(choices=PANEL_TYPE)
    position = models.PositiveSmallIntegerField(default=0)
    size = models.PositiveSmallIntegerField(default=1)
    cabinet = models.ForeignKey('datacenter.Cabinet', null=True)
    customer = models.ForeignKey('organization.Organization', related_name="%(app_label)s_%(class)s_customers")

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        verbose_name = 'Panel Device'
        permissions = (('view', 'Can view PanelDevice'),)

    @property
    def organization_id(self):
        return self.customer.id

    @property
    def category(self):
        return 'paneldevice'

    @property
    def device_uuid(self):
        return self.uuid


class LoadBalancerModel(InventoryModel, NetworkingDeviceClassMixin, DeviceModelBase):
    operating_system = models.CharField(max_length=128, null=True)

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        verbose_name = 'Load Balancer Model'
        permissions = (('view', 'Can view loadbalancermodels'),)


class AbstractAPI(InventoryModel):
    username = models.CharField(max_length=256, null=True)
    password = EncryptedPasswordField( null=True)
    api_url = models.CharField(max_length=256, null=True)

    class Meta:
        abstract = True


class F5APIPortal(AbstractAPI):
    virtual_load_balancer = models.OneToOneField('inventory.VirtualLoadBalancer',
                                                 null=True,
                                                 related_name='api_portal',
                                                 on_delete=models.CASCADE)


class AbstractLB(InventoryModel, NetworkingDeviceMixin, AddressableModel, AssetMixin, NonstrictSalesforceMixin):
    model = models.ForeignKey(LoadBalancerModel, null=True)

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        abstract = True
        permissions = (('view', 'Can view loadbalancer'),)


class LoadBalancer(AbstractLB, PositionSizeProxyMixin, ProxyManagementMixin,
                   SNMPDeviceMixin, TagMixin, MonitoringMethodsMixin, NetworkDetailMixin,
                   DeviceCollectorMixin, NetworkDeviceConfigurationMixin, CustomAttributeMixin,
                   DeviceCTIMixin, ContentTypeMixin, BMCNetworkMixin, SoftDeleteMixin):
    DEVICE_TYPE = Device.load_balancer
    WATCH_RELATED_NAME = 'load_balancer_watch'

    service_contracts = models.ManyToManyField('billing.ServiceContract',
                                               related_name='load_balancers')
    device_mapping = GenericRelation('inventory.PDUSocketMappings', object_id_field='device_id')
    datacenter = models.ForeignKey('CloudService.ColoCloud', null=True, blank=True, on_delete=models.SET_NULL)
    _zabbix = GenericRelation('zabbix.ZabbixHostLoadBalancerMap', object_id_field='device_id', for_concrete_model=False)
    # _events = GenericRelation('aiops.Event', object_id_field='device_id')
    domain = models.CharField(max_length=255, null=True, blank=True)

    objects = LoadBalancerManager()

    @property
    def organization_id(self):
        return self.customers.all()

    @property
    def manufacturer(self):
        return self.model.manufacturer

    @property
    def address(self):
        return self.ip_address or self.management_ip

    @property
    def org_name(self):
        return self.datacenter.customer.name

    def extract_domain(self, fqdn):
        if fqdn:
            parts = fqdn.split('.')
            if len(parts) > 1:
                return '.'.join(parts[-2:])
        return None

    def save(self, *args, **kwargs):
        fqdn = getattr(self, 'name', None)  # or getattr(self, 'dns_name', None)
        if fqdn:
            self.domain = self.extract_domain(fqdn)
            if not self.domain:
                fqdn = getattr(self, 'dns_name', None)
                if fqdn:
                    self.domain = self.extract_domain(fqdn)
        super(LoadBalancer, self).save(*args, **kwargs)

    class Meta:
        verbose_name = 'Load Balancer'
        default_related_name = 'load_balancers'


RBACModelManager.register(LoadBalancer, [RBACModelManager.Modules.DATACENTER])


class VirtualLoadBalancer(AbstractLB):
    hypervisor = models.ForeignKey('inventory.Server',
                                   null=True,
                                   on_delete=models.SET_NULL)
    private_cloud = models.ForeignKey('CloudService.PrivateCloud',
                                      null=True,
                                      on_delete=models.SET_NULL)
    service_contracts = models.ManyToManyField('billing.ServiceContract')
    vms = models.ManyToManyField('VirtualMachine')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    snmp_community = EncryptedPasswordField(null=True)

    @property
    def organization_id(self):
        return self.private_cloud.customer.id

    class Meta:
        verbose_name = 'Virtual Load Balancer'
        default_related_name = 'virtual_load_balancers'


class SwitchModel(InventoryModel, NetworkingDeviceClassMixin, DeviceModelBase):
    PHY_CHOICES = (
        ('10BASE-T', '10BASE-T'),
        ('100BASE-T', '100BASE-T'),
        ('1000BASE-T', '1000BASE-T'),
        ('10000BASE-T', '10000BASE-T'),
        ('SFP', 'SFP'),
        ('SFP+', 'SFP+'),
        ('QSFP+', 'QSFP+'),
        ('XENPAK', 'XENPAK'),
        ('XFP', 'XFP'),
    )
    DEFAULT_PHY = PHY_CHOICES[2][0]  # 1 GbE

    port_speed_mbps = models.IntegerField(null=True)
    port_phy = models.CharField(max_length=32, null=True, choices=PHY_CHOICES, default=DEFAULT_PHY)
    uplink_port_speed_mbps = models.IntegerField(null=True)
    uplink_port_phy = models.CharField(max_length=32, null=True, choices=PHY_CHOICES, default=DEFAULT_PHY)

    def __unicode__(self):
        return '%s %s' % (self.manufacturer, self.name)

    def __repr__(self):
        return '%s %s' % (self.manufacturer, self.name)

    class Meta:
        verbose_name = 'Switch'
        default_related_name = 'switches'
        permissions = (('view', 'Can view switchmodels'),)


class Switch(InventoryModel, AddressableModel, AssetMixin, NonstrictSalesforceMixin,
             NetworkingDeviceMixin, PositionSizeProxyMixin, ProxyManagementMixin,
             SNMPDeviceMixin, TagMixin, MonitoringMethodsMixin, NetworkDetailMixin,
             DeviceCollectorMixin, NetworkDeviceConfigurationMixin, CustomAttributeMixin, DeviceCTIMixin,
             RedFishModelMixin, ContentTypeMixin, BMCNetworkMixin, SoftDeleteMixin):
    DEVICE_TYPE = Device.switch
    WATCH_RELATED_NAME = 'switch_watch'
    TENANCY_TYPES = (
        (u'SHARED', u'SHARED'),
        (u'DEDICATED', u'DEDICATED'),
        (u'INFRASTRUCTURE', u'INFRASTRUCTURE')
    )
    tenancy = models.CharField(max_length=50, choices=TENANCY_TYPES, default=TENANCY_TYPES[1][0])
    model = models.ForeignKey(SwitchModel, null=True, related_name='switches')
    terminal_server = models.ForeignKey('TerminalServer', null=True, related_name='switches')
    service_contracts = models.ManyToManyField('billing.ServiceContract', related_name='switches')
    is_unitedconnect = models.BooleanField(default=False)
    device_mapping = GenericRelation('inventory.PDUSocketMappings', object_id_field='device_id')
    datacenter = models.ForeignKey('CloudService.ColoCloud', null=True, blank=True, on_delete=models.SET_NULL)
    is_root_device = models.BooleanField(default=False)
    _zabbix = GenericRelation('zabbix.ZabbixHostSwitchMap', object_id_field='device_id', for_concrete_model=False)
    # _events = GenericRelation('aiops.Event', object_id_field='device_id')
    domain = models.CharField(max_length=255, null=True, blank=True)

    objects = SwitchManager()

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    @property
    def organization_id(self):
        return self.customers.all()

    @property
    def manufacturer(self):
        return self.model.manufacturer

    @property
    def address(self):
        return self.ip_address or self.management_ip

    @property
    def org_name(self):
        return self.datacenter.customer.name

    def extract_domain(self, fqdn):
        if fqdn:
            parts = fqdn.split('.')
            if len(parts) > 1:
                return '.'.join(parts[-2:])
        return None

    def save(self, *args, **kwargs):
        fqdn = getattr(self, 'name', None)  # or getattr(self, 'dns_name', None)
        if fqdn:
            self.domain = self.extract_domain(fqdn)
            if not self.domain:
                fqdn = getattr(self, 'dns_name', None)
                if fqdn:
                    self.domain = self.extract_domain(fqdn)
        super(Switch, self).save(*args, **kwargs)

    class Meta:
        verbose_name = 'Switch'
        default_related_name = 'switches'
        permissions = (('view', 'Can view switch'),)


RBACModelManager.register(Switch, [RBACModelManager.Modules.DATACENTER])


class MacDevice(InventoryModel, AssetMixin, UserStampModel, ComputeMixin, CabinetMixin,
                ObserviumMonitoringEnablerMixin, SNMPDeviceMixin, ProxyMixin, TagMixin,
                MonitoringMethodsMixin, MacDetailMixin, DeviceCollectorMixin, DeviceCredentialsMixin, CustomAttributeMixin):
    DEVICE_TYPE = Device.mac_device
    WATCH_RELATED_NAME = 'mac_watch'

    name = models.CharField(max_length=255, null=False, blank=False)
    serial_number = models.CharField(max_length=128, null=True)
    customer = models.ForeignKey('organization.Organization', null=False, blank=False)
    os = models.ForeignKey('inventory.OperatingSystem', null=True, blank=True)
    management_ip = models.GenericIPAddressField(null=True, blank=True)
    manufacturer = models.ForeignKey(ServerManufacturer, null=True)
    model = models.ForeignKey(ServerModel, null=True)
    private_cloud = models.ForeignKey('CloudService.PrivateCloud',
                                      null=True, on_delete=models.SET_NULL)
    asset_tag = models.CharField(max_length=128, null=True)
    device_mapping = GenericRelation('inventory.PDUSocketMappings', object_id_field='device_id')
    device_tagged_to = GenericRelation('inventory.MobileDevice', object_id_field='device_id', related_query_name='mac_device')
    datacenter = models.ForeignKey('CloudService.ColoCloud', null=True, blank=True, on_delete=models.SET_NULL)
    pdu1 = models.ForeignKey('inventory.PDU', related_name="%(class)s_power_supply1", null=True, blank=True)
    pdu2 = models.ForeignKey('inventory.PDU', related_name="%(class)s_power_supply2", null=True, blank=True)
    interfaces = JSONField(null=True)
    _zabbix = GenericRelation('zabbix.ZabbixHostMacDeviceMap', object_id_field='device_id', for_concrete_model=False)
    # _events = GenericRelation('aiops.Event', object_id_field='device_id')
    uptime = models.CharField(max_length=255, null=True, blank=True)
    domain = models.CharField(max_length=255, null=True, blank=True)

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    @property
    def object_class(self):
        return self.__class__.__name__

    @property
    def organization_id(self):
        return self.customer.id

    @property
    def address(self):
        return self.ip_address or self.management_ip

    @property
    def operating_system(self):
        return self.os

    @property
    def org_name(self):
        return self.customer.name

    def extract_domain(self, fqdn):
        if fqdn:
            parts = fqdn.split('.')
            if len(parts) > 1:
                return '.'.join(parts[-2:])
        return None

    def save(self, *args, **kwargs):
        fqdn = getattr(self, 'name', None)  # or getattr(self, 'dns_name', None)
        if fqdn:
            self.domain = self.extract_domain(fqdn)
            if not self.domain:
                fqdn = getattr(self, 'dns_name', None)
                if fqdn:
                    self.domain = self.extract_domain(fqdn)
        super(MacDevice, self).save(*args, **kwargs)

    class Meta:
        verbose_name = 'Mac Device'
        default_related_name = 'mac_devices'


class StorageDevice(InventoryModel, AssetMixin, CabinetMixin, ProxyMixin,
                    SNMPDeviceMixin, ObserviumMonitoringEnablerMixin,
                    MonitoringMethodsMixin, TagMixin, StorageDetailMixin, SyncMixin,
                    DeviceCollectorMixin, DeviceCredentialsMixin, CustomAttributeMixin,
                     DeviceCTIMixin, RedFishModelMixin, ContentTypeMixin, SoftDeleteMixin):
    DEVICE_TYPE = Device.storage
    DEVICE_CATEGORY = Device.storage_device
    WATCH_RELATED_NAME = 'storage_watch'
    name = models.CharField(max_length=255, null=False, blank=False)
    customer = models.ForeignKey('organization.Organization', null=False, blank=False)
    os = models.ForeignKey('inventory.OperatingSystem', null=True, blank=True)
    management_ip = models.GenericIPAddressField(null=True, blank=True)
    manufacturer = models.ForeignKey(StorageManufacturer, null=True)
    model = models.ForeignKey(StorageModel, null=True)
    private_cloud = models.ForeignKey('CloudService.PrivateCloud',
                                      null=True, on_delete=models.SET_NULL)
    datacenter = models.ForeignKey('CloudService.ColoCloud', null=True, blank=True, on_delete=models.SET_NULL)
    is_cluster = models.BooleanField(default=False)
    host_url = models.URLField(null=True, blank=True)
    username = models.CharField(max_length=256, null=True, blank=True)
    password = EncryptedPasswordField( null=True, blank=True)
    purity_api_token = EncryptedPasswordField( null=True, blank=True)
    purity_api_version = models.CharField(max_length=256, null=True, blank=True)
    is_purity = models.BooleanField(default=False)
    port = models.IntegerField(null=True, blank=True)
    _zabbix = GenericRelation('zabbix.ZabbixHostStorageDeviceMap', object_id_field='device_id', for_concrete_model=False)
    # _events = GenericRelation('aiops.Event', object_id_field='device_id')
    _sync_tasks = GenericRelation('synchronize.JobSchedule', object_id_field='instance_id')
    _ip_addresses = GenericRelation('unity_discovery.DeviceIPAddress', object_id_field='device_id')
    domain = models.CharField(max_length=255, null=True, blank=True)

    objects = StorageDeviceManager()

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    @property
    def object_class(self):
        return self.__class__.__name__

    @property
    def organization_id(self):
        return self.customer

    @property
    def address(self):
        return self.ip_address or self.management_ip

    @property
    def org_name(self):
        return self.customer.name

    def _get_api(self):
        if self.is_cluster:
            agent = self.customer.agents.first()
            if agent:
                collector_url = 'https://' + self.management_ip + '/'
                version = self.os.version if self.os else None
                return OnTapApiManager(collector_url, self.username, self.password, version, agent)
            else:
                raise BadRequestError("Collector not found for organization " + str(self.customer))

    def get_api_connector(self):
        if not hasattr(self, 'api'):
            self.api = self._get_api()
        return self.api

    def get_customer(self):
        return self.customer

    def storage_data(self):
        monitor_by = self.monitor_by
        if monitor_by.get('zabbix') and self.zabbix:
            storage_data = self.zabbix.storage_data()
            # TODO: Need to verify the storage_data format once storage data becomes available
            storage_data = self.format_zabbix_sensor_response(storage_data, key='storage')
            return storage_data
        elif monitor_by.get('observium') and self.observium:
            return self.observium.storage_data()

    def storage_data_brief(self):
        monitor_by = self.monitor_by
        netapp_cluster = self.is_cluster and str(self.manufacturer.name).lower() == 'netapp'
        pure_storage = self.is_purity and str(self.manufacturer.name).lower() == 'purestorage'
        if netapp_cluster:
            aggregates = self.aggregates.all()
            response = aggr_model_total(aggregates)
            response['used_perc'] = response.pop('used_percent')
            response['capacity'] = response.pop('size')
            response['free'] = response.pop('available')
            return response
        if pure_storage:
            from integ.purestorage.utils import get_array_space_details
            response = get_array_space_details(self)
            return response
        elif monitor_by.get('zabbix') and self.zabbix:
            storage_data = self.zabbix.storage_data()
            # TODO: Need to verify the below logic once storage data becomes available
            capacity, used, free, used_perc = 0, 0, 0, 0
            if storage_data:
                for item in storage_data:
                    value = int(item.get('lastvalue'))
                    if item.get('name') == 'storage_size':
                        capacity += value
                    elif item.get('name') == 'storage_used':
                        used += value
                    elif item.get('name') == 'storage_free':
                        free += value
                response = {
                    'capacity': capacity,
                    'used': used,
                    'free': free,
                    'used_perc': int(round((used / float(capacity)), 2) * 100) if capacity else 0
                }
                return response
        elif monitor_by.get('observium') and self.observium:
            return self.observium.storage_data_brief()

    def extract_domain(self, fqdn):
        if fqdn:
            parts = fqdn.split('.')
            if len(parts) > 1:
                return '.'.join(parts[-2:])
        return None

    def save(self, *args, **kwargs):
        fqdn = getattr(self, 'name', None)  # or getattr(self, 'dns_name', None)
        if fqdn:
            self.domain = self.extract_domain(fqdn)
            if not self.domain:
                fqdn = getattr(self, 'dns_name', None)
                if fqdn:
                    self.domain = self.extract_domain(fqdn)
        super(StorageDevice, self).save(*args, **kwargs)

    class Meta:
        verbose_name = 'Storage Device'
        default_related_name = 'storage_devices'

    def create_schedule(self):

        interval_30_min, flag = IntervalSchedule.objects.get_or_create(
            every=30,
            period=IntervalSchedule.MINUTES,
        )
        class_list = [OntapCluster, OntapDisk, Node, Aggregate, SVM, Volume, LUN, Snapmirror, ClusterPeer, FC, Ethernet]
        if self.is_purity:
            class_list = [PureStorageArray]
        for component in class_list:
            task_path = 'integ.netapp.ontap.tasks.' + component.sync_path
            if self.is_purity:
                task_path = 'integ.purestorage.tasks.sync_pure_storage_components'
            task, _ = PeriodicTask.objects.get_or_create(
                interval=interval_30_min,
                name="{}:{} - {}".format(component.__name__, self.name, str(self.uuid)),
                task=task_path,
                kwargs=json.dumps({"storage_uuid": str(self.uuid)}),
            )
            try:
                JobSchedule.objects.get(task=task)
            except JobSchedule.DoesNotExist as e:
                JobSchedule.objects.create(instance=self, entity=component.__name__, task=task)

    def delete_schedule(self):
        for sync in self._sync_tasks.all():
            sync.task.delete()  # deleting task will delete SyncTask automatically

    def delete(self):
        self.delete_schedule()
        super(StorageDevice, self).delete()

    def get_related_components(self):
        return self.nodes.all()
    
    @classmethod
    def get_fast_list_url(cls):
        return django_reverse('customer_fast:customer_storagedevices-list')

    # def enable_snmptrap(self):
    #     super(StorageDevice, self).enable_snmptrap()
    #     for component in self.get_related_trap_components():
    #         if not component.zabbix:
    #             component.auto_configure_monitoring()
    #         component.enable_snmptrap()

    # def enable_snmptrap(self):
    #     super(StorageDevice, self).enable_snmptrap()
    #     for component in self.get_related_trap_components():
    #         if not component.zabbix:
    #             component.auto_configure_monitoring()
    #         component.enable_snmptrap()


class DatabaseServer(InventoryModel, MonitoringMethodsMixin, TagMixin, DeviceCredentialsMixin, CustomAttributeMixin, DeviceCTIMixin, LifeCycleStageMixin, LifeCycleStageStatusMixin):
    DEVICE_TYPE = Device.database
    WATCH_RELATED_NAME = 'database_server_watch'
    BMS = 'BMS'
    VMS = 'VMS'
    AGENT = 'Agent'
    ODBC = 'ODBC'
    CONNECTION_TYPES = (
        (AGENT, AGENT),
        (ODBC, ODBC),
    )
    SERVER_TYPES = (
        (BMS, 'Bare Metal Servers'),
        (VMS, 'Virtual Machines'),
    )

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    device_id = models.PositiveIntegerField()
    device_object = GenericForeignKey('content_type', 'device_id')
    private_cloud = models.ForeignKey('CloudService.PrivateCloud',
                                      null=True, on_delete=models.CASCADE)
    customer = models.ForeignKey('organization.Organization', null=False, blank=False)
    server_type = models.CharField(max_length=255, choices=SERVER_TYPES, null=False, blank=False)
    db_instance_name = models.CharField(max_length=255, null=False, blank=False)
    db_type = models.ForeignKey(DatabaseType, on_delete=models.PROTECT)
    port = models.IntegerField(null=False, blank=False)
    username = models.CharField(max_length=20, null=False, blank=False)
    password = EncryptedPasswordField(null=True)
    connection_type = models.CharField(max_length=50, choices=CONNECTION_TYPES, null=True)
    # odbc connection fields
    data_source_name = models.CharField(max_length=50, null=True, blank=True)
    connection_string = models.CharField(max_length=128, null=True, blank=True)
    service_name = models.CharField(max_length=128, null=True, blank=True)
    driver = models.CharField(max_length=128, null=True, blank=True)
    database_name = models.CharField(max_length=100, null=True, blank=True)
    _zabbix = GenericRelation('zabbix.ZabbixHostDatabaseServerMap', object_id_field='device_id', for_concrete_model=False)
    # _events = GenericRelation('aiops.Event', object_id_field='device_id')
    domain = models.CharField(max_length=255, null=True, blank=True)
    # version information
    version = models.CharField(max_length=50, null=True, blank=True)
    market_version = models.CharField(max_length=20, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    # lifecycle fields
    end_of_life = models.DateTimeField(null=True, blank=True)
    end_of_support = models.DateTimeField(null=True, blank=True)
    end_of_security_support = models.DateTimeField(null=True, blank=True)
    end_of_extended_support = models.DateTimeField(null=True, blank=True)
    service_pack = models.CharField(max_length=50, null=True, blank=True)

    def __unicode__(self):
        return self.db_instance_name

    def __repr__(self):
        return u'%s' % self.db_instance_name

    @property
    def zabbix(self):
        try:
            return self._zabbix.all()[0]
        except Exception:
            return None

    @property
    def monitor(self):
        return self.zabbix

    @property
    def name(self):
        return self.db_instance_name

    @property
    def ip_address(self):
        return self.device_object.ip_address or self.device_object.management_ip

    @property
    def management_ip(self):
        return self.device_object.management_ip

    @property
    def datacenter(self):
        return self.device_object.datacenter

    @property
    def collector(self):
        return self.device_object.collector

    @property
    def organization_id(self):
        return self.customer.id

    def extract_domain(self, fqdn):
        if fqdn:
            parts = fqdn.split('.')
            if len(parts) > 1:
                return '.'.join(parts[-2:])
        return None

    def save(self, *args, **kwargs):
        fqdn = getattr(self, 'name', None) or getattr(self, 'dns_name', None)
        if fqdn:
            self.domain = self.extract_domain(fqdn)
            if not self.domain:
                fqdn = getattr(self, 'dns_name', None)
                if fqdn:
                    self.domain = self.extract_domain(fqdn)
        super(DatabaseServer, self).save(*args, **kwargs)
        self._create_relation()

    def _create_relation(self):
        relation = AdvancedNeighborInformation.objects.filter(customer=self.customer, source_uuid=self.device_object.uuid, target_uuid=self.uuid).first()
        if not relation:
            AdvancedNeighborInformation.objects.create(
                customer=self.customer,
                source_device=self.device_object, target_device=self,
                source_uuid= self.device_object.uuid, target_uuid=self.uuid,
                source_designation='parent'
            )

    @property
    def database_type(self):
        if self.db_type:
            database_type = self.db_type.name
            if database_type == 'MSSQL Server':
                return 'Microsoft SQL Server'
            return database_type
        return None

    @property
    def db_server(self):
        if self.device_object:
            if isinstance(self.device_object, BMServer):
                return self.device_object.server.name
            return self.device_object.name
        return None

    @property
    def operating_system(self):
        os_attributes = ['os_name', 'os', 'guest_os', 'operating_system']
        if self.device_object:
            for attr in os_attributes:
                if hasattr(self.device_object, attr):
                    value = getattr(self.device_object, attr)
                    if value:
                        if hasattr(value, 'name'):
                            return value.name
                        return value
        return None

    @property
    def environment(self):
        if self.device_object:
            if isinstance(self.device_object, BMServer):
                    return self.device_object.server.environment
            if hasattr(self.device_object, 'environment'):
                return self.device_object.environment
        return None

    def configure_monitoring(self, data):
        self.connection_type = data.get('connection_type')
        self.data_source_name = data.get('data_source_name')
        self.driver = data.get('driver')
        self.username = data.get('username')
        self.password = data.get('password')
        self.database_name = data.get('service_name')

        if self.connection_type == "ODBC":
            output = self.add_odbc_details_to_collector(self.device_object.collector, data)
            if not output:
                raise BadRequestError("DSN already in use please try new one")

        # TODO: hardcoded for now.
        # these values should be sent from the UI
        if self.db_type.name == 'PostgreSQL':
            self.username = 'zbx_monitor'
            self.database_name = 'vcloud'
            self.password = 'aEDq:c7y'
        if self.db_type.name == 'Oracle':
            self.username = data.get('oracle_user')
            # We are hardcoding service name to "cdb1" for Oracle Agent based monitoring
            self.username = data.get('username')
            self.password = data.get('password')
            self.connection_string = data.get('connection_string')
            self.service_name = data.get('service_name')
        self.save()

        if self.zabbix:
            self.zabbix.save()
        else:
            try:
                zabbix_customer_proxy = self.customer.zabbixcustomer.proxies.get(collector=self.device_object.collector)
            except ObjectDoesNotExist:
                raise BadRequestError(
                    "Collector monitoring configuration is incomplete"
                )
            zabbix_db = self._zabbix.create(
                # zabbix_customer=self.customer.zabbixcustomer,
                zabbix_customer_proxy=zabbix_customer_proxy,
                device_object=self)
            zabbix_db.save()
        return True

    def stop_monitoring(self):
        return self.zabbix.disable()

    def start_monitoring(self):
        return self.zabbix.enable()

    def delete_monitoring(self):
        if self.zabbix:
            self.zabbix.delete()
        # clearing fields
        self.connection_type = None
        self.data_source_name = None
        self.driver = None
        self.database_name = None
        self.save()

    def running_status(self):
        if self.zabbix:
            status = self.zabbix.running_status()
            if status is not None:
                status = str(status)
            return status

    def get_status(self):
        if self.zabbix:
            zabbix_db_ip = self.zabbix.zabbix_customer_proxy.zabbix_customer.zabbix_instance.ip_address
            host_id = self.zabbix.host_id
            try:
                status = ZabbixHosts.objects.using(zabbix_db_ip).get(host_id=host_id).status
                status = '1' if str(status) == '0' else '0'
            except Exception as e:
                status = "-1"
            return status

    def get_uptime(self):
        if self.zabbix:
            return self.zabbix.get_uptime()

    def sensor_data(self):
        temperature_response = self.zabbix.temperature_data()
        temperature_response = self.format_zabbix_sensor_response(temperature_response, key='temperature')

        power_response = self.zabbix.power_data()
        power_response = self.format_zabbix_sensor_response(power_response, key='power')

        zabbix_response = temperature_response.copy()
        zabbix_response.update(power_response)

        return zabbix_response

    def monitoring_alerts(self):
        return self.zabbix.get_alerts()

    def add_odbc_details_to_collector(self, agent, data):
        class CaseSensitiveConfigParser(configparser.ConfigParser):
            def optionxform(self, optionstr):
                return optionstr

        data_source_name = data.get('data_source_name')
        driver = data.get('driver')
        port = self.port
        server = self.ip_address + ',' + str(port)

        if agent.is_docker:
            ssh_manager = agent.get_ssh_manager()
            success, content = ssh_manager.read_docker_file('unity-monitoring-proxy', '/etc/odbc.ini')
            if success:
                content = content or  ''
                config = configparser.RawConfigParser()
                config.optionxform = str  # Make it case-sensitive
                config.readfp(StringIO.StringIO(content))
                if not config.has_section(data_source_name):
                    config.add_section(data_source_name)
                config.set(data_source_name, "Driver", driver)
                config.set(data_source_name, "Server", server)

                output = StringIO.StringIO()
                config.write(output)
                updated_content = output.getvalue()
                update_status, result = ssh_manager.update_docker_file('unity-monitoring-proxy', '/etc/odbc.ini', updated_content)
                if update_status:
                    return True
                else:
                    logger.error("Failed: {}".format(result))
                    return False
            else:
                logger.error("Failed to read file: {}".format(content))
                return False

        # below code will get depricated when all collectors are dockerised
        ssh = paramiko.SSHClient()
        ssh.load_system_host_keys()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        err_msg = ''
        connected = False
        #data_source_name = data.get('data_source_name')
        #driver = data.get('driver')
        #port = self.port
        #server = self.ip_address + ',' + str(port)
        try:
            ssh.connect(
                agent.ip_address,
                username=agent.ssh_username,
                password=agent.ssh_password,
                port=agent.ssh_port,
                look_for_keys=False,
                timeout=15
            )

        except AuthenticationException:
            logger.error('Auth error')
            err_msg = 'SSH Authentication failed'
        except SSHException:
            logger.error('SSH error')
            err_msg = 'SSH connection failed'
        except socket.error:
            logger.error('socket error')
            err_msg = 'Socket error'
        except Exception as e:
            logger.error(e)
            err_msg = 'Unhandled Socket error'
        else:
            connected = True
            _, stdout, stderr = ssh.exec_command('cat /etc/odbc.ini')
            error = stderr.read().decode()
            if error:
                logger.error("File Not Found: {}".format(error))
                ssh.close()
                return error
            ini_content = stdout.read().decode()
            config = CaseSensitiveConfigParser()
            config.read_string(ini_content)
            try:
                config.add_section("{}".format(data_source_name))
                config.set("{}".format(data_source_name), "Driver", "{driver}".format(driver=driver))
                config.set("{}".format(data_source_name), "Server", "{server}".format(server=server))
            except configparser.DuplicateSectionError as e:
                logger.error(e)
                return False

            # Write the modified content back to the .ini file
            cmd = "sudo -S chmod 777 {}".format("/etc/odbc.ini")
            stdin, _, _ = ssh.exec_command(cmd)
            stdin.write(agent.ssh_password + '\n')
            stdin.flush()
            time.sleep(2)
            with ssh.open_sftp().file("/etc/odbc.ini", 'w') as f:
                config.write(f)
            cmd = "sudo -S chmod 644 {}".format("/etc/odbc.ini")
            stdin, _, _ = ssh.exec_command(cmd)
            stdin.write(agent.ssh_password + '\n')
            stdin.flush()
        finally:
            ssh.close()

        if connected is True:
            return True
        else:
            return err_msg


class DatabaseEntity(InventoryModel, CustomAttributeMixin, SoftDeleteMixin):
    DEVICE_TYPE = Device.database_entity
    uuid = models.UUIDField(null=True, blank=True, verbose_name='UUID', default=generate_uuid)
    name = models.CharField(max_length=255, null=True, blank=True)
    short_description = models.CharField(max_length=255, null=True, blank=True)
    description = models.CharField(max_length=500, null=True, blank=True)
    database_server = models.ForeignKey(DatabaseServer, on_delete=models.CASCADE, related_name='databases')
    manufacturer = models.CharField(max_length=100, null=True)
    model = models.CharField(max_length=100, null=True)
    discovery_method = models.CharField(max_length=255, null=True, blank=True)
    version = models.CharField(max_length=255, null=True, blank=True)

    objects = DeviceCommonBaseManager()

    def __unicode__(self):
        return u'%s' % (self.name)

    def __repr__(self):
        return u'%s' % self.name

    @property
    def instance_name(self):
        return self.database_server.db_instance_name

    @property
    def compliance_alias(self):
        db_name = self.name or ''
        server_name = self.database_server.db_server if self.database_server else ''
        instance = self.instance_name or ''
        return self.model + ':' + instance + ':' + db_name

    @property
    def market_version(self):
        return self.database_server.market_version


@receiver(post_delete, sender=DatabaseServer)
def post_database_server_deleted(sender, instance, **kwargs):
    """
    Triggered when a DatabaseServer record is deleted.
    """
    # Call your custom function here
    # Example: cleanup, logging, or external API call
    device_type = instance.DEVICE_TYPE if hasattr(instance, 'DEVICE_TYPE') else None
    user = instance.customer.users.first()  # Assuming the first user is performing the action
    if device_type:
        cmdb_manager = CMDBManager(user, instance, device_type)
        cmdb_manager.retire_cmdb_record()


@receiver(pre_delete, sender=DatabaseServer)
def pre_database_server_deleted(sender, instance, **kwargs):
    """
    Triggered when a DatabaseServer record is deleted.
    """
    # Call your custom function here
    # Example: cleanup, logging, or external API call
    instance.delete_monitoring()


class SwitchPortMap(InventoryModel):
    customer = models.ForeignKey('organization.Organization')
    switch = models.ForeignKey(Switch)
    ports = ArrayField(models.IntegerField())
    name = models.CharField(max_length=255, null=True, blank=True)

    @property
    def organization_id(self):
        return self.customer.id

    def __unicode__(self):
        return '%s' % (self.switch)

    def __repr__(self):
        return '%s' % (self.switch)

    class Meta:
        verbose_name = 'Switch Port'
        permissions = (('view', 'Can view switchportmap'),)


class TerminalServerModel(InventoryModel, AssetClassMixin, NetworkingDeviceClassMixin):
    def __unicode__(self):
        return u'%s %s %s' % (self.manufacturer, self.name, self.num_ports)

    def __repr__(self):
        return u'%s %s %s' % (self.manufacturer, self.name, self.num_ports)

    class Meta:
        verbose_name = 'Terminal Server'
        permissions = (('view', 'Can view terminal_servermodels'),)


class TerminalServer(InventoryModel, AddressableModel, AssetMixin, NetworkingDeviceMixin, NonstrictSalesforceMixin):
    model = models.ForeignKey(TerminalServerModel, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    snmp_community = EncryptedPasswordField(null=True)

    @property
    def organization_id(self):
        return self.customer.id

    def __unicode__(self):
        return u'%s' % (self.name)

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        verbose_name = 'Terminal Server'
        permissions = (('view', 'Can view terminalserver'),)


class MobileDeviceManufacturer(InventoryModel):
    """
    A company that offers Mobile Device as products, such as Google.
    """
    name = models.CharField(max_length=128, unique=True)

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        verbose_name = 'Mobile Device Manufacturer'
        permissions = (('view', 'Can view mobile_devicemanufacturer'),)


class MobileDeviceModel(InventoryModel, DeviceModelBase):
    name = models.CharField(max_length=255, unique=True)
    manufacturer = models.ForeignKey(MobileDeviceManufacturer, null=True, on_delete=models.SET_NULL)


class MobileDevice(InventoryModel, TagMixin, DeviceCollectorMixin, CustomAttributeMixin, DeviceCTIMixin):
    DEVICE_TYPES = (
        ('Smartphone', 'Smartphone'),
        ('Tablet', 'Tablet'),
    )
    PLATFORM_TYPES = (
        ('Android', 'Android'),
        ('ios', 'ios'),
    )
    DEVICE_TYPE = Device.mobile
    DEVICE_CATEGORY = Device.mobile_device

    name = models.CharField(max_length=255, null=False, blank=False)
    serial_number = models.CharField(max_length=128, null=True, blank=True)
    device_type = models.CharField(max_length=128, choices=DEVICE_TYPES, default=DEVICE_TYPES[0][0])
    platform = models.CharField(max_length=128, choices=PLATFORM_TYPES, default=PLATFORM_TYPES[0][0])
    model = models.CharField(max_length=128, null=False, blank=False)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    customer = models.ForeignKey('organization.Organization', null=False, blank=False)

    content_type = models.ForeignKey(ContentType, null=True, blank=True, on_delete=models.CASCADE)
    device_id = models.PositiveIntegerField(null=True, blank=True)
    tagged_device = GenericForeignKey('content_type', 'device_id')
    datacenter = models.ForeignKey('CloudService.ColoCloud', null=True, blank=True, on_delete=models.SET_NULL)
    domain = models.CharField(max_length=255, null=True, blank=True)

    @property
    def organization_id(self):
        return self.customer.id

    def __unicode__(self):
        return u'%s' % (self.name)

    def __repr__(self):
        return u'%s' % self.name

    def extract_domain(self, fqdn):
        if fqdn:
            parts = fqdn.split('.')
            if len(parts) > 1:
                return '.'.join(parts[-2:])
        return None

    def save(self, *args, **kwargs):
        fqdn = getattr(self, 'name', None)  # or getattr(self, 'dns_name', None)
        if fqdn:
            self.domain = self.extract_domain(fqdn)
            if not self.domain:
                fqdn = getattr(self, 'dns_name', None)
                if fqdn:
                    self.domain = self.extract_domain(fqdn)
        super(MobileDevice, self).save(*args, **kwargs)

    class Meta:
        verbose_name = 'Mobile Device'
        permissions = (('view', 'Can view mobiledevice'),)


class TerminalServerPort(InventoryModel, PortMapMixin):
    terminal_server = models.ForeignKey(TerminalServer, related_name='ports')
    logical_port_number = models.IntegerField(null=True)
    port_speed_bps = models.IntegerField(null=True)

    def __unicode__(self):
        return '%s, %s->%s' % (
            self.terminal_server, self.physical_port_number, self.logical_port_number)

    def __repr__(self):
        return '%s, %s->%s' % (
            self.terminal_server, self.physical_port_number, self.logical_port_number)

    class Meta:
        verbose_name = 'Terminal Server Port'
        permissions = (('view', 'Can view terminal_serverports'),)


class PDUModel(DeviceModelBase):
    manufacturer = models.ForeignKey(
        PDUManufacturer,
        null=True,
        on_delete=models.SET_NULL)
    model_number = models.CharField(
        max_length=128,
        unique=True,
        verbose_name='Model Number')
    max_amps = models.IntegerField(
        null=True, blank=True, verbose_name='Max Amps')
    num_outlets = models.IntegerField(
        null=True, blank=True, verbose_name='Number of Outlets')
    plug_type = models.CharField(
        max_length=128,
        blank=True,
        null=True,
        verbose_name='Plug Type')
    outlet_type = models.CharField(
        max_length=128,
        blank=True,
        null=True,
        verbose_name='Outlet Type')
    input_voltage = models.IntegerField(
        null=True, blank=True, verbose_name='Input Voltage')
    output_voltage = models.IntegerField(
        null=True, blank=True, verbose_name='Output Voltage')

    def __unicode__(self):
        return u'%s %s' % (self.model_number, self.outlet_type)

    def __repr__(self):
        return u'%s %s' % (self.model_number, self.outlet_type)

    class Meta:
        verbose_name = 'PDU'
        db_table = 'pdumodel'
        ordering = ['model_number']
        permissions = (('view', 'Can view pdu  model'),)

    @property
    def name(self):
        return self.model_number

    def clean(self):
        if self.model_number and not self.id:
            if PDUModel.objects.filter(model_number__iexact=self.model_number):
                raise ValidationError(
                    {'model_number': 'Model number must be in unique'})
        if self.model_number and self.id:
            if PDUModel.objects.filter(
                    model_number=self.model_number, id=self.id):
                pass
            else:
                if PDUModel.objects.filter(
                        model_number__iexact=self.model_number):
                    raise ValidationError(
                        {'model_number': 'Model number must be in unique'})
        return


class PDU(AddressableModel, SalesforceMixin, CabinetMixin, ProxyMixin, ObserviumMonitoringEnablerMixin,
          SNMPDeviceMixin, MonitorableFieldsMixin, MonitoringMethodsMixin, TagMixin, PDUDetailMixin, DeviceCollectorMixin):
    DEVICE_TYPE = Device.pdu
    WATCH_RELATED_NAME = 'pdu_watch'
    PDU_TYPES = (
        ('HORIZONTAL', 'HORIZONTAL'),
        ('VERTICAL', 'VERTICAL')
    )
    CONNECTION_TYPES = (
        ('SNMP', 'SNMP'),
    )
    name = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        verbose_name='Hostname')
    assettag = models.CharField(
        max_length=128,
        blank=True,
        null=True,
        verbose_name='AssetTag')
    serialnumber = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        default='NOT ENTERED',
        verbose_name='Serial Number')
    manufacturer = models.ForeignKey(PDUManufacturer, null=True, on_delete=models.SET_NULL)
    model = models.ForeignKey(PDUModel, null=True)
    power_circuit = models.ForeignKey(
        'datacenter.PowerCircuit',
        null=True,
        blank=False,
        db_column='power_circuit_id')
    cabinet = models.ForeignKey(
        'datacenter.Cabinet',
        null=True,
        blank=False,
        db_column='cabinet_id')
    customer = models.ForeignKey(
        'organization.Organization',
        null=True,
        blank=False,
        db_column='customer_id')
    user = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        verbose_name='User Name')
    password = EncryptedPasswordField( null=True, blank=True)
    is_allocated = models.BooleanField(default=False, verbose_name='State')
    salesforce_id = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        unique=True,
        verbose_name='Salesforce ID')
    uuid = models.UUIDField(null=True, blank=True, verbose_name='UUID', default=generate_uuid)
    position = models.CharField(max_length=128, default=0)
    pdu_type = models.CharField(max_length=15, choices=PDU_TYPES, default="HORIZONTAL", null=True, blank=True)
    sockets = models.PositiveSmallIntegerField()
    management_ip = models.GenericIPAddressField(null=True, blank=True)
    cost = models.FloatField(null=True, blank=True)
    annual_escalation = models.FloatField(null=True, blank=True)
    connection_type = models.CharField(max_length=50, choices=CONNECTION_TYPES, null=True, blank=True)
    _zabbix = GenericRelation('zabbix.ZabbixHostPDUMap', object_id_field='device_id', for_concrete_model=False)
    # _events = GenericRelation('aiops.Event', object_id_field='device_id')
    interfaces = JSONField(null=True)
    domain = models.CharField(max_length=255, null=True, blank=True)

    objects = PDUManager()

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    @property
    def organization_id(self):
        return self.customer.id

    @property
    def address(self):
        return self.ip_address or self.management_ip

    @property
    def datacenter(self):
        return self.cabinet.colocloud_set.first()

    @property
    def org_name(self):
        return self.customer.name

    def extract_domain(self, fqdn):
        if fqdn:
            parts = fqdn.split('.')
            if len(parts) > 1:
                return '.'.join(parts[-2:])
        return None

    # @property
    # def co2_emission_value(self):
    #     from cloud.CloudService.models import CO2Matrix
    #     co2_per_kwh = 0.0
    #     power_value = 0.0
    #     result = 0
    #     if hasattr(self.cabinet, 'colocloud_set'):
    #         colo_cloud = self.cabinet.colocloud_set.first()
    #         if colo_cloud:
    #             for co2_matrix in CO2Matrix.objects.all():
    #                 if re.search(co2_matrix.location, colo_cloud.location):
    #                     co2_per_kwh = co2_matrix.co2_emission_value
    #     if co2_per_kwh:
    #         sensor_data = self.sensor_data()
    #         if sensor_data and sensor_data.get('power'):
    #             for sensor in sensor_data.get('power'):
    #                 for data in sensor.values():
    #                     if data.get('sensor_unit').lower() == 'kw':

    #                         power_value += value_to_float(data.get('sensor_value', 0.0)) * 1000
    #                     else:
    #                         power_value += value_to_float(data.get('sensor_value', 0.0))

    #         power_in_kw = power_value / 1000.0
    #         result = (power_in_kw * 8760 * co2_per_kwh) / 1000
    #     return result

    def get_customer(self):
        return self.customer

    def sensor_data(self):
        monitor_by = self.monitor_by
        if monitor_by.get('zabbix') and self.zabbix:
            power_response = self.zabbix.power_data()
            power_response = self.format_zabbix_sensor_response(power_response, key='power')

            current_response = self.zabbix.current_data()
            current_response = self.format_zabbix_sensor_response(current_response, key='current')

            voltage_response = self.zabbix.voltage_data()
            voltage_response = self.format_zabbix_sensor_response(voltage_response, key='voltage')

            zabbix_response = power_response.copy()
            zabbix_response.update(current_response)
            zabbix_response.update(voltage_response)

            return zabbix_response
        elif monitor_by.get('observium') and self.observium:
            return self.observium.sensor_data()
        else:
            return None

    class Meta:
        verbose_name = 'PDU'
        db_table = 'pdu'
        # ordering = ['name']
        permissions = (('view', 'Can view pdu'),)

    def save(self, *args, **kwargs):
        # if not self.assettag:
        #     self.assettag = slugify('%s-%s-%s' % ('PDU', self.serialnumber, self.pdu_model))
        fqdn = getattr(self, 'name', None)  # or getattr(self, 'dns_name', None)
        if fqdn:
            self.domain = self.extract_domain(fqdn)
            if not self.domain:
                fqdn = getattr(self, 'dns_name', None)
                if fqdn:
                    self.domain = self.extract_domain(fqdn)
        if self.serialnumber == '' or self.serialnumber == 'NOT ENTERED' or self.serialnumber is None:
            self.serialnumber = random_serial_number(prefix="MISSING")
        if not self.salesforce_id:
            self.salesforce_id = None
        _fix_salesforce(self)
        if self.customer:
            self.is_allocated = True
        else:
            self.is_allocated = False
        super(PDU, self).save(*args, **kwargs)

    def clean(self):
        if self.serialnumber and not self.pdu_id:
            if PDU.objects.filter(serialnumber__iexact=self.serialnumber):
                raise ValidationError(
                    {'serialnumber': 'Serialnumber must be in unique'})
        if self.serialnumber and self.pdu_id:
            if PDU.objects.filter(
                    serialnumber=self.serialnumber, pdu_id=self.pdu_id):
                pass
            else:
                if PDU.objects.filter(serialnumber__iexact=self.serialnumber):
                    raise ValidationError(
                        {'serialnumber': 'Serialnumber must be in unique'})

        if self.salesforce_id and not self.pdu_id:
            if PDU.objects.filter(salesforce_id__iexact=self.salesforce_id):
                raise ValidationError(
                    {'salesforce_id': 'Salesforce ID must be in unique'})
        if self.salesforce_id and self.pdu_id:
            if PDU.objects.filter(
                    salesforce_id=self.salesforce_id, pdu_id=self.pdu_id):
                pass
            else:
                if PDU.objects.filter(
                        salesforce_id__iexact=self.salesforce_id):
                    raise ValidationError(
                        {'salesforce_id': 'Salesforce ID must be in unique'})

        return


class PDUSocketMappings(models.Model):
    pdu = models.ForeignKey(PDU)
    socket_number = models.PositiveIntegerField()

    # fields for generic relation
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    device_id = models.PositiveIntegerField()
    device_object = GenericForeignKey('content_type', 'device_id')

    def __unicode__(self):
        if hasattr(self.device_object, 'name'):
            return self.device_object.name
        return u'%s' % self.pdu.name

    def __repr__(self):
        return u'%s' % self.pdu.name

    @property
    def organization_id(self):
        return self.pdu.customer.id

    def save(self, *args, **kwargs):
        # saving the same info in NeighborInformation for topology
        # todo : remove this table and use the NeighborInformation
        NeighborInformation.objects.get_or_create(
            source_uuid=self.pdu.uuid,
            target_uuid=self.device_object.uuid,
            customer=self.pdu.customer
        )
        return super(PDUSocketMappings, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # saving the same info in NeighborInformation for topology
        # todo : remove this table and use the NeighborInformation
        NeighborInformation.objects.filter(
            source_uuid=self.pdu.uuid,
            target_uuid=self.device_object.uuid,
            customer=self.pdu.customer
        ).delete()
        return super(PDUSocketMappings, self).delete(*args, **kwargs)

    class Meta:
        verbose_name = 'PDU Socket Mappings'


class OperatingSystem(models.Model):
    OS_TYPES = (
        ('ESXi', 'ESXi'),
        ('Hypervisor', 'Hypervisor'),
        ('Linux', 'Linux'),
        ('MacOS', 'MacOS'),
        ('Nimble', 'Nimble'),
        ('Windows', 'Windows'),
        ('NetApp', 'NetApp'),
        ('NX-OS', 'NX-OS'),
        ('IOS-XE', 'IOS-XE'),
        ('TMOS (F5)', 'TMOS (F5)'),
        ('FTD (Firepower Threat Defense)', 'FTD (Firepower Threat Defense)'),
        ('Firepower', 'Firepower'),
        ('PAN-OS', 'PAN-OS'),
        ('Embedded Linux', 'Embedded Linux'),
        ('FortiOS', 'FortiOS'),
        ('FortiOS Standard', 'FortiOS Standard'),
        ('HA FortiOS', 'HA FortiOS'),

    )

    name = models.CharField(max_length=128, null=False)
    version = models.CharField(max_length=128, null=True, blank=True)
    platform_type = models.CharField(choices=OS_TYPES, max_length=50, null=False, blank=False)
    os_architecture = models.CharField(max_length=128, null=True, blank=True)
    objects = OperatingSystemManager()

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        verbose_name = 'Operating System'
        unique_together = (('name', 'version'),)
        permissions = (('view', 'Can view operatinsystem'),)

    @property
    def full_name(self):
        return u"{0} {1}".format(self.name, self.version)

    def matches(self, input):
        full = self.full_name.replace(' ', '').lower()
        s = input.replace(' ', '').lower()
        logger.debug("checking %s == %s" % (full, s))
        return full == s


class PowerSupplyUnitModel(models.Model):
    """
    Describes a PSU model.

    :maximum_power_output: In watts, describes the maximum power rating of the unit.
    :pfc:  Describes whether power factor correction type, typically "passive" or "active", with newer
           units employing "active" PFC.
    :efficiency_rating: Something like "80 PLUS GOLD", "80 PLUS PLATINUM"
    :input_voltage:  Voltage provided from the power circuit, typically 120 or 220 (in volts)
    """
    name = models.CharField(max_length=128)
    uuid = models.UUIDField(default=generate_uuid)

    maximum_power_output = models.IntegerField(null=True, blank=True)
    input_voltage = models.IntegerField(null=True, blank=True)
    pfc = models.CharField(max_length=32, null=True, blank=True)
    efficiency_rating = models.CharField(max_length=128, null=True, blank=True)

    def __unicode__(self):
        return u"{0}".format(self.name)

    def __repr__(self):
        return u'%s' % self.name


class PowerSupplyUnit(TimestampedModel):
    """
    Describes an "instance" of a PSU model, i.e. an actual PSU object.
    """
    model = models.ForeignKey('PowerSupplyUnitModel')
    uuid = models.UUIDField(default=generate_uuid)
    chassis = models.ForeignKey('Chassis', null=True, blank=True, related_name='psus')

    def __unicode__(self):
        return u"{0}:{1}".format(self.model.name, self.uuid)

    def __repr__(self):
        return u"{0}:{1}".format(self.model.name, self.uuid)


class Chassis(models.Model):
    """
    Describes a chassis, e.g., a "Dell R210".

    Only has a relationship to the PowerSupplyUnitModel model class, which is helpful
    as it keeps all psu models in the same table.
    """
    integrated_psu = models.ForeignKey('PowerSupplyUnitModel', null=True, blank=True)
    manufacturer = models.ForeignKey('Manufacturer', null=True, blank=True)

    model_name = models.CharField(max_length=128, unique=False, null=True,
                                  default=random_serial_number, verbose_name='Model Name')
    u_height = models.FloatField(default=1.0)
    num_integrated_psu = models.IntegerField(default=0, verbose_name='Number of integrated PSUs')

    num_psu_slots = models.IntegerField(default=0, verbose_name='Number of PSU slots')
    num_drive_bays = models.IntegerField(default=4, verbose_name='Number of drive bays')
    drive_bay_width = models.CharField(max_length=32, default='3.5', verbose_name='Disk baywidth')
    num_fan_slots = models.IntegerField(null=True, blank=True)
    dimensions = models.CharField(max_length=256, null=True, blank=True)

    def __unicode__(self):
        return self.model_name

    def __repr__(self):
        return self.model_name

    def has_redundant_power(self):
        return (self.num_psu + self.num_psu_slots) > 1

    class Meta:
        verbose_name = 'Chassis'
        permissions = (('view', 'Can view chassistypes'),)


class Cluster(models.Model):
    """
    """
    name = models.CharField(
        max_length=128,
        null=False,
        default='vmware',
        unique=True,
        verbose_name='Cluster Name')
    cluster_type = models.ForeignKey(
        'ClusterTypes', db_column='cluster_type_id')

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        db_table = 'cluster'
        permissions = (('view', 'Can view cluster'),)


class ClusterTypes(models.Model):
    """
    """
    name = models.CharField(
        max_length=128,
        default='vCloud',
        unique=True,
        verbose_name='Cluster Type')

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        db_table = 'clustertypes'
        permissions = (('view', 'Can view clustertypes'),)


class IPMITypes(models.Model):
    """
    """
    IPMI_VERSION = (
        (u'1.0', u'1.0'),
        (u'1.5', u'1.5'),
        (u'2.0', u'2.0'),
    )
    version = models.CharField(
        max_length=10,
        choices=IPMI_VERSION,
        default=IPMI_VERSION[0][0],
        verbose_name='Version')
    controller = models.CharField(
        max_length=128,
        unique=True,
        verbose_name='Controller')
    manufacturer = models.ForeignKey(
        'Manufacturer',
        null=True,
        blank=True,
        verbose_name='Manufacturer')

    def __unicode__(self):
        return u'%s - %s' % (self.version, self.controller)

    def __repr__(self):
        return u'%s - %s' % (self.version, self.controller)

    class Meta:
        verbose_name = 'IPMI'
        db_table = 'ipmitypes'
        ordering = ['controller']
        permissions = (('view', 'Can view ipmi types'),)

    def clean(self):
        if self.controller and not self.ipmi_type_id:
            if IPMITypes.objects.filter(controller__iexact=self.controller):
                raise ValidationError(
                    {'controller': 'IPMI Types must be in unique'})
        if self.controller and self.ipmi_type_id:
            if IPMITypes.objects.filter(
                    controller=self.controller, ipmi_type_id=self.ipmi_type_id):
                pass
            else:
                if IPMITypes.objects.filter(
                        controller__iexact=self.controller):
                    raise ValidationError(
                        {'controller': 'IPMI Types must be in unique'})
        return


class IPMI(models.Model):
    assettag = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        verbose_name='AssetTag')
    serialnumber = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        default='NOT ENTERED',
        verbose_name='Serial Number')
    ipmi_type = models.ForeignKey(
        IPMITypes,
        blank=False,
        null=True,
        verbose_name='Controller')
    is_allocated = models.BooleanField(default=False)

    def __unicode__(self):
        return u'%s' % self.assettag

    def __repr__(self):
        return u'%s' % self.assettag

    class Meta:
        verbose_name = 'IPMI'
        db_table = 'ipmi'
        permissions = (('view', 'Can view ipmi'),)

    def save(self, *args, **kwargs):
        if self.serialnumber == '' or self.serialnumber == 'NOT ENTERED' or self.serialnumber is None:
            self.serialnumber = random_serial_number(prefix="MISSING")
        super(IPMI, self).save(*args, **kwargs)


class NICTypes(TimestampedModel, NonstrictSalesforceMixin):
    MEASURE_TYPE = (
        (u'Mbps', u'Mbps'),
        (u'Gbps', u'Gbps'),
        (u'Tbps', u'Tbps'),
    )
    controller = models.CharField(
        max_length=128,
        null=True,
        verbose_name='NIC Controller')
    nic_speed_mbps = models.IntegerField(default=100, null=True, verbose_name='Speed')
    chipset = models.CharField(
        max_length=45,
        null=True,
        blank=True,
        verbose_name='Chipset')
    manufacturer = models.ForeignKey(
        'Manufacturer',
        null=True,
        blank=True,
        verbose_name='Manufacturer')

    def __unicode__(self):
        return u'%s %s' % (self.manufacturer, self.controller)

    def __repr__(self):
        return u'%s %s' % (self.manufacturer, self.controller)

    class Meta:
        verbose_name = 'NIC'
        db_table = 'nictypes'
        permissions = (('view', 'Can view nictypes'),)

    def save(self, *args, **kwargs):
        if not self.salesforce_id:
            self.salesforce_id = None
        _fix_salesforce(self)
        super(NICTypes, self).save(*args, **kwargs)

    def clean(self):

        if self.controller and not self.nic_type_id:
            if NICTypes.objects.filter(controller__iexact=self.controller):
                raise ValidationError(
                    {'controller': 'Controller must be in unique'})
        if self.controller and self.nic_type_id:
            if NICTypes.objects.filter(
                    controller=self.controller, nic_type_id=self.nic_type_id):
                pass
            else:
                if NICTypes.objects.filter(controller__iexact=self.controller):
                    raise ValidationError(
                        {'controller': 'Controller must be in unique'})
        if self.salesforce_id and not self.nic_type_id:
            if NICTypes.objects.filter(
                    salesforce_id__iexact=self.salesforce_id):
                raise ValidationError(
                    {'salesforce_id': 'Salesforce ID must be in unique'})
        if self.salesforce_id and self.nic_type_id:
            if NICTypes.objects.filter(
                    salesforce_id=self.salesforce_id, nic_type_id=self.nic_type_id):
                pass
            else:
                if NICTypes.objects.filter(
                        salesforce_id__iexact=self.salesforce_id):
                    raise ValidationError(
                        {'salesforce_id': 'Salesforce ID must be in unique'})
        return


class NIC(models.Model):
    assettag = models.SlugField(
        max_length=128,
        blank=True,
        null=True,
        verbose_name='AssetTag')
    serialnumber = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        default='NOT ENTERED',
        verbose_name='Serial Number')
    nic_model = models.ForeignKey(
        NICTypes,
        null=False,
        blank=False,
        db_column='nic_type_id',
        verbose_name='Model')
    mac_address = models.CharField(
        max_length=30,
        null=True,
        blank=True,
        verbose_name='MAC Address')
    is_allocated = models.BooleanField(default=False, verbose_name='State')

    def __unicode__(self):
        return u'%s' % self.assettag

    def __repr__(self):
        return u'%s' % self.assettag

    class Meta:
        verbose_name = 'NIC'
        db_table = 'nic'
        ordering = ['assettag']
        permissions = (('view', 'Can view nic'),)

    def save(self, *args, **kwargs):
        self.assettag = '%s' % (slugify(self.nic_model))
        if self.serialnumber == '' or self.serialnumber == 'NOT ENTERED' or self.serialnumber is None:
            self.serialnumber = random_serial_number(prefix="MISSING")
        super(NIC, self).save(*args, **kwargs)


class PeripheralTypes(models.Model):
    peripheral_type = models.CharField(
        max_length=128,
        unique=True,
        default='SERVER',
        verbose_name='Peripheral Type')

    def __unicode__(self):
        return u'%s' % self.peripheral_type

    def __repr__(self):
        return u'%s' % self.peripheral_type

    class Meta:
        db_table = 'peripheraltypes'
        permissions = (('view', 'Can view peripheraltypes'),)

    @staticmethod
    def get_peripheral_type_id(self, peripheraltype):
        prtype = PeripheralTypes.objects.filter(peripheral_type=peripheraltype)
        if prtype:
            return prtype[0].peripheral_type_id
        else:
            ptype = PeripheralTypes(peripheral_type=peripheraltype)
            ptype.save()
            return ptype.peripheral_type_id


class IPMIAttributes(models.Model):
    motherboard = models.ForeignKey(
        Motherboard,
        blank=False,
        null=True,
        db_column='motherboard_id')
    ip_address = models.GenericIPAddressField(
        null=True, blank=False, verbose_name='IP Address')
    ipmiport = models.IntegerField(
        null=True, blank=True, verbose_name='IPMI Port')
    ipmi_port = models.CharField(
        max_length=45,
        null=True,
        blank=True,
        verbose_name='IPMI Ports')
    ipmi_user = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        verbose_name='User Name')
    ipmi_password = EncryptedPasswordField( null=True, blank=True)
    mac_address = models.CharField(
        max_length=45,
        null=True,
        blank=True,
        verbose_name='MAC Address')

    def __unicode__(self):
        return u'%s' % self.ipmi_attribute_id

    def __repr__(self):
        return u'%s' % self.ipmi_attribute_id

    @property
    def organization_id(self):
        return self.motherboard.organization_id

    class Meta:
        db_table = 'ipmiattributes'
        permissions = (('view', 'Can view ipmi attributes'),)

    def clean(self):
        if self.mac_address and not self.ipmi_attribute_id:
            if IPMIAttributes.objects.filter(
                    mac_address__iexact=self.mac_address):
                raise ValidationError(
                    {'mac_address': 'MAC Address must be in unique'})
        if self.mac_address and self.ipmi_attribute_id:
            if IPMIAttributes.objects.filter(
                    mac_address=self.mac_address, ipmi_attribute_id=self.ipmi_attribute_id):
                pass
            else:
                if IPMIAttributes.objects.filter(
                        mac_address__iexact=self.mac_address):
                    raise ValidationError(
                        {'mac_address': 'MAC Address must be in unique'})


class Server(InventoryModel, AssetMixin, UserStampModel, ComputeMixin, NonstrictSalesforceMixin, ServerMixin,
             PositionSizeProxyMixin, ObserviumMonitoringEnablerMixin, ProxyManagementMixin, SNMPDeviceMixin,
             TagMixin, MonitoringMethodsMixin, ServerDetailMixin, DeviceCollectorMixin, DeviceCredentialsMixin,
             CustomAttributeMixin, DeviceCTIMixin, RedFishModelMixin, SoftDeleteMixin, LifeCycleStageMixin, LifeCycleStageStatusMixin):
    FK_KWARGS = dict(null=True, related_name='servers', on_delete=models.SET_NULL)
    DEVICE_TYPE = Device.hypervisor
    DEVICE_CATEGORY = Device.virtual_device
    WATCH_RELATED_NAME = 'server_watch'

    chassis = models.ForeignKey(Chassis, **FK_KWARGS)
    cabinet = models.ForeignKey('datacenter.Cabinet', null=True, on_delete=models.SET_NULL)
    customer = models.ForeignKey('organization.Organization', **FK_KWARGS)
    cluster = models.ForeignKey('Cluster', **FK_KWARGS)
    os = models.ForeignKey(OperatingSystem, **FK_KWARGS)  # todo: remove this field
    private_cloud = models.ForeignKey('CloudService.PrivateCloud', null=True, on_delete=models.CASCADE)
    vmware_cluster = models.ForeignKey(
        'vmware.VmwareVcenterCluster',
        related_name='cluster_hosts',
        blank=True,
        null=True,
        on_delete=models.SET_NULL
    )
    cpu_usage = JSONField(default=dict)
    memory_usage = JSONField(default=dict)
    storage_usage = JSONField(default=dict)
    device_mapping = GenericRelation('inventory.PDUSocketMappings', object_id_field='device_id')
    device_tagged_to = GenericRelation('inventory.MobileDevice', object_id_field='device_id', related_query_name='server')
    _server_zabbix = GenericRelation(
        'zabbix.ZabbixHostServerMap',
        object_id_field='device_id',
        for_concrete_model=True,
        related_query_name='server_zabbix'
    )
    _bm_server_zabbix = GenericRelation(
        'zabbix.ZabbixHostBMServerMap',
        object_id_field='device_id',
        for_concrete_model=True,
        related_query_name='bm_server_zabbix'
    )
    datacenter = models.ForeignKey('CloudService.ColoCloud', null=True, blank=True, on_delete=models.SET_NULL)
    # _events = GenericRelation('aiops.Event', object_id_field='device_id')

    domain = models.CharField(max_length=255, null=True, blank=True)

    objects = ServerDeviceManager()

    def extract_domain(self, fqdn):
        """Extracts domain from the FQDN."""
        if fqdn:
            parts = fqdn.split('.')
            if len(parts) > 1:
                return '.'.join(parts[-2:])
        return None

    def __unicode__(self):
        return u'%s' % (self.name)

    def __repr__(self):
        return u'%s' % (self.name)

    @property
    def zabbix(self):
        try:
            if hasattr(self, 'bm_server'):
                return self._bm_server_zabbix.all()[0]
            return self._server_zabbix.all()[0]
        except Exception:
            return None

    @property
    def address(self):
        return self.ip_address or self.management_ip

    @property
    def org_name(self):
        return self.customer.name

    def get_customer(self):
        return self.customer

    @classmethod
    def get_customer_bms_alerts(cls, customer):
        monitor_by = getattr(customer.monitoring_config, Device.bms)

        if monitor_by.get('zabbix'):
            zabbix_customer = customer.zabbixcustomer
            return zabbix_customer.get_alerts(device_type=Device.bms)
        elif monitor_by.get('observium'):
            observium_model = Device.get_observium_device_model(device_type=cls.DEVICE_TYPE)
            return observium_model.get_customer_alerts(customer=customer, alert_type='failed')

    class RelationNotSpecified(Exception):
        pass

    def _get_mobos(self):
        mobos = self.motherboards.all()
        if not mobos:
            raise Server.RelationNotSpecified
        return mobos

    def compute_cpus(self):
        try:
            mobos = self._get_mobos()
            cpus = [cpu for m in mobos for cpu in m.cpu_set.all()]
            self.num_cpus = len(cpus)
            self.num_cores = sum([cpu.model.cores for cpu in cpus if cpu.model is not None])
        except Server.RelationNotSpecified:
            # custom logic here
            pass

    def compute_memory(self):
        try:
            mobos = self._get_mobos()
            mems = [mem for m in mobos for mem in m.memory_set.all()]
            self.memory_mb = sum([mem.model.memory_mb for mem in mems if mem.model is not None])
        except Server.RelationNotSpecified:
            # custom logic here
            pass

    def compute_storage(self):
        try:
            mobos = self._get_mobos()
            disks = [disk for m in mobos for disk in m.disk_set.all()]
            self.memory_mb = sum([disk.model.capacity_gb for disk in disks if disk.model is not None])
        except Server.RelationNotSpecified:
            pass

    def compute_stats(self):
        self.compute_cpus()
        self.compute_memory()
        self.compute_storage()

    def save(self, *args, **kwargs):
        fqdn = getattr(self, 'name', None)  # or getattr(self, 'dns_name', None)
        if fqdn:
            self.domain = self.extract_domain(fqdn)
            if not self.domain:
                fqdn = getattr(self, 'dns_name', None)
                if fqdn:
                    self.domain = self.extract_domain(fqdn)
        self.compute_stats()
        super(Server, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if hasattr(self, 'esxi'):
            if hasattr(self.esxi, 'esxi_virtual_machines'):
                self.esxi.esxi_virtual_machines.all().delete()
        super(Server, self).delete(*args, **kwargs)

    @property
    def organization_id(self):
        org = self.customer
        return org.id if org else None

    class Meta:
        verbose_name = 'Server'
        default_related_name = 'servers'
        permissions = (('view', 'Can view system'),)


class HypervisorManager(ServerDeviceManager):

    def get_queryset(self):
        queryset = super(HypervisorManager, self).get_queryset()
        return queryset.filter(
            instance__isnull=False,
            instance__instance_type='Hypervisor'
        )

    def create(self, *args, **kwargs):
        server = Server.objects.create(*args, **kwargs)
        # this is to avoid cyclic import
        from app.server.models import Instance
        # Adding Hypervisor Instance object
        instance = server.instance if hasattr(server, 'instance') else Instance()
        instance.virtualization_type = kwargs.pop('virtualization_type', 'ESXi')
        instance.customer = server.customer
        instance.instance_type = 'Hypervisor'
        instance.name = server.name
        instance.os = server.os
        instance.system = server
        instance.save()
        return server


class BareMetalManager(ServerDeviceManager):

    def get_queryset(self):
        queryset = super(BareMetalManager, self).get_queryset()
        return queryset.filter(
            bm_server__isnull=False
        )

    def create(self, *args, **kwargs):
        bmc_type = kwargs.pop('bmc_type', None)
        version = kwargs.pop('version', None)
        ip = kwargs.pop('ip', None)
        username = kwargs.pop('username', None)
        password = kwargs.pop('password', None)
        proxy_url = kwargs.pop('proxy_url', None)

        server = Server.objects.create(*args, **kwargs)
        # Adding Hypervisor Instance object
        bms = server.bm_server if hasattr(server, 'bm_server') else BMServer()
        bms.server = server
        bms.management_ip = server.management_ip
        bms.os = server.os
        bms.bmc_type = bmc_type
        bms.save()
        bms.save_controller(
            bmc_type=bmc_type,
            version=version,
            ip=ip,
            username=username,
            password=password,
            proxy_url=proxy_url
        )

        return server


class Hypervisor(Server):
    DEVICE_TYPE = Device.hypervisor
    objects = HypervisorManager()

    class Meta:
        proxy = True


class BareMetal(Server):
    DEVICE_TYPE = Device.bms  # add this type to Device class
    objects = BareMetalManager()

    class Meta:
        proxy = True


class BMServer(InventoryModel, BMCBMServerMixin, SoftDeleteMixin, LifeCycleStageMixin, LifeCycleStageStatusMixin):
    DEVICE_TYPE = Device.bms
    DEVICE_CATEGORY = Device.server_device

    BMC_TYPE_CHOICES = (
        ('IPMI', 'IPMI'),
        ('DRAC', 'DRAC'),
        ('None', 'None')
    )
    server = models.OneToOneField(Server, related_name='bm_server', on_delete=models.CASCADE)
    management_ip = models.GenericIPAddressField(null=True, blank=True)
    # management_ip = models.CharField(max_length=40, null=True)
    os = models.ForeignKey(OperatingSystem, null=True, blank=True)
    # bmc stands for Baseboard Management Controller, Types can be IPMI/DRAC
    bmc_type = models.CharField(max_length=15, choices=BMC_TYPE_CHOICES, null=True, blank=True)
    database_server = GenericRelation('DatabaseServer', object_id_field='device_id')
    domain = models.CharField(max_length=255, null=True, blank=True)

    objects = DeviceCommonBaseManager()

    @property
    def ip_address(self):
        return self.server.ip_address

    @property
    def address(self):
        return self.ip_address or self.management_ip

    @property
    def datacenter(self):
        return self.server.datacenter

    @property
    def manufacturer(self):
        return self.server.manufacturer

    @property
    def bm_controller(self):
        if self.bmc_type == "IPMI" and hasattr(self, 'ipmi_bm_server'):
            return self.ipmi_bm_server
        if self.bmc_type == "DRAC" and hasattr(self, 'drac_bm_server'):
            return self.drac_bm_server
        return None

    @property
    def power_status(self):
        try:
            bm_controller = self.bm_controller
            if bm_controller:
                return bm_controller.power_status
        except Exception as e:
            logger.error("Power status Error : %s", e)
        return {"power_status": None}

    @property
    def collector(self):
        return self.server.collector

    def save_controller(self, **kwargs):
        controller = None
        bmc_type = kwargs.get('bmc_type')
        version = kwargs.get('version')
        ip = kwargs.get('ip')
        username = kwargs.get('username')
        password = kwargs.get('password')
        proxy_url = kwargs.get('proxy_url')

        if bmc_type is None:
            return
        elif bmc_type is not None and ip is None:
            return

        if bmc_type == 'IPMI':
            controller = self.ipmi_bm_server if hasattr(
                self, 'ipmi_bm_server'
            ) else IPMIController(bm_server=self)
        elif bmc_type == 'DRAC':
            controller = self.drac_bm_server if hasattr(
                self, 'drac_bm_server'
            ) else DRACController(bm_server=self)
            controller.version = version

        if controller:
            controller.bm_server = self
            controller.ip = ip

            if username is not None and password is not None:
                controller.username = username
                controller.password = password
            controller.proxy_url = proxy_url
            controller.save()

    def power_off(self):
        try:
            bm_controller = self.bm_controller
            if bm_controller:
                return bm_controller.power_off()
        except Exception as e:
            logger.error("Power off Error : %s", e)
        return {"power_status": None}

    def power_on(self):
        try:
            bm_controller = self.bm_controller
            if bm_controller:
                return bm_controller.power_on()
        except Exception as e:
            logger.error("Power on Error : %s", e)
        return {"power_status": None}

    def chassis_statistics(self):
        try:
            bm_controller = self.bm_controller
            logger.debug(bm_controller)
            if bm_controller:
                return bm_controller.chassis_statistics()
        except Exception as e:
            logger.error("Chassis status Error : %s", e)
        return {"chassis_status": None}

    def blink(self, interval):
        try:
            bm_controller = self.bm_controller
            if bm_controller:
                return self.bm_controller.blink(interval)
        except Exception as e:
            logger.error("Blink status Error : %s", e)
        return {"blink_status": None}

    @property
    def organization_id(self):
        org = self.server.customer
        return org.id if org else None

    def extract_domain(self, fqdn):
        if fqdn:
            parts = fqdn.split('.')
            if len(parts) > 1:
                return '.'.join(parts[-2:])
        return None

    def save(self, *args, **kwargs):
        fqdn = getattr(self, 'name', None)  # or getattr(self, 'dns_name', None)
        if fqdn:
            self.domain = self.extract_domain(fqdn)
            if not self.domain:
                fqdn = getattr(self, 'dns_name', None)
                if fqdn:
                    self.domain = self.extract_domain(fqdn)
        super(BMServer, self).save(*args, **kwargs)

    def running_status(self):
        return self.server.running_status()

    def monitoring_alerts(self, *args, **kwargs):
        return self.server.monitoring_alerts(*args, **kwargs)

    def __unicode__(self):
        return self.server.name

    def __repr__(self):
        return u'%s' % self.server.name

    class Meta:
        verbose_name = 'Bare metal'


class BaseController(object):

    def __init__(self):
        from app.organization.models import Organization
        self.org = Organization.objects.get(id=self.organization_id)
        self.agent = self.org.agents.all().first() if self.org else None
        if self.agent:
            self.pyro = __import__('Pyro4')
            connection = "PYRO:Agent@{}:{}".format(self.agent.ip_address, self.agent.pyro_port)
            self.connect = self.pyro.core.Proxy(connection)
        else:
            self.connect = None

    def ipmi_post_request(self, action, text=False):
        agent = self.agent
        url = 'https://' + agent.ip_address + '/' + action
        data = {
            'ip': self.ip,
            'username': self.username,
            'password': self.password
        }
        response = requests.post(
            url,
            auth=HTTPBasicAuth(agent.web_username, agent.web_password),
            data=data,
            verify=False
        )
        try:
            if text:
                return response.text
            return response.json()
        except Exception as e:
            logger.error("%s", e)
            logger.error("Error in response : %s", response.text)
            raise e

    def check_status(self, output):
        logger.debug("IPMI check output : %s", output)
        if output == "Chassis Power is on\n" or output == "Chassis Power Control: Up/On\n":
            return {"power_status": True}
        elif output == "Chassis Power is off\n" or output == "Chassis Power Control: Down/Off\n":
            return {"power_status": False}
        else:
            return {"power_status": None}

    @property
    def power_status(self):

        def api():
            logger.debug("BM Server Power status from Agent API")
            try:
                return self.ipmi_post_request('ipmi_power_status')
            except Exception as e:
                logger.error("Agent API connection error : %s", e)
                pass
            return {"power_status": None}

        def agent():
            logger.debug("BM Server Power status from Pyro")
            if self.connect:
                try:
                    response = self.connect.ipmi_power_status(self.ip, self.password, self.username)
                    return response
                except self.pyro.errors.CommunicationError as ce:
                    logger.error("Cumminication error : %s", ce)
                    return api()
            return {"power_status": None}

        def local():
            ipmi_tool = ipmitool(self.ip, self.password, self.username)
            ipmi_tool.chassis_status()
            status = self.check_status(ipmi_tool.output)
            logger.debug("BM Server Power status")
            return status

        if self.agent:
            return agent()
        else:
            return local()

    def power_off(self):

        def api():
            logger.debug("BM Server Power Off from Agent API")
            try:
                return self.ipmi_post_request('ipmi_power_off')
            except Exception as e:
                logger.error("Agent API connection error : %s", e)
                pass
            return {"power_status": None}

        def agent():
            logger.debug("BM Server Power off from Pyro")
            if self.connect:
                try:
                    response = self.connect.ipmi_power_off(self.ip, self.password, self.username)
                    return response
                except self.pyro.errors.CommunicationError as ce:
                    logger.error("Cumminication error : %s", ce)
                    return api()
            return {"power_status": None}

        def local():
            ipmi_tool = ipmitool(self.ip, self.password, self.username)
            ipmi_tool.chassis_off()
            status = self.check_status(ipmi_tool.output)
            pstatus = status.get("power_status")
            logger.info("Power Status after turning off : %s", pstatus)
            while pstatus:
                pstatus = self.check_status(ipmi_tool.output).get("power_status")
            return status

        if self.agent:
            return agent()
        else:
            return local()

    def power_on(self):

        def api():
            logger.debug("BM Server Power On from Agent API")
            try:
                return self.ipmi_post_request('ipmi_power_on')
            except Exception as e:
                logger.error("Agent API connection error : %s", e)
                pass
            return {"power_status": None}

        def agent():
            logger.debug("BM Server Power on from Pyro")
            if self.connect:
                try:
                    response = self.connect.ipmi_power_on(self.ip, self.password, self.username)
                    return response
                except self.pyro.errors.CommunicationError as ce:
                    logger.error("Cumminication error : %s", ce)
                    return api()
            return {"power_status": None}

        def local():
            ipmi_tool = ipmitool(self.ip, self.password, self.username)
            ipmi_tool.chassis_on()
            status = self.check_status(ipmi_tool.output)
            pstatus = status.get("power_status")
            logger.info("Power Status after turning on : %s", pstatus)
            while not pstatus:
                pstatus = self.check_status(ipmi_tool.output).get("power_status")
            return status

        if self.agent:
            return agent()
        else:
            return local()

    def chassis_statistics(self):

        def api():
            logger.debug("BM Server Chassis Stats from Agent API")
            try:
                return self.ipmi_post_request('ipmi_chassis_statistics', text=True)
            except Exception as e:
                logger.error("Agent API connection error : %s", e)
                pass
            return None

        def agent():
            logger.debug("BM Server Chassis Stats from Pyro")
            if self.connect:
                try:
                    response = self.connect.ipmi_chassis_statistics(self.ip, self.password, self.username)
                    return response
                except self.pyro.errors.CommunicationError as ce:
                    logger.error("Cumminication error : %s", ce)
                    return api()
            return None

        def local():
            ipmi_tool = ipmitool(self.ip, self.password, self.username)
            ipmi_tool.chassis_statistics()
            logger.debug("chassis statistics : %s", ipmi_tool.output)
            if ipmi_tool.output:
                return ipmi_tool.output
            else:
                return None

        if self.agent:
            return agent()
        else:
            return local()

    def blink(self, interval):

        def api():
            logger.debug("BM Server Blinking from Agent API")
            try:
                return self.ipmi_post_request('ipmi_blink')
            except Exception as e:
                logger.error("Agent API connection error : %s", e)
                pass
            return {"blink_status": False}

        def agent():
            logger.debug("BM Server Blinking from Pyro")
            if self.connect:
                try:
                    response = self.connect.ipmi_blink(self.ip, self.password, self.username, interval)
                    return response
                except self.pyro.errors.CommunicationError as ce:
                    logger.error("Cumminication error : %s", ce)
                    return api()
            return {"blink_status": False}

        def local():
            ipmi_tool = ipmitool(self.ip, self.password, self.username)
            ipmi_tool.chassis_blink(interval)
            logger.debug("blinking response : %s", ipmi_tool.output)
            if ipmi_tool.output == "Chassis identify interval: 2 seconds\n":
                return {"blink_status": True}
            else:
                return {"blink_status": False}

        if self.agent:
            return agent()
        else:
            return local()

    @property
    def organization_id(self):
        org = self.bm_server.server.customer
        return org.id if org else None


class IPMIController(models.Model, BaseController):
    bm_server = models.OneToOneField(
        BMServer, related_name='ipmi_bm_server', on_delete=models.CASCADE
    )
    ip = models.CharField(max_length=40, null=True, blank=True)
    username = models.CharField(max_length=20, null=True, blank=True)
    password = EncryptedPasswordField(null=True)
    proxy_url = models.CharField(max_length=100, null=True, blank=True)

    def __repr__(self):
        return u'IPMI-%s' % self.ip

    class Meta:
        verbose_name = 'IPMI'


class DRACController(models.Model, BaseController):
    VERSION_CHOICES = (
        (5, '5 or lesser'),
        (6, 'v6'),
        (7, 'v7'),
        (8, 'v8'),
    )
    bm_server = models.OneToOneField(
        BMServer, related_name='drac_bm_server', on_delete=models.CASCADE
    )
    version = models.IntegerField(choices=VERSION_CHOICES)
    ip = models.CharField(max_length=40, null=True, blank=True)
    username = models.CharField(max_length=20, null=True, blank=True)
    password = EncryptedPasswordField(null=True)
    proxy_url = models.CharField(max_length=100, null=True, blank=True)

    def chassis_statistics(self):
        ipmi_tool = ipmitool(self.ip, self.password, self.username)
        ipmi_tool.chassis_statistics("full")
        return ipmi_tool.output

    def __repr__(self):
        return u'DRAC-%s' % self.ip

    class Meta:
        verbose_name = 'DRAC'


class SAN(InventoryModel, AssetMixin, UserStampModel, ComputeMixin, NonstrictSalesforceMixin, ServerMixin):
    FK_KWARGS = dict(null=True, related_name='sans', on_delete=models.SET_NULL)

    cabinet = models.ForeignKey('datacenter.Cabinet', **FK_KWARGS)
    customer = models.ForeignKey('organization.Organization', **FK_KWARGS)
    os = models.ForeignKey(OperatingSystem, **FK_KWARGS)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    snmp_community = EncryptedPasswordField(null=True)

    @property
    def organization_id(self):
        return self.customer.id

    def __unicode__(self):
        return u'%s: %s : %s' % (self.asset_tag, self.name, self.manufacturer)

    def __repr__(self):
        return u'%s: %s : %s' % (self.asset_tag, self.name, self.manufacturer)

    def save(self, *args, **kwargs):
        super(SAN, self).save(*args, **kwargs)

    class Meta:
        verbose_name = 'SAN'


class VirtualMachine(ComputeMixin, TagMixin, SNMPDeviceMixin, ObserviumMonitoringEnablerMixin,
                     MonitoringMethodsMixin, VMDetailMixin, DeviceCollectorMixin,
                     DeviceCredentialsMixin, CustomAttributeMixin, DeviceCTIMixin):
    """
    Represents the virtualized "hardware" configuration of a VM.

    `cluster` is an outdated field that was intended for use with pods
    """
    DEVICE_TYPE = Device.vm
    DEVICE_CATEGORY = Device.virtual_device
    PLATFORM_TYPE = Device.customvm
    WATCH_RELATED_NAME = 'customvm_watch'
    VM_CHOICES = (
        ('Docker', 'Docker'),
        ('Hyper-V', 'Hyper-V'),
        ('KVM', 'KVM'),
        ('LXC', 'LXC'),
        ('QEMU', 'QEMU'),
        ('VMware ESXi', 'VMware ESXi'),
        ('Xen', 'Xen'),
        ('Oracle VM', 'Oracle VM'),
    )

    name = models.CharField(
        max_length=128,
        blank=True,
        null=True
    )
    ethports = models.IntegerField(
        default=2,
        validators=[MinValueValidator(1), MaxValueValidator(32)]
    )
    server = models.ForeignKey(
        Server,
        db_column='system_id',
        null=True,
        blank=False
    )
    cluster = models.ForeignKey(
        'Cluster',
        null=True,
        blank=False
    )
    customer = models.ForeignKey(
        'organization.Organization',
        null=True,
        blank=True
    )
    os = models.ForeignKey(
        'inventory.OperatingSystem',
        null=True,
        blank=True
    )
    management_ip = models.GenericIPAddressField(null=True, blank=True)
    interfaces = JSONField(null=True)
    database_server = GenericRelation(
        'DatabaseServer',
        object_id_field='device_id'
    )
    vm_type = models.CharField(max_length=64, choices=VM_CHOICES, null=True, blank=True)
    last_known_state = models.CharField(max_length=128, null=True, blank=True)
    last_checked = models.DateTimeField(null=True, blank=True)
    uuid = models.UUIDField(null=True, blank=True, verbose_name='UUID', default=generate_uuid)
    private_cloud = models.ForeignKey(
        'CloudService.PrivateCloud',
        null=True,
        related_name='vms',
        on_delete=models.SET_NULL
    )
    _zabbix = GenericRelation(
        'zabbix.ZabbixHostCustomVMMap',
        object_id_field='device_id',
        for_concrete_model=False
    )
    # _events = GenericRelation('aiops.Event', object_id_field='device_id')
    domain = models.CharField(max_length=255, null=True, blank=True)

    def get_customer(self):
        return self.customer

    @property
    def organization_id(self):
        return self.customer.id

    @property
    def operating_system(self):
        return self.os.name

    @property
    def org_name(self):
        return self.customer.name

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    @property
    def health_status(self):
        if hasattr(self, 'observium_custom_vm'):
            return self.observium_custom_vm.observium_status()

    def mem_gb(self):
        factor = 1
        if self.memory_measuretype == u'TB':
            factor = 1024
        elif self.memory_measuretype == u'MB':
            # ignore MB vms for now
            factor = 0
        return self.memory * factor

    def extract_domain(self, fqdn):
        if fqdn:
            parts = fqdn.split('.')
            if len(parts) > 1:
                return '.'.join(parts[-2:])
        return None

    class Meta:
        verbose_name = 'Virtual Machine'
        db_table = 'virtualsystem'
        ordering = ['name']
        permissions = (('view', 'Can view virtualsystem'),)
        unique_together = ('name', 'customer')

    def save(self, *args, **kwargs):
        """
        If the customer field is not present, it will be populated from the related System model object.
        """
        fqdn = getattr(self, 'name', None)
        if fqdn:
            self.domain = self.extract_domain(fqdn)
            if not self.domain:
                fqdn = getattr(self, 'dns_name', None)
                if fqdn:
                    self.domain = self.extract_domain(fqdn)
        if self.customer is None:
            self.customer = self.server.customer
        super(VirtualMachine, self).save(*args, **kwargs)


class SystemPowerSupplyPort(models.Model):
    """
    """
    name = models.CharField(max_length=45)

    def __unicode__(self):
        return u'%s' % self.id

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        verbose_name = 'System power supply'
        db_table = 'systempowersupplyport'


class CustomerDatacenterMview(models.Model):
    objects = MaterializedViewManager()

    organization = models.ForeignKey('organization.Organization',
                                     db_column='organization_id',
                                     on_delete=models.DO_NOTHING)
    datacenter = models.ForeignKey('datacenter.Datacenter',
                                   db_column='datacenter_id',
                                   on_delete=models.DO_NOTHING)

    class Meta:
        db_table = 'organization_datacenter_mview'
        managed = False


# @receiver(post_save, sender='datacenter.Cabinet')
# @receiver(post_save, sender='datacenter.Cage')
# @receiver(post_save, sender='datacenter.Datacenter')
# @receiver(post_save, sender=Switch)
# @receiver(post_save, sender=Firewall)
# @receiver(post_save, sender=LoadBalancer)
# @receiver(post_save, sender=Server)
# @receiver(post_save, sender=TerminalServer)
# @receiver(post_save, sender=PDU)
# @receiver(post_delete, sender='datacenter.Cabinet')
# @receiver(post_delete, sender='datacenter.Cage')
# @receiver(post_delete, sender='datacenter.Datacenter')
# @receiver(post_delete, sender=Switch)
# @receiver(post_delete, sender=Firewall)
# @receiver(post_delete, sender=LoadBalancer)
# @receiver(post_delete, sender=Server)
# @receiver(post_delete, sender=TerminalServer)
# @receiver(post_delete, sender=PDU)
# def refresh_mviews(sender, **kwargs):
#     CustomerDatacenterMview.objects.refresh()


class ServerComponentStatsMview(models.Model):
    objects = MaterializedViewManager()

    server = models.OneToOneField(Server,
                                  primary_key=True,
                                  db_column='server_id',
                                  related_name='stats',
                                  on_delete=models.DO_NOTHING)
    cpu_cores = models.IntegerField(null=True)
    cpu_threads = models.IntegerField(null=True)
    disk_gb = models.IntegerField(null=True)
    memory_mb = models.IntegerField(null=True)

    @property
    def organization_id(self):
        return self.server.customer.id

    class Meta:
        db_table = 'server_component_stats_mview'
        managed = False


class AgentMap(models.Model):
    """
    This class provides mapping to zabbix agents
    """
    # agent_name = models.CharField(max_length=128, blank=False, null=True)
    file_path = models.CharField(max_length=200, blank=False, null=True)
    os_distribution = models.CharField(max_length=128, blank=False)
    os_version = models.CharField(max_length=20, blank=True, null=True)
    hardware = models.CharField(max_length=128, blank=True, null=True)
    zabbix_version = models.CharField(max_length=20, blank=True, null=True)
    encryption = models.CharField(max_length=128, blank=True, null=True)
    packaging = models.CharField(max_length=128, blank=True, null=True)


class Tag(models.Model):
    """
    Tags for each device
    Related by a many to many field
    """
    tag_name = models.CharField(max_length=128, blank=False, null=True)
    uuid = models.UUIDField(default=generate_uuid)
    customer = models.ForeignKey('organization.Organization', null=True, blank=True)

    def __unicode__(self):
        return u'%s' % self.tag_name

    def __repr__(self):
        return u'%s' % self.tag_name

    class Meta:
        unique_together = ('tag_name', 'customer',)


class NeighborInformationManager(models.Manager):

    def connection_exists(self, uuid1, uuid2):
        return self.filter(Q(source_uuid=uuid1) | Q(target_uuid=uuid1), Q(target_uuid=uuid2) | Q(source_uuid=uuid2)).exists()


class NeighborInformation(models.Model):
    """
    This model saved the neighbor information
    for devices onboarded into unity.

    target_uuids is a JSONField. It holds alist
    of dicts containing neighbor device attributes.

    target_uuids = [
        {
            'ip': '10.192.0.4',
            'hostname': 'hn1',
            'device_type': 'switch',
            'target_db_pk': int,
            'target-db_uuid': str,
            'onboarded': true
        },
    ]
    """

    customer = models.ForeignKey(
        'organization.Organization', null=False, blank=False
    )
    source_uuid = models.CharField(max_length=128, null=False, blank=True)
    target_uuid = models.CharField(max_length=128, null=False, blank=True)
    target_info = JSONField(null=True)

    objects = NeighborInformationManager()

    def __repr__(self):
        return u'%s' % self.source_uuid


@receiver(post_save, sender=Disk)
@receiver(post_save, sender=DiskModel)
@receiver(post_save, sender=Memory)
@receiver(post_save, sender=MemoryModel)
@receiver(post_save, sender=Server)
@receiver(post_delete, sender=Disk)
@receiver(post_delete, sender=DiskModel)
@receiver(post_delete, sender=Memory)
@receiver(post_delete, sender=MemoryModel)
@receiver(post_delete, sender=Server)
def refresh_server_disk(sender, **kwargs):
    ServerComponentStatsMview.objects.refresh()


@receiver(post_save, sender=IPMIController)
def update_zabbix_host(sender, instance, **kwargs):
    """
    This signal is called everytime bmc details
    are edited for a bm server.

    We need the updated details to show in Zabbix.
    This function ensures that Zabbix host is
    updated whenever the details are edited.
    """
    try:
        obj = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        # Object is new, so field hasn't technically changed
        pass
    else:
        if obj.bm_server.server.zabbix:
            obj.bm_server.server.zabbix.save()


class InfrastructureData(models.Model):
    uuid = models.UUIDField(default=generate_uuid)
    customer = models.ForeignKey('organization.Organization', on_delete=models.CASCADE)
    device_status_data = JSONField(null=True, default=dict)
    device_manufacturer_data = JSONField(null=True, default=dict)
    device_models_data = JSONField(null=True, default=dict)
    device_type_data = JSONField(null=True, default=dict)

    def __str__(self):
        return "Infrastructure Summary Data for {}".format(self.customer.name)


class HypervisorStorageDevices(models.Model):
    DEVICE_TYPE = Device.server_storage_device

    uuid = models.UUIDField(default=generate_uuid)
    hypervisor = models.ForeignKey(Server, on_delete=models.CASCADE)
    key = models.TextField(blank=True, null=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    path = models.TextField(blank=True, null=True)
    capacity = models.BigIntegerField(default=0)
    operational_state = models.CharField(max_length=100, blank=True, null=True)
    type = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.name

    @property
    def organization_id(self):
        return self.server.customer.id

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name


class HypervisorStorageAdapters(models.Model):
    DEVICE_TYPE = Device.server_storage_adapter

    uuid = models.UUIDField(default=generate_uuid)
    hypervisor = models.ForeignKey(Server, on_delete=models.CASCADE)
    key = models.TextField(blank=True, null=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    model = models.CharField(max_length=255, blank=True, null=True)
    type = models.CharField(max_length=50, null=True, blank=True)
    status = models.CharField(max_length=100, blank=True, null=True)
    targets = models.IntegerField(default=0)
    devices = models.IntegerField(default=0)
    paths = models.IntegerField(default=0)

    def __str__(self):
        return self.name

    @property
    def organization_id(self):
        return self.server.customer.id

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name


class HypervisorFirewalls(models.Model):
    DEVICE_TYPE = Device.server_firewall

    uuid = models.UUIDField(default=generate_uuid)
    hypervisor = models.ForeignKey(Server, on_delete=models.CASCADE)
    key = models.TextField(blank=True, null=True)
    service_name = models.CharField(max_length=255, blank=True, null=True)
    enabled = models.BooleanField(default=False)
    allowed_ip_addresses = models.TextField(blank=True, null=True)
    rule = JSONField(null=True)

    def __str__(self):
        return self.service_name

    @property
    def organization_id(self):
        return self.server.customer.id

    @property
    def name(self):
        return self.service_name

    def __unicode__(self):
        return u'%s' % self.service_name

    def __repr__(self):
        return u'%s' % self.service_name


class HypervisorVirtualSwitches(models.Model):
    DEVICE_TYPE = Device.server_virtual_switch

    uuid = models.UUIDField(default=generate_uuid)
    hypervisor = models.ForeignKey(Server, on_delete=models.CASCADE)
    key = models.TextField(blank=True, null=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    physical_adapter = ArrayField(models.CharField(max_length=255, null=True, blank=True), null=True, blank=True)
    portgroup = ArrayField(models.CharField(max_length=255, null=True, blank=True), null=True, blank=True)

    def __str__(self):
        return self.name

    @property
    def organization_id(self):
        return self.server.customer.id

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name


class HypervisorVMkernelAdapters(models.Model):
    DEVICE_TYPE = Device.server_kernel_adapter

    uuid = models.UUIDField(default=generate_uuid)
    hypervisor = models.ForeignKey(Server, on_delete=models.CASCADE)
    key = models.TextField(blank=True, null=True)
    device = models.CharField(max_length=255, blank=True, null=True)
    network_label = models.CharField(max_length=255, null=True, blank=True)
    switch = models.ForeignKey(HypervisorVirtualSwitches, null=True, blank=True)
    ip_address = models.CharField(max_length=100, null=True, blank=True)
    mac_address = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.device

    @property
    def organization_id(self):
        return self.server.customer.id

    @property
    def name(self):
        return self.device

    def __unicode__(self):
        return u'%s' % self.device

    def __repr__(self):
        return u'%s' % self.device


class HypervisorPhysicalAdapters(models.Model):
    DEVICE_TYPE = Device.server_physical_adapter

    uuid = models.UUIDField(default=generate_uuid)
    hypervisor = models.ForeignKey(Server, on_delete=models.CASCADE)
    key = models.TextField(blank=True, null=True)
    device = models.CharField(max_length=255, blank=True, null=True)
    configured_speed = models.CharField(max_length=255, null=True, blank=True)
    actual_speed = models.CharField(max_length=255, blank=True, null=True)
    switch = models.ForeignKey(HypervisorVirtualSwitches, null=True, blank=True)
    ip_address = models.CharField(max_length=100, null=True, blank=True)
    mac_address = models.CharField(max_length=100, null=True, blank=True)
    wake_on_LAN_supported = models.BooleanField(default=False)

    def __str__(self):
        return self.device

    @property
    def organization_id(self):
        return self.server.customer.id

    @property
    def name(self):
        return self.device

    def __unicode__(self):
        return u'%s' % self.device

    def __repr__(self):
        return u'%s' % self.device


class CustomAttribute(models.Model):
    """
        Custom Attribute for All Device Tables (Switch, Firewall, etc)
    """
    VALUE_TYPE_CHOICES = (
        ("Boolean", "Boolean"),
        ("Char", "Char"),
        ("Choice", "Choice"),
        ("Integer", "Integer")
    )
    uuid = models.UUIDField(default=generate_uuid, unique=True, editable=False)
    name = models.CharField(max_length=128, blank=True, null=True)
    resource_type = models.CharField(max_length=128, blank=True, null=True)
    value_type = models.CharField(max_length=128, choices=VALUE_TYPE_CHOICES, blank=True, null=True)
    choice_values = ArrayField(
        models.CharField(max_length=256, blank=True, null=True),
        blank=True,
        null=True
    )  # only for value_type as choices
    default_value = models.CharField(max_length=256, blank=True, null=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    created_at = models.DateTimeField(editable=False, auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        "user2.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="custom_attribute_created_by"
    )
    updated_by = models.ForeignKey(
        "user2.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="custom_attribute_updated_by"
    )
    customer = models.ForeignKey("organization.Organization", on_delete=models.CASCADE)

    def __str__(self):
        return "{} - {} for {} table".format(self.name, self.resource_type, self.content_type.model)

    @property
    def organization_id(self):
        return self.customer.id

    @property
    def org_name(self):
        return self.customer.name


class NetworkDevicesGroup(JobScheduleModelMixin, JobScheduleNotifyMixin):
    '''
        This Model stores group of devices that have the Network Configuration Enabled
        to capture the configuration data periodically for each device.
    '''
    TASK_PATH = 'app.inventory.tasks.sync_device_group_configurations'

    uuid = models.UUIDField(default=generate_uuid, unique=True, editable=False)
    name = models.CharField(max_length=128, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    switches = models.ManyToManyField(Switch, blank=True)
    firewalls = models.ManyToManyField(Firewall, blank=True)
    load_balancers = models.ManyToManyField(LoadBalancer, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    customer = models.ForeignKey('organization.Organization', on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name

    @property
    def organization_id(self):
        return self.customer.id

    @property
    def org_name(self):
        return self.customer.name


class DeviceConfigurationData(models.Model):
    '''
        Model stores the configuration data for network devices (Switch, Firewall and Load Balancer).
    '''
    uuid = models.UUIDField(default=generate_uuid, unique=True, editable=False)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    device_type = models.CharField(max_length=128, blank=True, null=True)
    device_id = models.PositiveIntegerField(blank=True, null=True)
    device = GenericForeignKey('content_type', 'device_id')
    config_file = models.CharField(max_length=512, blank=True, null=True)  # Path to the config file
    file_password = EncryptedPasswordField(null=True)  # File Password used for file encryption for Fortinet
    is_startup_config = models.BooleanField(default=False)
    is_golden_config = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    executed_by = models.ForeignKey('user2.User', blank=True, null=True)  # Backup Taken By Unity (null) or User
    customer = models.ForeignKey('organization.Organization', on_delete=models.CASCADE)

    def __str__(self):
        return '{} - {}'.format(self.device_name, self.created_at)

    def __repr__(self):
        return '{} - {}'.format(self.device_name, self.created_at)

    @property
    def device_obj(self):
        from integ.monitoring.utils import get_model_obj
        device_model = get_model_obj(self.device_type)
        device_obj = device_model.objects.get(id=self.device_id)
        return device_obj

    @property
    def device_name(self):
        return self.device_obj.name

    @property
    def is_encrypted(self):
        if self.file_password:
            return True
        return False

    @property
    def organization_id(self):
        return self.customer.id

    @property
    def org_name(self):
        return self.customer.name


class SensorModel(IotBaseModel):
    """
        Stores different types of Sensor Device Models
    """
    manufacturer = models.ForeignKey(Manufacturer, on_delete=models.CASCADE)

    def __repr__(self):
        return '{} {}'.format(self.manufacturer.name, self.name)


class SmartPDUModel(IotBaseModel):
    """
        Stores different types of Smart PDU Models
    """
    manufacturer = models.ForeignKey(Manufacturer, on_delete=models.CASCADE)

    def __repr__(self):
        return '{} {}'.format(self.manufacturer.name, self.name)


class RfidReaderModel(IotBaseModel):
    """
        Stores different types of RFID Reader Models
    """
    manufacturer = models.ForeignKey(Manufacturer, on_delete=models.CASCADE)

    def __repr__(self):
        return '{} {}'.format(self.manufacturer.name, self.name)


class SmartPDU(DeviceCollectorMixin, DeviceCredentialsMixin, IotBaseModel, MonitoringMethodsMixin, TagMixin, SNMPDeviceMixin, SmartPDUDetailMixin):
    DEVICE_TYPE = Device.smart_pdu
    WATCH_RELATED_NAME = 'smart_pdu_watch'

    datacenter = models.ForeignKey('CloudService.ColoCloud', blank=True, null=True, on_delete=models.SET_NULL)
    cabinet = models.ForeignKey('datacenter.Cabinet', blank=True, null=True, on_delete=models.SET_NULL)
    model = models.ForeignKey(SmartPDUModel, blank=True, null=True, related_name='smart_pdus', on_delete=models.SET_NULL)
    asset_tag = models.CharField(max_length=128, blank=True, null=True)
    uptime = models.CharField(max_length=128, blank=True, null=True)
    serial_number = models.CharField(max_length=128, blank=True, null=True)
    firmware = models.CharField(max_length=128, blank=True, null=True)
    pdu_id = models.CharField(max_length=64, blank=True, null=True)
    pdu_object_oid = models.CharField(max_length=128, blank=True, null=True)
    customer = models.ForeignKey('organization.Organization', on_delete=models.CASCADE)
    _zabbix = GenericRelation('zabbix.ZabbixSmartPDUHostMap', object_id_field='device_id', for_concrete_model=False)
    # _events = GenericRelation('aiops.Event', object_id_field='device_id')
    objects = SmartPDUManager()

    def __repr__(self):
        return self.name

    def __str__(self):
        return self.name

    def configure_monitoring(self, data):
        self.connection_type = data.get('connection_type')
        self.snmp_version = data.get("snmp_version", "v2c")
        self.snmp_community = data.get("snmp_community", None)
        self.snmp_authlevel = data.get("snmp_authlevel", None)
        self.snmp_authname = data.get("snmp_authname", None)
        self.snmp_authpass = data.get("snmp_authpass", None)
        self.snmp_authalgo = data.get("snmp_authalgo", None)
        self.snmp_cryptopass = data.get("snmp_cryptopass", None)
        self.snmp_cryptoalgo = data.get("snmp_cryptoalgo", None)
        template_ids = data.get('mtp_templates', [])
        self.save()
        customer = self.customer
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
                    'Collector monitoring configuration is incomplete'
                )
            try:
                zab_obj = self._zabbix.model(
                    zabbix_customer_proxy=zabbix_customer_proxy,
                    device_object=self
                )
                if template_ids:
                    zab_obj.save(template_ids=template_ids)
                    return True
                zab_obj.save()
            except IntegrityError as e:
                raise BadRequestError(
                    'Monitoring configuration already exists for this device'
                )
        return True

    def get_status(self):
        watch_obj = self.watch
        watch_status = watch_obj.status if watch_obj else None
        status = str(watch_status) if watch_status else None
        if not status or status == '-1':
            status = '-1'
            if self.zabbix:
                zabbix_db_ip = self.zabbix.zabbix_customer_proxy.zabbix_customer.zabbix_instance.ip_address
                host_id = self.zabbix.host_id
                try:
                    status = ZabbixHosts.objects.using(zabbix_db_ip).get(host_id=host_id).status
                    status = '1' if str(status) == '0' else '0'
                except Exception as e:
                    status = '-1'
                watch_obj = self.watch
                if watch_obj:
                    watch_obj.status = status
                    watch_obj.save()
        return status

    def get_tag_names(self):
        return list(self.tags.all().values_list('name', flat=True))

    @property
    def management_ip(self):
        return self.ip_address

    @property
    def organization_id(self):
        return self.customer.id

    @property
    def org_name(self):
        return self.customer.name

    @property
    def power(self):
        power_history_qs = SmartPDUPowerHistory.objects.filter(smart_pdu=self).order_by('-recorded_at')
        latest_power = power_history_qs.first().value if len(power_history_qs) else 0
        return latest_power

    @property
    def current(self):
        current_history_qs = SmartPDUCurrentHistory.objects.filter(smart_pdu=self).order_by('-recorded_at')
        latest_current = current_history_qs.first().value if len(current_history_qs) else 0
        return latest_current

    @property
    def voltage(self):
        voltage_history_qs = SmartPDUVoltageHistory.objects.filter(smart_pdu=self).order_by('-recorded_at')
        latest_voltage = voltage_history_qs.first().value if len(voltage_history_qs) else 0
        return latest_voltage


class SmartPDUPowerHistory(models.Model):
    uuid = models.UUIDField(default=generate_uuid, editable=False, unique=True)
    value = models.FloatField(default=0.0)
    unit = models.CharField(max_length=16, blank=True, null=True)
    smart_pdu = models.ForeignKey(SmartPDU, on_delete=models.CASCADE)
    recorded_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_index=True)

    def __repr__(self):
        return '{} - {} {}'.format(self.smart_pdu.name, self.value, self.unit)

    def __str__(self):
        return '{} - {} {}'.format(self.smart_pdu.name, self.value, self.unit)


class SmartPDUCurrentHistory(models.Model):
    uuid = models.UUIDField(default=generate_uuid, editable=False, unique=True)
    value = models.FloatField(default=0.0)
    unit = models.CharField(max_length=16, blank=True, null=True)
    smart_pdu = models.ForeignKey(SmartPDU, on_delete=models.CASCADE)
    recorded_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_index=True)

    def __repr__(self):
        return '{} - {} {}'.format(self.smart_pdu.name, self.value, self.unit)

    def __str__(self):
        return '{} - {} {}'.format(self.smart_pdu.name, self.value, self.unit)


class SmartPDUVoltageHistory(models.Model):
    uuid = models.UUIDField(default=generate_uuid, editable=False, unique=True)
    value = models.FloatField(default=0.0)
    unit = models.CharField(max_length=16, blank=True, null=True)
    smart_pdu = models.ForeignKey(SmartPDU, on_delete=models.CASCADE)
    recorded_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_index=True)

    def __repr__(self):
        return '{} - {} {}'.format(self.smart_pdu.name, self.value, self.unit)

    def __str__(self):
        return '{} - {} {}'.format(self.smart_pdu.name, self.value, self.unit)


class Sensor(DeviceCollectorMixin, DeviceCredentialsMixin, IotBaseModel, MonitoringMethodsMixin, TagMixin, SNMPDeviceMixin, SensorDetailMixin):
    DEVICE_TYPE = Device.sensor
    WATCH_RELATED_NAME = 'sensor_watch'

    datacenter = models.ForeignKey('CloudService.ColoCloud', blank=True, null=True, on_delete=models.SET_NULL)
    cabinet = models.ForeignKey('datacenter.Cabinet', blank=True, null=True, on_delete=models.SET_NULL)
    model = models.ForeignKey(SensorModel, blank=True, null=True, related_name='sensors', on_delete=models.SET_NULL)
    sensor_type = models.CharField(max_length=128, blank=True, null=True, db_index=True)  # Cabinet Sensor / Roof Sensor / Environment Sensor / HVAC Sensor
    asset_tag = models.CharField(max_length=128, blank=True, null=True)
    uptime = models.CharField(max_length=128, blank=True, null=True)
    serial_number = models.CharField(max_length=128, blank=True, null=True)
    sensor_object_oid = models.CharField(max_length=128, blank=True, null=True)
    smart_pdu = models.ForeignKey(SmartPDU, blank=True, null=True, on_delete=models.SET_NULL)
    customer = models.ForeignKey('organization.Organization', on_delete=models.CASCADE)
    _zabbix = GenericRelation('zabbix.ZabbixSensorHostMap', object_id_field='device_id', for_concrete_model=False)
    # _events = GenericRelation('aiops.Event', object_id_field='device_id')
    objects = SensorManager()

    def __repr__(self):
        return self.name

    def __str__(self):
        return self.name

    def configure_monitoring(self, data):
        self.connection_type = data.get('connection_type')
        template_ids = data.get('mtp_templates', [])
        self.save()
        customer = self.customer
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
                    'Collector monitoring configuration is incomplete'
                )
            try:
                zab_obj = self._zabbix.model(
                    zabbix_customer_proxy=zabbix_customer_proxy,
                    device_object=self
                )
                if template_ids:
                    zab_obj.save(template_ids=template_ids)
                    return True
                zab_obj.save()
            except IntegrityError as e:
                raise BadRequestError(
                    'Monitoring configuration already exists for this device'
                )
        return True

    def get_status(self):
        watch_obj = self.watch
        watch_status = watch_obj.status if watch_obj else None
        status = str(watch_status) if watch_status else None
        if not status or status == '-1':
            status = '-1'
            if self.zabbix:
                zabbix_db_ip = self.zabbix.zabbix_customer_proxy.zabbix_customer.zabbix_instance.ip_address
                host_id = self.zabbix.host_id
                try:
                    status = ZabbixHosts.objects.using(zabbix_db_ip).get(host_id=host_id).status
                    status = '1' if str(status) == '0' else '0'
                except Exception as e:
                    status = '-1'
                watch_obj = self.watch
                if watch_obj:
                    watch_obj.status = status
                    watch_obj.save()
        return status

    def get_tag_names(self):
        return list(self.tags.all().values_list('name', flat=True))

    @property
    def airflow(self):
        airflow_history_qs = SensorAirflowHistory.objects.filter(sensor=self).order_by('-recorded_at')
        latest_airflow = airflow_history_qs.first().value if len(airflow_history_qs) else 0
        return latest_airflow

    @property
    def humidity(self):
        humidity_history_qs = SensorHumidityHistory.objects.filter(sensor=self).order_by('-recorded_at')
        latest_humidity = humidity_history_qs.first().value if len(humidity_history_qs) else 0
        return latest_humidity

    @property
    def management_ip(self):
        return self.ip_address

    @property
    def organization_id(self):
        return self.customer.id

    @property
    def org_name(self):
        return self.customer.name

    @property
    def temperature(self):
        temperature_history_qs = SensorTemperatureHistory.objects.filter(sensor=self).order_by('-recorded_at')
        latest_temperature = temperature_history_qs.first().value if len(temperature_history_qs) else 0
        return latest_temperature


class SensorTemperatureHistory(models.Model):
    uuid = models.UUIDField(default=generate_uuid, editable=False, unique=True)
    value = models.FloatField(default=0.0)
    unit = models.CharField(max_length=16, blank=True, null=True)
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    recorded_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_index=True)

    def __repr__(self):
        return '{} - {} {}'.format(self.sensor.name, self.value, self.unit)

    def __str__(self):
        return '{} - {} {}'.format(self.sensor.name, self.value, self.unit)


class SensorHumidityHistory(models.Model):
    uuid = models.UUIDField(default=generate_uuid, editable=False, unique=True)
    value = models.FloatField(default=0.0)
    unit = models.CharField(max_length=16, blank=True, null=True)
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    recorded_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_index=True)

    def __repr__(self):
        return '{} - {} {}'.format(self.sensor.name, self.value, self.unit)

    def __str__(self):
        return '{} - {} {}'.format(self.sensor.name, self.value, self.unit)


class SensorAirflowHistory(models.Model):
    uuid = models.UUIDField(default=generate_uuid, editable=False, unique=True)
    value = models.FloatField(default=0.0)
    unit = models.CharField(max_length=16, blank=True, null=True)
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    recorded_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_index=True)

    def __repr__(self):
        return '{} - {} {}'.format(self.sensor.name, self.value, self.unit)

    def __str__(self):
        return '{} - {} {}'.format(self.sensor.name, self.value, self.unit)


class SensorVibrationHistory(models.Model):
    uuid = models.UUIDField(default=generate_uuid, editable=False, unique=True)
    value = models.FloatField(default=0.0)
    unit = models.CharField(max_length=16, blank=True, null=True)
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    recorded_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_index=True)

    def __repr__(self):
        return '{} - {} {}'.format(self.sensor.name, self.value, self.unit)

    def __str__(self):
        return '{} - {} {}'.format(self.sensor.name, self.value, self.unit)


class RfidReader(DeviceCollectorMixin, DeviceCredentialsMixin, IotBaseModel, MonitoringMethodsMixin, TagMixin, SNMPDeviceMixin):
    DEVICE_TYPE = Device.rfid_reader
    WATCH_RELATED_NAME = 'rfid_reader_watch'

    datacenter = models.ForeignKey('CloudService.ColoCloud', blank=True, null=True, on_delete=models.SET_NULL)
    cabinet = models.ForeignKey('datacenter.Cabinet', blank=True, null=True, on_delete=models.SET_NULL)
    model = models.ForeignKey(RfidReaderModel, blank=True, null=True, related_name='rfid_readers', on_delete=models.SET_NULL)
    host = models.CharField(max_length=128, blank=True, null=True)
    asset_tag = models.CharField(max_length=128, blank=True, null=True)
    description = models.CharField(max_length=128, blank=True, null=True)
    tag_id = models.CharField(max_length=128, blank=True, null=True)
    location = models.CharField(max_length=128, blank=True, null=True)
    last_seen = models.DateTimeField(blank=True, null=True)
    rfid_object_oid = models.CharField(max_length=128, blank=True, null=True)
    customer = models.ForeignKey('organization.Organization', on_delete=models.CASCADE)
    _zabbix = GenericRelation('zabbix.ZabbixRfidReaderHostMap', object_id_field='device_id', for_concrete_model=False)
    # _events = GenericRelation('aiops.Event', object_id_field='device_id')

    def __repr__(self):
        return self.name

    def __str__(self):
        return self.name

    def configure_monitoring(self, data):
        self.connection_type = data.get('connection_type')
        template_ids = data.get('mtp_templates', [])
        self.save()
        customer = self.customer
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
                    'Collector monitoring configuration is incomplete'
                )
            try:
                zab_obj = self._zabbix.model(
                    zabbix_customer_proxy=zabbix_customer_proxy,
                    device_object=self
                )
                if template_ids:
                    zab_obj.save(template_ids=template_ids)
                    return True
                zab_obj.save()
            except IntegrityError as e:
                raise BadRequestError(
                    'Monitoring configuration already exists for this device'
                )
        return True

    def get_status(self):
        watch_obj = self.watch
        watch_status = watch_obj.status if watch_obj else None
        status = str(watch_status) if watch_status else None
        if not status or status == '-1':
            status = '-1'
            if self.zabbix:
                zabbix_db_ip = self.zabbix.zabbix_customer_proxy.zabbix_customer.zabbix_instance.ip_address
                host_id = self.zabbix.host_id
                try:
                    status = ZabbixHosts.objects.using(zabbix_db_ip).get(host_id=host_id).status
                    status = '1' if str(status) == '0' else '0'
                except Exception as e:
                    status = '-1'
                watch_obj = self.watch
                if watch_obj:
                    watch_obj.status = status
                    watch_obj.save()
        return status
