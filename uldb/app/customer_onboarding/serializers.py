from __future__ import absolute_import
from __future__ import unicode_literals

from rest_framework import serializers
from rest.core.fields import OrganizationRelatedField

from rest.core.fields import *
from .models import NetworkScan, OnboardingExcelFileData


class NetworkScanSerializer(serializers.Serializer):
    uuid = serializers.CharField()
    inet = serializers.CharField()
    scan_status = serializers.CharField()
    scan_results = serializers.JSONField()
    updated_at = serializers.CharField()

    class Meta:
        model = NetworkScan
        fields = '__all__'


class OnboardingExcelFileDataSerializer(serializers.Serializer):
    uuid = serializers.CharField()
    user = serializers.CharField()
    customer = serializers.CharField()
    onb_status = serializers.JSONField()
    onb_data = serializers.JSONField()
    updated_at = serializers.CharField()
    file_name = serializers.SerializerMethodField()
    file_path = serializers.SerializerMethodField()

    def get_file_path(self, obj):
        return 'media/' + obj.document.name

    def get_file_name(self, obj):
        filename = 'N/A'
        if obj.document.name.startswith('onboarding_files/'):
            filename = obj.document.name.rsplit('/', 1)[1]
        return filename

    class Meta:
        model = OnboardingExcelFileData
        fields = get_default_fields() + ('user', 'onb_data', 'onb_status', 'customer', 'file_name', 'file_path')
