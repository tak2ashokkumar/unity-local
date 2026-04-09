from rest_framework import serializers

from .models import (
    AWSInstancePricing, AzureVMSize,
    AzureVMPricing, AzureStoragePricing
)


class AWSInstancePricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AWSInstancePricing
        fields = '__all__'


class AzureVMSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AzureVMSize
        fields = '__all__'


class AzureVMPricingSerializer(serializers.ModelSerializer):
    size = AzureVMSizeSerializer()

    class Meta:
        model = AzureVMPricing
        fields = '__all__'


class AzureStoragePricingSerializer(serializers.ModelSerializer):

    class Meta:
        model = AzureStoragePricing
        fields = '__all__'
