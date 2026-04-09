# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2016 UnitedLayer, LLC.
#
# All Rights Reserved.
from __future__ import absolute_import
from __future__ import unicode_literals

import datetime
from django.utils.text import slugify

from django.core.exceptions import ValidationError
from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.contrib.postgres.fields import JSONField, ArrayField
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.contrib.postgres.fields import ArrayField
from django.db.models.signals import post_save
from django.dispatch import receiver

from app.common.models import *
from app.common.utils import Device
from app.user2.models import User
from aiops.rule_builder import AiopsRuleBuilder
from commonservices.rule_builder import RuleField
from integ.salesforce.models import SalesforceMixin
from app.Utils.defines import *
from app.Utils.utility import generate_uuid
from integ.salesforce.models import NonstrictSalesforceMixin
from integ.openaudit.utils import remove_oa_org_mapping, add_oa_org_mapping
from mtp.models import MtpMixin, MtpGroup
from mtp.utils import generate_multidb_org_uuid

from django.apps import apps
from django.conf import settings
from rest.core.exceptions import BadRequestError

import phonenumbers
import random
import base64
import uuid
from functools import partial
import logging
logger = logging.getLogger(__name__)
UNITY_SUBSCRIBABLE_MODULES = (
    ('Private Cloud',),
    ('Monitoring',),
    ('Activity Log',),
    ('Alerts',),
    ('Public Cloud',),
    ('UnityConnect',),
    ('Devops-as-a-Service',),
    ('VM Backup',),
    ('VM Migration',),
    ('Deployment Engine',),
    ('Ticket Management',),
    ('Maintenance',),
    ('Datacenter',),
    ('Devices',),
    ('Services',),
    ('Business Services',),
    ('Cost Calculator',),
    ('Service Catalog',),
    ('Cabinet Vizualization',),
    ('Cloud Cost',)
)

UNITY_DEFAUL_MODULES = [
    'Dashboard',
    'Unity Feedback',
    'Documentation',
    'User Groups',
    'Import LDAP User',
    'Onboarding',
    'Integration'
]


