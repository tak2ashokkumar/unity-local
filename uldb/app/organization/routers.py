from __future__ import absolute_import
from rest_framework import routers
from .views import (
    OrganizationViewSet,
    OrgStorageViewSet,
    OrgMonitoringConfigViewSet,
    AlertNotificationGroupViewSet,
)
from .lumi_views import LumiOrganizationViewSet, LumiOrganizationUserViewSet


router = routers.DefaultRouter()
router.register('org', OrganizationViewSet)
router.register('org_storage', OrgStorageViewSet)
router.register('org_monitoring_config', OrgMonitoringConfigViewSet)
router.register('alert_notification_group', AlertNotificationGroupViewSet)
router.register(
    'lumi/organizations', LumiOrganizationViewSet,
    base_name='lumi-organizations',
)
router.register(
    'lumi/organization-users', LumiOrganizationUserViewSet,
    base_name='lumi-organization-users',
)
