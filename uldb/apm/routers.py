from rest_framework.routers import DefaultRouter
from .views import APMDataViewSet, MonitoringViewSet, CreateGraphAPM, BusinessModelViewSet, BusinessServiceModelViewSet, \
    LicenseCostCenterModelViewSet, AppListViewSet, DetailTopologyViewSet, BusinessSummaryViewSet, APMDataPassView, APMOnboardingViewSet

apm_router = DefaultRouter()
apm_router.register(r'apps', APMDataViewSet, base_name='apm_app_list')
apm_router.register(r'monitoring', MonitoringViewSet, base_name='apm_monitoring_list')
apm_router.register(r'graphs', CreateGraphAPM, base_name='apm_monitoring_graphs')
apm_router.register(r'business', BusinessModelViewSet, base_name='business')
apm_router.register(r'business_list', BusinessModelViewSet, base_name='business_list')
apm_router.register(r'business_service', BusinessServiceModelViewSet, base_name='business_service')
apm_router.register(r'business_license', LicenseCostCenterModelViewSet, base_name='business_license')
apm_router.register(r'app_list', AppListViewSet, base_name='parent_applist')
apm_router.register(r'topology', DetailTopologyViewSet, base_name='detail_topology')
apm_router.register(r'business_summary', BusinessSummaryViewSet, base_name='business_summary')
apm_router.register(r'apm_onboarding', APMOnboardingViewSet, base_name='apm_onboarding')
