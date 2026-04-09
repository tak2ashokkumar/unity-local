from django.db import models
from django.utils import timezone

from app.Utils.utility import generate_uuid


class AWSInstancePricing(models.Model):
    uuid = models.UUIDField(default=generate_uuid)
    instance_type = models.CharField(max_length=30)
    region = models.CharField(max_length=40)

    ram = models.DecimalField(max_digits=7, decimal_places=3)
    cpu = models.IntegerField()

    storage_inbuilt = models.IntegerField()
    rate = models.DecimalField(max_digits=10, decimal_places=4)
    unit = models.CharField(max_length=10)
    description = models.CharField(max_length=100)
    os = models.CharField(max_length=100)
    nw_performance = models.CharField(max_length=25)
    purchase_option = models.CharField(max_length=40)
    lease_contract_length = models.CharField(
        max_length=10,
        default='Oyr'
    )

    created_at = models.DateTimeField(editable=False, default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        pass

    def __unicode__(self):
        return '%s' % (self.instance_type)


class AzureVMSize(models.Model):

    name = models.CharField(max_length=40)
    uuid = models.UUIDField(default=generate_uuid)
    ram_in_mb = models.IntegerField()
    cpu = models.IntegerField()
    os_disk_size_mb = models.IntegerField()
    resource_disk_size_mb = models.IntegerField()
    data_disk_count = models.IntegerField()

    class Meta:
        pass

    def __unicode__(self):
        return '%s' % (self.name)


class AzureVMPricing(models.Model):

    uuid = models.UUIDField(default=generate_uuid)
    offer_id = models.CharField(max_length=20, default='MS-AZR-0003P')
    tier = models.CharField(max_length=50)
    meter_name = models.CharField(max_length=40)
    size = models.ForeignKey(AzureVMSize, related_name='azure_vm_size')
    region = models.CharField(max_length=40)
    meter_category = models.CharField(max_length=50)
    meter_sub_category = models.CharField(max_length=100)
    rate = models.DecimalField(max_digits=10, decimal_places=4)
    commitment = models.CharField(
        max_length=10,
        default='0yr'
    )

    class Meta:
        pass

    def __unicode__(self):
        return '%s' % self.meter_name


class AzureStoragePricing(models.Model):

    uuid = models.UUIDField(default=generate_uuid)
    offer_id = models.CharField(max_length=20, default='MS-AZR-0003P')
    meter_name = models.CharField(max_length=40)
    disk_size = models.IntegerField()
    region = models.CharField(max_length=40)
    meter_category = models.CharField(max_length=50)
    meter_sub_category = models.CharField(max_length=100)
    rate = models.DecimalField(max_digits=10, decimal_places=4)

    class Meta:
        pass

    def __unicode__(self):
        return '%s' % (self.meter_name)


class GCPMachineTypePricing(models.Model):

    uuid = models.UUIDField(default=generate_uuid)
    description = models.CharField(max_length=100)
    usage_type = models.CharField(max_length=20, default='OnDemand')
    commitment = models.CharField(
        max_length=10,
        default='0yr'
    )
    cpu_or_ram = models.CharField(max_length=4)
    region = models.CharField(max_length=40)
    machine_class = models.CharField(max_length=40)
    machine_type = models.CharField(max_length=5)
    rate = models.DecimalField(max_digits=15, decimal_places=7)

    class Meta:
        pass

    def __unicode__(self):
        return '%s' % (self.description)


class GCPStoragePricing(models.Model):

    uuid = models.UUIDField(default=generate_uuid)
    description = models.CharField(max_length=100)
    usage_type = models.CharField(max_length=20, default='OnDemand')
    region = models.CharField(max_length=40)
    storage_type = models.CharField(max_length=100)
    rate = models.DecimalField(max_digits=15, decimal_places=7)

    class Meta:
        pass

    def __unicode__(self):
        return '%s' % (self.description)