class Organization(TimeStampModel, UserStampModel, NonstrictSalesforceMixin, MtpMixin):
    EUROPE_REGION = 11
    US_REGION = 22
    ORGANIZATION_TYPES = (
        ('INTERNAL', 'INTERNAL'),
        ('EXTERNAL', 'EXTERNAL'),
        ('PARTNER', 'PARTNER'),
        ('DEMO', 'DEMO'),
    )
    CUSTOMER_TYPES = (
        ('UL', 'UL'),
        ('EXT', 'EXT'),
    )
    MONITORING_TOOLS = (
        ('observium', 'Observium'),
        ('zabbix', 'Zabbix'),
    )
    organization_type = models.CharField(
        max_length=64,
        choices=ORGANIZATION_TYPES,
        default=ORGANIZATION_TYPES[1][0],
    )
    customer_type = models.CharField(
        max_length=64,
        choices=CUSTOMER_TYPES,
        default=CUSTOMER_TYPES[1][0],
    )
    id = models.AutoField(primary_key=True)
    name = models.CharField(
        max_length=128,
        verbose_name='Organization Name',
        unique=True
    )
    address1 = models.CharField(
        max_length=128,
        verbose_name='Address',
        null=True,
        blank=True
    )
    address2 = models.CharField(
        max_length=128,
        blank=True,
        null=True
    )
    city = models.CharField(
        max_length=128,
        default='San Francisco',
        null=True,
        blank=True
    )
    state = models.CharField(
        max_length=128,
        default='California',
        null=True,
        blank=True
    )
    postal_code = models.CharField(
        max_length=20,
        null=True,
        blank=True,
    )
    country = models.CharField(
        max_length=128,
        default='United States',
        verbose_name='Country'
    )

    location = models.CharField(
        max_length=200,
        verbose_name="Location",
        null=True,
        blank=True,
    )

    lat = models.CharField(
        max_length=64,
        verbose_name='Latitude',
        null=True,
        blank=True,
    )

    long = models.CharField(
        max_length=64,
        verbose_name='Longitude',
        null=True,
        blank=True,
    )

    domain = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        verbose_name='Domain'
    )
    email = models.EmailField(
        max_length=128,
        verbose_name='Email',
        unique=True,
        null=True,
        blank=True
    )
    phone = models.CharField(
        max_length=32,
        verbose_name='Phone',
        null=True,
        blank=True
    )
    fax = models.CharField(
        max_length=32,
        null=True,
        blank=True,
    )
    billing_street = models.CharField(
        max_length=128,
        null=True,
        blank=True
    )
    billing_city = models.CharField(
        max_length=128,
        null=True,
        blank=True
    )
    billing_state = models.CharField(
        max_length=128,
        null=True,
        blank=True
    )
    billing_postalcode = models.CharField(
        max_length=32,
        null=True,
        blank=True)
    billing_country = models.CharField(
        max_length=128,
        null=True,
        blank=True
    )
    datacenters = models.ManyToManyField('datacenter.Datacenter', through='inventory.CustomerDatacenterMview')
    sf_createdby_id = models.CharField(
        max_length=128,
        null=True,
        blank=True,
    )
    sf_lastmodifiedby_id = models.CharField(
        max_length=128,
        null=True,
        blank=True,
    )
    sf_created_date = models.DateTimeField(
        null=True,
        blank=True
    )
    sf_lastmodified_date = models.DateTimeField(
        null=True,
        blank=True,
    )
    sf_system_modstamp = models.DateTimeField(
        null=True,
        blank=True,
    )
    ulid = models.IntegerField(
        null=True,
        unique=True
    )
    is_active = models.BooleanField(default=True)
    vpn_status = models.BooleanField(default=False)
    onboarding_status = models.PositiveIntegerField(default=0)
    is_management_enabled = models.BooleanField(default=True)
    # Hierarchical Model
    parent_org = models.ForeignKey(
        'self',
        blank=True,
        null=True,
        verbose_name="Parent ID",
        db_column='parent_org_id')

    # snmp support
    default_snmp_community = EncryptedPasswordField(null=True, blank=True)
    SNMP_VERSIONS = (
        ('1', '1'),
        ('2c', '2c'),
        ('3', '3'),
    )
    default_snmp_version = models.CharField(
        max_length=10,
        choices=SNMP_VERSIONS,
        default='2c'
    )
    uuid = models.UUIDField(
        null=True,
        blank=True,
        verbose_name='UUID',
        default=generate_multidb_org_uuid
    )
    billing_enabled = models.BooleanField(default=False)
    storage = models.CharField(max_length=255, null=True, blank=True)
    _logo = models.TextField(
        db_column='logo',
        blank=True)

    unity_modules = models.ManyToManyField('organization.UnityModules')

    # monitor_by = models.CharField(
    #     max_length=64,
    #     choices=MONITORING_TOOLS,
    #     default=MONITORING_TOOLS[0][0],
    #     blank=False,
    #     null=False
    # )

    # alert_notification_config
    alerts_notification_enabled = models.BooleanField(default=False)
    notify_alerts_to = ArrayField(models.IntegerField(), blank=True, default=list)  # hold list of user ids
    finops_enabled = models.BooleanField(default=False)
    advanced_discovery = models.BooleanField(default=False)
    msp_client = models.BooleanField(default=False)

    REGIONS = (
        (EUROPE_REGION, 'Europe'),
        (US_REGION, 'US'),
    )
    region = models.PositiveSmallIntegerField(choices=REGIONS)
    mtp_group = models.ForeignKey(MtpGroup, null=True, blank=True, on_delete=models.SET_NULL)
    is_tenant_active = models.BooleanField(default=True)
    multidb = models.BooleanField(default=False)
    cmdb_reports_enabled = models.BooleanField(default=False)
    company = models.CharField(max_length=128, null=True, blank=True)
    is_rag_enabled = models.BooleanField(default=False)

    def set_data(self, logo):
        self._logo = base64.encodestring(logo)

    def get_data(self):
        return self._logo

    logo = property(get_data, set_data)

    def __unicode__(self):
        return u'%s' % (self.name)

    def __repr__(self):
        return u'%s' % self.name

    @property
    def slug(self):
        return slugify(self.name)

    def get_rdp_proxies(self):
        rdp_url = []
        if settings.VCENTER_PROXY_GATEWAY:
            rdp_url = [agent.rdp_access_name for agent in self.agents.all()]
        return rdp_url

    class Meta:
        db_table = 'organization'
        verbose_name_plural = 'Organizations'
        permissions = (('view', 'Can View organization'),)

    @property
    def organization_name(self):
        return self.name

    @property
    def organization_id(self):
        return self.id

    @property
    def monitor_by(self):
        try:
            if self.monitoring_config.get_monitoring_configuration() == 1:
                return "observium"
            elif self.monitoring_config.get_monitoring_configuration() == 2:
                return "zabbix"
            else:
                return "hybrid"
        except Exception as e:
            logger.error(str(e))
            pass

    def clean(self):
        if self.salesforce_id and not self.id:
            if Organization.objects.filter(
                    salesforce_id__iexact=self.salesforce_id):
                raise ValidationError(
                    {'salesforce_id': 'Salesforce ID must be in unique'})

        if self.salesforce_id and self.id:
            if Organization.objects.filter(
                    salesforce_id=self.salesforce_id, id=self.id):
                pass
            else:
                if Organization.objects.filter(
                        salesforce_id__iexact=self.salesforce_id):
                    raise ValidationError(
                        {'salesforce_id': 'Salesforce ID must be in unique'})
        return

    def save(self, *args, **kwargs):
        # Below Code is for adding country code and '-'
        # if self.phone:
        #     try:
        #         p = phonenumbers.parse(self.phone, 'US')
        #         formatted = phonenumbers.format_number(p, phonenumbers.PhoneNumberFormat.INTERNATIONAL)
        #         self.phone = str(formatted)
        #     except phonenumbers.phonenumberutil.NumberParseException:
        #         pass
        if not self.salesforce_id:
            self.salesforce_id = None

        super(Organization, self).save(*args, **kwargs)
        using = kwargs.get('using')

        if not hasattr(self, 'monitoring_config'):
                OrganizationMonitoringConfig.objects.using(using).create_with_default_config(org=self)
        if not hasattr(self, 'organizationsettings'):
                OrganizationSettings.objects.using(using).create(organization=self)

    def map_zabbix_instance(self, using=None):
        if self.is_tenant_active:
            try:
                parent_zabbix_instance = self.parent_org.zabbixcustomer.zabbix_instance
                ZabbixCustomer = self.parent_org.zabbixcustomer.__class__
                zabbix_customer = ZabbixCustomer(
                    zabbix_instance=parent_zabbix_instance,
                    customer=self
                )
                zabbix_customer.save(using=using)
            except Exception as e:
                pass

    def get_email_list_to_notify(self, severity):
        emails = self.notification_group.filter(
            is_enabled=True,
            alert_type__contains=[severity],
            mode__contains=['email'],
            users__is_active=True
        ).values_list('users__email', flat=True)

        return list(set(emails))

    def get_sms_list_to_notify(self, severity):
        sms_list = list()
        sms_list_data = self.notification_group.filter(
            is_enabled=True,
            alert_type__contains=[severity],
            mode__contains=['sms'],
            users__is_active=True,
            users__phone_number__isnull=False,
        ).values('users__phone_number', 'users__carrier__sms_list')
        for sms in sms_list_data:
            carrier_sms_list = sms.get('users__carrier__sms_list')
            phone_number = sms.get('users__phone_number')
            if isinstance(carrier_sms_list, list) and carrier_sms_list and phone_number:
                sms_template = carrier_sms_list[0]
                sms_list.append(sms_template.replace('<10-digit-number>', phone_number))
        return sms_list

    def get_default_ticketing_system(self):
        from integ.ServiceNow.models import ServiceNowAccount
        account_list = list()
        default = False
        service_now_accounts = ServiceNowAccount.objects.filter(user__org=self)
        for account in service_now_accounts:
            account_dict = {'uuid': account.uuid,
                            'type': "ServiceNow",
                            'name': account.name,
                            'default': account.is_default}
            if account.is_default:
                return account, account.uuid

        dynamics_crm_accounts = self.crminstance_set.all()
        for account in dynamics_crm_accounts:
            account_dict = {'uuid': account.uuid,
                            'type': "DynamicsCrm",
                            'name': account.name,
                            'default': account.is_default}
            if account.is_default:
                return account, account.uuid

        if hasattr(self, 'ticketorganization'):

            zendesk_account = self.ticketorganization
            account_dict = {
                'uuid': zendesk_account.uuid,
                'type': "Zendesk",
                'name': "Zendesk",
                'default': not default
            }
            account_list.append(account_dict)
            return account_list

    def mtp_delete(self):
        gtext = '-Del-' + datetime.datetime.now().strftime("%m/%d/%Y-%H:%M:%S")
        self.is_active = False
        self.is_tenant_active = False
        self.name += gtext
        self.name = self.name[:128]
        if self.email:
            self.email += gtext
            self.email = self.email[:128]
        self.save()

    def get_device_by_name(self, device_name):
        device_models = Device.device_model_class_map_flat()
        for model_name, model in device_models.items():
            if model_name in ['proxmox', 'hyperv', 'g3kvm']:
                query = model.objects.filter(vm_name=device_name)
            elif model_name in ['database']:
                query = model.objects.filter(db_instance_name=device_name)
            else:
                query = model.objects.filter(name=device_name)

            if hasattr(model, 'customers'):
                query = query.filter(customers=self)
            elif hasattr(model, 'customer'):
                query = query.filter(customer=self)
            elif hasattr(model, 'cloud') and [f for f in model._meta.fields if f.attname == 'cloud']:
                query = query.filter(cloud__customer=self)
            elif hasattr(model, 'cluster'):
                query = query.filter(cluster__private_cloud__customer=self)
            elif hasattr(model, 'account'):
                if model.__name__ in ['GCPVirtualMachines']:
                    query = query.filter(account__user__org=self)
                else:
                    query = query.filter(account__customer=self)

            if len(query) >= 1:
                return query[0]
            else:
                return None

        logger.error('Device with name {} not found in any of the models in org {}'.format(device_name, str(self)))
        raise BadRequestError('Device not found in Unity. Please add the device in Unity')


