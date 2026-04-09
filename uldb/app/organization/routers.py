from __future__ import absolute_import
from rest_framework import routers
from .views import (
    OrganizationViewSet,
    OrgStorageViewSet,
    OrgMonitoringConfigViewSet,
    AlertNotificationGroupViewSet,
)
router = routers.DefaultRouter()
router.register('org', OrganizationViewSet)
router.register('org_storage', OrgStorageViewSet)
router.register('org_monitoring_config', OrgMonitoringConfigViewSet)
router.register('alert_notification_group', AlertNotificationGroupViewSet)