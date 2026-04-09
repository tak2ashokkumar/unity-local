from __future__ import absolute_import

from django.conf.urls import url, include
from rest_framework import routers
from .views import *


urlpatterns = [
    url('switches/', OnboardingSwitchesCreateView.as_view(), name='switches'),
    url('firewalls/', OnboardingFirewallsCreateView.as_view(), name='firewalls'),
    url('load_balancers/', OnboardingLoadBalancersCreateView.as_view(), name='loadbalancers'),
    url('servers/', OnboardingServersCreateView.as_view(), name='servers'),
    url('bms/', OnboardingBMSCreateView.as_view(), name='bms'),
    url('storagedevices/', OnboardingStorageDevicesCreateView.as_view(), name='storagedevices'),
    url('macdevices/', OnboardingMacDeviceCreateView.as_view(), name='macdevices'),
    url('mobiledevices/', OnboardingMobileDeviceCreateView.as_view(), name='mobiledevices'),
    url('pdus/', OnboardingPDUSCreateView.as_view(), name='pdus'),
    url('datacenter/', OnboardingColoCloudCreateView.as_view(), name='pdus'),
    url('cabinets/', OnboardingCabinetCreateView.as_view(), name='pdus'),
    url('databases/', OnboardingDatabaseCreateView.as_view(), name='databases'),
]
