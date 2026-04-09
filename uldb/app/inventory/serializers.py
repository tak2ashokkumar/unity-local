# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2016 UnitedLayer, LLC.
#   All Rights Reserved.

"""serializers.py
"""

from __future__ import absolute_import
from __future__ import unicode_literals

import json
from copy import deepcopy
from collections import OrderedDict

from rest_framework import serializers

from rest.core.fields import *
from cloud.vmware.serializers import VMwareVMSerializer

from integ.networking.serializers import VirtualLoadBalancerReverseProxySerializer

from libraries.auditlog.models import LogEntry
from libraries.auditlog.diff import model_instance_diff
from django.contrib.contenttypes.models import ContentType
from django.db.models import CharField, Value
from app.rbac.models import RBACUserGroup
from app.Utils.utility import add_m2m_audit_diff, update_m2m_audit_diff
from app.user2.models import User
from synchronize.mixins import JobScheduleSerializerMixin
from rest.customer.utils import device_status


class VirtualLoadBalancerSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()
    url = serializers.HyperlinkedIdentityField(view_name='virtualloadbalancer-detail', lookup_field='id')
    name = serializers.CharField(required=True)
    model = LoadBalancerModelRelatedField(required=False, allow_null=True)
    customer = OrganizationRelatedField(required=False, allow_null=True)
    service_contracts = ServiceContractRelatedField(required=False, allow_null=True, many=True)
    vms = VirtualSystemRelatedField(required=False, allow_null=True, many=True)
    private_cloud = serializers.HyperlinkedRelatedField(view_name='privatecloud-detail',
                                                        lookup_field='uuid',
                                                        read_only=True)
    vmware_vm = VMwareVMSerializer(source='vm',
                                   read_only=True)
    api_portal = serializers.SerializerMethodField()
    proxy = VirtualLoadBalancerReverseProxySerializer(source='vlb_proxy',
                                                      read_only=True,
                                                      allow_null=True,
                                                      required=False)

    def create(self, validated_data):
        if 'service_contracts' in validated_data:
            service_contracts = validated_data.pop('service_contracts')
        else:
            service_contracts = []

        vlb = VirtualLoadBalancer.objects.create(**validated_data)
        vlb.service_contracts.add(*service_contracts)

        # For audit logging
        service_contracts_id_list = [item.id for item in service_contracts]
        ctype = ContentType.objects.get_for_model(model=VirtualLoadBalancer)
        add_m2m_audit_diff(service_contracts_id_list, vlb.id, ctype.id, 'service_contracts')
        return vlb

    def update(self, instance, validated_data):  # AssertionError: writable nested fields by default error.
        if 'service_contracts' in validated_data:
            service_contracts = validated_data.pop('service_contracts')
        else:
            service_contracts = []

        # For audit logging
        temp_ms_obj = deepcopy(instance)
        old_service_contracts_id_list = [item.id for item in instance.service_contracts.all()]
        for key, val in validated_data.items():
            setattr(instance, key, val)
        instance.save()
        instance.service_contracts.add(*service_contracts)

        service_contracts_id_list = [item.id for item in service_contracts]
        update_m2m_audit_diff(old_service_contracts_id_list, service_contracts_id_list, temp_ms_obj, instance,
                              'service_contracts',
                              VirtualLoadBalancer)
        return instance

    def get_api_portal(self, obj):
        api_info = None
        if hasattr(obj, 'api_portal') and obj.api_portal:
            ap = obj.api_portal
            api_info = obj.api_portal.uuid

        return api_info

    class Meta:
        model = VirtualLoadBalancer
        fields = '__all__'
        # exclude = ('hypervisor', )


class PDUSocketMappingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDUSocketMappings
        fields = '__all__'