# method for updating
# @receiver(post_save, sender=Organization, dispatch_uid="update_advance_discovery")
# def update_stock(sender, instance, **kwargs):
#     if instance.advanced_discovery:
#         add_oa_org_mapping(instance.id)
#     else:
#         remove_oa_org_mapping(instance.id)


class OrganizationOwner(models.Model):
    """ Each organization will have super user which is associated at the time
    of organization creation """

    organization = models.OneToOneField(
        'organization',
        related_name="Org_Owner",
        db_column='organization_id')
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        related_name='Org_Owner_ID',
        db_column='user_id')

    class Meta:
        db_table = 'organizationowner'
        verbose_name_plural = 'OrganizationOwners'
        permissions = (('view', 'Can View organization owner'),)

    def __unicode__(self):
        return self.user

    def __repr__(self):
        return self.user


class OrganizationProfiles(models.Model):
    org = models.ForeignKey(
        "Organization",
        verbose_name="Organization ID",
        db_column='organization_id')
    key = models.CharField(max_length=128, default='template_file')
    value = models.CharField(max_length=256, default='ul_template.html')

    class Meta:
        db_table = 'organizationprofile'
        verbose_name_plural = 'OrganizationProfiles'

    def __unicode__(self):
        # return '%s, %s' % (self.key, self.value)
        return '%s' % (self.value)

    def __repr__(self):
        return u'%s' % self.value

    @staticmethod
    def get_template_name(org_id):
        # Get template name from table
        template_name = OrganizationProfiles.objects.filter(
            org=org_id, key='template_file').values_list(
            'value', flat=True)
        #       obj = OrganizationProfiles.objects.filter(org_id=org_id).filter(key='template_file')
        if template_name:
            return template_name[0]
        else:
            return None


