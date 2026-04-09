# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2017 UnitedLayer, LLC.
#
# All Rights Reserved.
"""
    app/common/serializers.py

    :copyright: (C) 2016 UnitedLayer, LLC. All Rights Reserved.
    :author: tswaraj@unitedlayer.com

    This module contains the tag serializer for all devices and vms
"""
from rest_framework import serializers
from app.common.models import AIAgents
from rest.core.fields import TagListingField, CredentialsRelatedField


class TagSerializerMixin(serializers.Serializer):
    """
    For creating and updating Tags of all devices and VMs
    """
    tags = TagListingField(many=True, required=False, allow_null=True)

    def create(self, validated_data, *args, **kwargs):
        tags = []
        if 'tags' in validated_data:
            tags = validated_data.pop('tags')
        obj = super(TagSerializerMixin, self).create(validated_data, *args, **kwargs)
        if tags:
            obj.tags.set(tags)
        return obj

    def update(self, instance, validated_data, *args, **kwargs):
        tags = []
        if 'tags' in validated_data:
            tags = validated_data.pop('tags')
        obj = super(TagSerializerMixin, self).update(instance, validated_data, *args, **kwargs)
        if tags:
            obj.tags.set(tags)
        return obj


class MonitoringFieldSerializer(serializers.Serializer):
    monitoring = serializers.SerializerMethodField()

    def get_monitoring(self, obj):
        # TO DO need to check again
        configured = False
        enabled = False
        customer = obj.get_customer()
        monitor_by = getattr(customer.monitoring_config, self.Meta.model.DEVICE_TYPE)
        if monitor_by.get('zabbix'):
            if obj.zabbix:
                configured = True
                enabled = not obj.zabbix.disabled
        elif monitor_by.get('observium'):
            if obj.observium:
                configured = True
                enabled = not obj.observium.disabled

        return {
            "configured": configured,
            "enabled": enabled,
            "zabbix": monitor_by.get('zabbix'),
            "observium": monitor_by.get('observium')
        }


class SNMPFieldDefaultSerializer(serializers.Serializer):
    ip_address = serializers.SerializerMethodField()

    def get_ip_address(self, obj):
        if obj.ip_address is None:
            obj.ip_address = obj.management_ip
            obj.save()
            return obj.ip_address
        return obj.ip_address


class EOLFieldSerializer(serializers.Serializer):
    end_of_life = serializers.SerializerMethodField()

    def get_end_of_life(self, obj):
        if obj.model:
            return obj.model.end_of_life
        return None


class EOSFieldSerializer(serializers.Serializer):
    end_of_service = serializers.SerializerMethodField()

    def get_end_of_service(self, obj):
        if obj.model:
            return obj.model.end_of_service
        return None


class DeviceCredentialsSerializer(serializers.Serializer):
    credentials = CredentialsRelatedField(required=False, allow_null=True)
    credentials_type = serializers.SerializerMethodField(required=False, allow_null=True)
    credentials_m2m = CredentialsRelatedField(many=True, required=False, allow_null=True)

    def get_credentials_type(self, obj):
        if obj.credentials_m2m.exists():
            connection_types = []
            for cred in obj.credentials_m2m.all():
                if cred.connection_type.lower() == "database" and cred.connection_type in connection_types:
                    continue
                connection_types.append(cred.connection_type)
            return ", ".join(connection_types)
        return None

    def validate_credentials_m2m(self, value):
        connection_types = set()
        for cred in value:
            connection_type = getattr(cred, "connection_type", None)
            if not connection_type:
                continue
            if connection_type.lower() == "database":
                database_type = getattr(cred, "database_type", None)
                if not database_type:
                    continue
                connection_type = "{} ({})".format(connection_type, database_type)
            if connection_type in connection_types:
                raise serializers.ValidationError("Credential type '%s' must be unique." % connection_type)
            connection_types.add(connection_type)
        return value


class AIAgentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAgents
        fields = ('name', 'url', 'uuid', 'access_token', 'queries')