class NetworkDevicesGroupSerializer(JobScheduleSerializerMixin):
    devices = serializers.SerializerMethodField()
    device_types = serializers.SerializerMethodField()
    firewalls = serializers.SerializerMethodField()
    load_balancers = serializers.SerializerMethodField()
    switches = serializers.SerializerMethodField()
    notification = serializers.SerializerMethodField()

    class Meta:
        model = NetworkDevicesGroup
        fields = (
            "uuid",
            "name",
            "description",
            "devices",
            "device_types",
            "firewalls",
            "load_balancers",
            "switches",
            "notification",
            "created_at",
            "updated_at"
        ) + JobScheduleSerializerMixin.Meta.fields

    def __init__(self, *args, **kwargs):
        super(NetworkDevicesGroupSerializer, self).__init__(*args, **kwargs)
        self.request = self.context["request"]
        self.customer = self.context["customer"]

    def validate(self, data):
        name = data.get("name")
        instance_id = self.instance.id if self.instance else None
        if NetworkDevicesGroup.objects.filter(name=name, customer=self.customer).exclude(id=instance_id).exists():
            raise serializers.ValidationError({"name": "Network Device Group Name Already Exists."})
        return data

    def create(self, validated_data):
        request = self.request
        notification = request.data.get("notification", {})
        validated_data["customer"] = self.customer
        validated_data["sync_success_notify"] = notification.get("sync_success_notify", False)
        validated_data["sync_failure_notify"] = notification.get("sync_failure_notify", False)
        return super(NetworkDevicesGroupSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        request = self.request
        notification = request.data.get("notification", {})
        validated_data["sync_success_notify"] = notification.get("sync_success_notify", instance.sync_success_notify)
        validated_data["sync_failure_notify"] = notification.get("sync_failure_notify", instance.sync_failure_notify)
        return super(NetworkDevicesGroupSerializer, self).update(instance, validated_data)

    def save(self, *args, **kwargs):
        return super(NetworkDevicesGroupSerializer, self).save(
            customer=self.customer
        )

    def get_devices(self, instance):
        firewalls = self.get_firewalls(instance)
        load_balancers = self.get_load_balancers(instance)
        switches = self.get_switches(instance)
        devices = list(firewalls) + list(load_balancers) + list(switches)
        return devices

    def get_device_types(self, instance):
        device_types = []
        if self.get_firewalls(instance):
            device_types.append("firewall")
        if self.get_load_balancers(instance):
            device_types.append("load_balancer")
        if self.get_switches(instance):
            device_types.append("switch")
        return device_types

    def get_firewalls(self, instance):
        return instance.firewalls.for_user(self.request.user).annotate(
            device_type=Value("firewall", output_field=CharField())
        ).values(
            "uuid",
            "name",
            "device_type",
            "management_ip",
            "ncm_credentials__uuid",
            "config_device_type",
            "config_file_type",
            "is_ncm_enabled",
            "is_in_progress"
        )

    def get_load_balancers(self, instance):
        return instance.load_balancers.for_user(self.request.user).annotate(
            device_type=Value("load_balancer", output_field=CharField())
        ).values(
            "uuid",
            "name",
            "device_type",
            "management_ip",
            "ncm_credentials__uuid",
            "config_device_type",
            "config_file_type",
            "is_ncm_enabled",
            "is_in_progress"
        )

    def get_switches(self, instance):
        return instance.switches.for_user(self.request.user).annotate(
            device_type=Value("switch", output_field=CharField())
        ).values(
            "uuid",
            "name",
            "device_type",
            "management_ip",
            "ncm_credentials__uuid",
            "config_device_type",
            "config_file_type",
            "is_ncm_enabled",
            "is_in_progress"
        )

    def get_notification(self, instance):
        return {
            "sync_success_notify": instance.sync_success_notify,
            "sync_failure_notify": instance.sync_failure_notify,
            "email_notify_groups": list(instance.email_notify_groups.all().values_list("uuid", flat=True)),
            "email_notify_users": list(instance.email_notify_users.all().values_list("email", flat=True))
        }

    def add_devices(self, instance, devices_data):
        devices = []
        for data in devices_data:
            device_type = data.get("device_type")
            if device_type.lower() == "firewall":
                fw_uuid = data.get("uuid")
                try:
                    fw_obj = Firewall.objects.get(uuid=fw_uuid)
                    devices.append(fw_obj.name)
                    instance.firewalls.add(fw_obj)
                except Firewall.DoesNotExist:
                    pass
            elif device_type.lower() == "load_balancer":
                lb_uuid = data.get("uuid")
                try:
                    lb_obj = LoadBalancer.objects.get(uuid=lb_uuid)
                    devices.append(lb_obj.name)
                    instance.load_balancers.add(lb_obj)
                except LoadBalancer.DoesNotExist:
                    pass
            elif device_type.lower() == "switch":
                sw_uuid = data.get("uuid")
                try:
                    sw_obj = Switch.objects.get(uuid=sw_uuid)
                    devices.append(sw_obj.name)
                    instance.switches.add(sw_obj)
                except Switch.DoesNotExist:
                    pass
        return devices

    def add_user_groups(self, instance, group_uuids):
        user_groups = RBACUserGroup.objects.filter(uuid__in=group_uuids)
        instance.email_notify_groups.set(user_groups)
        groups = list(user_groups.values_list("name", flat=True))
        return groups

    def add_users(self, instance, user_emails):
        users = User.objects.filter(email__in=user_emails)
        instance.email_notify_users.set(users)
        return user_emails

    def update_devices(self, instance, devices_data):
        new_fw_uuids = []
        new_lb_uuids = []
        new_sw_uuids = []
        new_devices = []
        log_data = []
        for data in devices_data:
            device_type = data.get("device_type")
            if device_type.lower() == "firewall":
                fw_name = data.get("name")
                fw_uuid = data.get("uuid")
                new_devices.append(fw_name)
                new_fw_uuids.append(fw_uuid)
            elif device_type.lower() == "load_balancer":
                lb_name = data.get("name")
                lb_uuid = data.get("uuid")
                new_devices.append(lb_name)
                new_lb_uuids.append(lb_uuid)
            elif device_type.lower() == "switch":
                sw_name = data.get("name")
                sw_uuid = data.get("uuid")
                new_devices.append(sw_name)
                new_sw_uuids.append(sw_uuid)
        old_fw_uuids = [str(uuid) for uuid in instance.firewalls.all().values_list("uuid", flat=True)]
        old_lb_uuids = [str(uuid) for uuid in instance.load_balancers.all().values_list("uuid", flat=True)]
        old_sw_uuids = [str(uuid) for uuid in instance.switches.all().values_list("uuid", flat=True)]
        is_fw_changed = set(old_fw_uuids) != set(new_fw_uuids)
        is_lb_changed = set(old_lb_uuids) != set(new_lb_uuids)
        is_sw_changed = set(old_sw_uuids) != set(new_sw_uuids)
        if is_fw_changed or is_lb_changed or is_sw_changed:
            old_devices = list(instance.firewalls.all().values_list("name", flat=True)) + \
                list(instance.load_balancers.all().values_list("name", flat=True)) + \
                list(instance.switches.all().values_list("name", flat=True))
            instance.firewalls.clear()
            instance.load_balancers.clear()
            instance.switches.clear()
            log_data.append(old_devices)
            log_data.append(new_devices)
            _ = self.add_devices(instance, devices_data)
        return log_data

    def update_user_groups(self, instance, group_uuids):
        log_data = []
        old_group_uuids = list(instance.email_notify_groups.all().values_list("uuid", flat=True))
        is_changed = set(old_group_uuids) != set(group_uuids)
        if is_changed:
            instance.email_notify_groups.clear()
            _ = self.add_user_groups(instance, group_uuids)
            old_groups = list(RBACUserGroup.objects.filter(uuid__in=old_group_uuids).values_list("name", flat=True))
            new_agroups = list(RBACUserGroup.objects.filter(uuid__in=group_uuids).values_list("name", flat=True))
            log_data.append(old_groups)
            log_data.append(new_agroups)
        return log_data

    def update_users(self, instance, user_emails):
        log_data = []
        old_emails = list(instance.email_notify_users.all().values_list("email", flat=True))
        is_changed = set(old_emails) != set(user_emails)
        if is_changed:
            instance.email_notify_users.clear()
            _ = self.add_users(instance, user_emails)
            log_data.append(old_emails)
            log_data.append(user_emails)
        return log_data

    def add_devices_users_and_user_groups(self, instance, devices_data, user_emails, group_uuids):
        devices_changes = self.add_devices(instance, devices_data)
        user_changes = self.add_users(instance, user_emails)
        user_group_changes = self.add_user_groups(instance, group_uuids)
        changes = OrderedDict([
            ("devices", [None, devices_changes]),
            ("email_notify_users", [None, user_changes]),
            ("email_notify_groups", [None, user_group_changes])
        ])
        LogEntry.objects.log_create(
            instance,
            action=LogEntry.Action.UPDATE,
            changes=json.dumps(changes)
        )

    def update_devices_users_and_user_groups(self, instance, devices_data, user_emails, group_uuids):
        devices_changes = self.update_devices(instance, devices_data)
        user_changes = self.update_users(instance, user_emails)
        user_group_changes = self.update_user_groups(instance, group_uuids)
        changes = OrderedDict()
        if devices_changes:
            changes["devices"] = devices_changes
        if user_changes:
            changes["email_notify_users"] = user_changes
        if user_group_changes:
            changes["email_notify_groups"] = user_group_changes
        if changes:
            LogEntry.objects.log_create(
                instance,
                action=LogEntry.Action.UPDATE,
                changes=json.dumps(changes)
            )


class DeviceConfigurationDataSerializer(serializers.ModelSerializer):
    backup_name = serializers.SerializerMethodField()
    collector = serializers.SerializerMethodField()
    config_device_type = serializers.SerializerMethodField()
    datacenter = serializers.SerializerMethodField()
    device_name = serializers.SerializerMethodField()
    device_uuid = serializers.SerializerMethodField()
    executed_by = serializers.SerializerMethodField()
    is_ncm_enabled = serializers.SerializerMethodField()
    is_encrypted = serializers.SerializerMethodField()
    mangement_ip = serializers.SerializerMethodField()
    manufacturer = serializers.SerializerMethodField()
    model = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = DeviceConfigurationData
        fields = (
            'uuid',
            'backup_name',
            'device_name',
            'device_uuid',
            'device_type',
            'config_device_type',
            'config_file',
            'executed_by',
            'file_password',
            'is_encrypted',
            'is_startup_config',
            'is_golden_config',
            'is_ncm_enabled',
            'collector',
            'datacenter',
            'mangement_ip',
            'manufacturer',
            'model',
            'status',
            'created_at',
            'updated_at'
        )

    def get_backup_name(self, instance):
        timestamp = instance.created_at.strftime("%Y-%m-%d-%H-%M-%S-%f")
        backup_name = "{}_{}".format(instance.device_name, timestamp)
        backup_name = "_".join(backup_name.split())
        return backup_name

    def get_collector(self, instance):
        if instance.device_obj.collector:
            return {
                'uuid': instance.device_obj.collector.uuid,
                'name': instance.device_obj.collector.name,
                'ip_address': instance.device_obj.collector.ip_address
            }
        return None

    def get_config_device_type(self, instance):
        return instance.device_obj.config_device_type

    def get_datacenter(self, instance):
        if instance.device_obj.datacenter:
            return instance.device_obj.datacenter.name
        return None

    def get_device_uuid(self, instance):
        return instance.device_obj.uuid

    def get_device_name(self, instance):
        return instance.device_name

    def get_executed_by(self, instance):
        if instance.executed_by:
            return instance.executed_by.email
        return "Scheduler"

    def get_is_encrypted(self, instance):
        return instance.is_encrypted

    def get_is_ncm_enabled(self, instance):
        return instance.device_obj.is_ncm_enabled

    def get_mangement_ip(self, instance):
        return instance.device_obj.management_ip

    def get_manufacturer(self, instance):
        if instance.device_obj.manufacturer:
            return instance.device_obj.manufacturer.name
        return None

    def get_model(self, instance):
        if instance.device_obj.model:
            return instance.device_obj.model.name
        return None

    def get_status(self, instance):
        return device_status(instance.device_obj)