@python_2_unicode_compatible
class UserPinnedOrganizationMap(models.Model):
    user = models.ForeignKey('user2.User')
    pinned_organization = models.ForeignKey(Organization)

    def __str__(self):
        return "Pin: {0} ({1})".format(self.user.email, self.pinned_organization.name)

    def __repr__(self):
        return "Pin: {0} ({1})".format(self.user.email, self.pinned_organization.name)

    class Meta:
        db_table = 'user_organization_map'
        unique_together = (('user', 'pinned_organization'),)


class OrganizationStorageInventory(models.Model):
    org = models.ForeignKey(Organization)
    datacenter = models.ForeignKey("datacenter.Datacenter")
    label = models.CharField(max_length=255)
    storage = models.CharField(max_length=255)
    STORAGE_TYPES = (
        ('SAN', 'SAN'),
        ('DISK', 'DISK'),
    )
    storage_type = models.CharField(choices=STORAGE_TYPES, max_length=5, default='DISK')

    def __str__(self):
        return "{0} - {1}".format(self.org, self.storage)

    def __repr__(self):
        return "{0} - {1}".format(self.org, self.storage)


class UnityModules(models.Model):
    module_id = models.AutoField(primary_key=True)
    module_name = models.CharField(max_length=128)

    def __str__(self):
        return "{0}".format(self.module_name)

    def __repr__(self):
        return "{0}".format(self.module_name)


