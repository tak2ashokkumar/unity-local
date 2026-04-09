import uuid
from app.common.models import *
from django.db import models
from app.organization.models import Organization
from django.contrib.postgres.fields import JSONField


def user_directory_path(instance, filename):
        # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
        return 'onboarding_files/{0}/{1}'.format(instance.customer.id, filename)


class OnboardingExcelFile(InventoryModel):

    customer = models.OneToOneField(
        'organization.Organization', related_name="customer_onboard_file"
    )
    document = models.FileField(upload_to=user_directory_path)

    @property
    def organization_id(self):
        return self.customer.id


class OnboardingExcelFileData(InventoryModel):

    customer = models.ForeignKey(
        'organization.Organization', related_name="customer_onboard_data"
    )
    document = models.FileField(upload_to=user_directory_path)
    user = models.ForeignKey("user2.User")
    onb_data = JSONField(null=True)
    onb_status = JSONField(null=True)

    @property
    def organization_id(self):
        return self.customer.id


class NetworkScan(InventoryModel):
    SCAN_STATUS = (
        ('INITIATED', 'INITIATED'),
        ('COMPLETED', 'COMPLETED'),
        ('RESCANNING', 'RESCANNING'),
        ('ABORTED', 'ABORTED'),
    )

    id = models.AutoField(primary_key=True)
    org = models.ForeignKey(Organization, null=False)
    inet = models.CharField(max_length=25)
    scan_status = models.CharField(choices=SCAN_STATUS, max_length=20)
    scan_results = JSONField(null=True)

    def __unicode__(self):
        return '%s' % (self.inet)

    def __repr__(self):
        return '%s' % (self.inet)

    class Meta:
        verbose_name = 'Network Scan'

    @property
    def organization_id(self):
        return self.org.id