class OrganizationMonitoringConfigQuerySet(models.QuerySet):
    def create_with_default_config(self, org):
        obj = super(OrganizationMonitoringConfigQuerySet, self).create(org=org)
        for d in obj.MONITORABLE_DEVICES:
            setattr(obj, d, 'zabbix')
        obj.save()
        return obj


class OrganizationMonitoringConfig(models.Model):
    MONITORABLE_DEVICES = Device.MONITORABLE_DEVICES

    org = models.OneToOneField(Organization, related_name='monitoring_config', on_delete=models.CASCADE)
    _config = JSONField(default=dict)

    objects = OrganizationMonitoringConfigQuerySet.as_manager()

    @staticmethod
    def set_config(key, self, value):
        self._config[key] = 1 if value == 'observium' else(2 if value == 'zabbix' else 0)

    @staticmethod
    def get_config(key, self):
        val = self._config.get(key)
        return {
            'observium': val == 1,
            'zabbix': val == 2,
        }

    @property
    def azure(self):
        return {
            'observium': False,
            'zabbix': True,
        }

    @property
    def aws(self):
        return {
            'observium': False,
            'zabbix': True,
        }

    @property
    def gcp(self):
        return {
            'observium': False,
            'zabbix': True,
        }

    @property
    def gcp_vm(self):
        return {
            'observium': False,
            'zabbix': True,
        }

    @property
    def gcp_resource(self):
        return {
            'observium': False,
            'zabbix': True,
        }

    @property
    def azure_vm(self):
        return {
            'observium': False,
            'zabbix': True,
        }

    @property
    def azure_resource(self):
        return {
            'observium': False,
            'zabbix': True,
        }

    @property
    def aws_resource(self):
        return {
            'observium': False,
            'zabbix': True,
        }

    @property
    def nutanix(self):
        return {
            'observium': False,
            'zabbix': True,
        }

    @classmethod
    def set_properties(cls):
        #  dynamically add all MONITORABLE_DEVICES as properties
        for device_type in cls.MONITORABLE_DEVICES:
            setattr(cls, device_type, property(partial(cls.get_config, device_type), partial(cls.set_config, device_type)))

    def is_all_by_zabbix(self):
        value = set(self._config.values())
        if len(value) == 1 and value.pop() == 2:
            return True
        return False

    def __str__(self):
        return self.org.name

    def get_monitoring_configuration(self):
        values = set(self._config.values())
        get_value = values.pop()
        if len(values) == 0 and get_value == 1:
            return 1
        elif len(values) == 0 and get_value == 2:
            return 2
        else:
            return 3


OrganizationMonitoringConfig.set_properties()


class AlertNotificationGroupManager(models.Manager):
    """
        Manager for Alert Notification Groups
    """
    def active(self):
        return self.filter(is_enabled=True)


class AlertNotificationGroup(models.Model):
    """
        Model to Store the Alert Notification Groups that will send notifications when an AIML Event is generated from Zabbix.
    """
    ALERT_TYPE_CHOICES = (
        ('critical', 'Critical'),
        ('information', 'Information'),
        ('warning', 'Warning'),
        ('end_of_life', 'End of Life'),
        ('end_of_support', 'End of Support'),
        ('success', 'Success'),
        ('failed', 'Failed')
    )
    FILTER_TYPES = (
        ('all', 'All'),
        ('custom', 'Custom'),
        ('filters', 'Filters')
    )
    NOTIFICATION_MODES = (
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('ms_teams', 'MS Teams'),
    )
    MODULE_MODES = (
        ('aiml', 'AIML'),
        ('deprecation', 'Deprecation'),
        ('devops_automation', 'DevOps Automation'),
    )
    uuid = models.UUIDField(default=generate_uuid, unique=True)
    group_name = models.CharField(max_length=128, db_index=True)
    mode = models.CharField(max_length=16, choices=NOTIFICATION_MODES, db_index=True, default='email')
    module = models.CharField(max_length=32, choices=MODULE_MODES, db_index=True, default='aiml')
    alert_type = ArrayField(models.CharField(max_length=32, blank=True, null=True, choices=ALERT_TYPE_CHOICES))
    filter_type = models.CharField(max_length=16, db_index=True, default='all')
    description = models.CharField(max_length=512, null=True, blank=True, db_index=True)
    is_enabled = models.BooleanField(default=True, db_index=True)
    notify = models.PositiveIntegerField(null=True, blank=True)
    users = models.ManyToManyField('user2.User', blank=True, related_name="%(class)s_users")  # Applicable for Notification Modes: email, sms
    webhook_url = models.TextField(blank=True, null=True, db_index=True, max_length=512)  # Applicable for Notification Modes: ms_teams
    filter_rule_meta = RuleField(null=True)  # Applicable for Filter Type: filters (JSON same as the ones used in discovery and AIOPS)
    custom_filter_meta = JSONField(null=True)  # Applicable for Filter Type: custom ({"device_types": ["switch"], "device_list": [], "triggers": []})
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    created_by = models.ForeignKey(
        'user2.User', null=True, blank=True, on_delete=models.SET_NULL, related_name='alert_notification_group_created_by'
    )
    updated_by = models.ForeignKey(
        'user2.User', null=True, blank=True, on_delete=models.SET_NULL, related_name='alert_notification_group_updated_by'
    )
    customer = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='notification_group')
    objects = AlertNotificationGroupManager()

    def __repr__(self):
        return self.group_name

    def __str__(self):
        return self.group_name

    @property
    def organization_id(self):
        return self.customer.id

    @property
    def org_name(self):
        return self.customer.name

    @property
    def rule_builder(self):  # Applicable for Filter Type: filters
        return AiopsRuleBuilder(self.filter_rule_meta)

    def apply_filter(self, result):  # Applicable for Filter Type: filters
        return self.rule_builder.apply_filter(result)


class OrganizationSettings(models.Model):
    uuid = models.UUIDField(default=generate_uuid, unique=True)
    organization = models.OneToOneField(Organization, on_delete=models.CASCADE)
    auto_ticketing_enabled = models.BooleanField(default=False)
    auto_remediation_enabled = models.BooleanField(default=False)
    content_type = models.ForeignKey(ContentType, related_name="ticketing_system", on_delete=models.SET_NULL, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    ticketing_instance = GenericForeignKey('content_type', 'object_id')
    ticket_subject_format = models.CharField(max_length=500, null=True, blank=True)
    # SEVERITY_CHOICES = [
    # (0, None)
    # (1, 'Critical'),
    # (2, 'Warning'),
    # (3, 'Information'),]

    auto_ticketing_severity = ArrayField(models.CharField(max_length=20), blank=True, null=True)
    auto_ticketing_delay = models.IntegerField(default=70)  # Default 70 seconds
    attach_rca_to_ticket = models.BooleanField(default=False)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.organization.name

    def organization_id(self):
        return self.organization.id

# TODO this is breaking MTP and has to be revisited
# @receiver(post_save, sender=Organization)
# def create_organization_settings(sender, instance, created, **kwargs):
#     OrganizationSettings.objects.get_or_create(organization=instance)
