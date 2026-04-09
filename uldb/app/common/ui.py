# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2017 UnitedLayer, LLC.
#
# All Rights Reserved.

"""
    ui.py

"""

from __future__ import absolute_import
from __future__ import unicode_literals

import json

from django.conf import settings


def get_menu_setting(menu_setting_name, default=False):
    """
    Gets menu setting from settings.MENU_SETTINGS

    e.g.,
    MENU_SETTINGS = {
        'TENABLE_ENABLED': False,
    }
    """
    menu_dict = 'MENU_SETTINGS'
    if hasattr(settings, menu_dict):
        if menu_setting_name in getattr(settings, menu_dict):
            return getattr(settings, menu_dict)[menu_setting_name]
    return default


class CustomerMenuFactory(object):

    items = (
        {
            'title': 'UnityView',
            'svg': 'United-View2.svg',
            'submenu': [
                {'name': 'Dashboard', 'href': '#/dashboard', 'state': 'dashboard', 'svg': 'Dashboard.svg'},
                # {'name': 'System Monitoring', 'href': '#/monitor', 'state': 'moniter', 'svg': 'System-Monitoring.svg', },
                {'name': 'Monitoring',
                 'href': '#/infrastructure_monitoring/devices',
                 'state': 'infrastructure_monitoring',
                 'svg': 'Infrastructure-Monitoring.svg',
                 'submenu': [
                     {
                         'name': 'Devices', 'href': '#/infrastructure_monitoring/devices',
                         'fa': 'fa-tablet',
                         'state': 'infrastructure_monitoring.devices'
                     },
                     {
                         'name': 'System', 'href': '#/infrastructure_monitoring/system',
                         'fa': 'fa-dashboard',
                         'state': 'infrastructure_monitoring.system'
                     },
                     {
                         'name': 'Storage', 'href': '#/infrastructure_monitoring/storage',
                         'fa': 'fa-hdd-o',
                         'state': 'infrastructure_monitoring.storage'
                     },
                     {
                         'name': 'Database', 'href': '#/infrastructure_monitoring/database_monitoring',
                         'svg': 'Database-Monitoring.svg',
                         'state': 'infrastructure_monitoring.database_monitoring'
                     },
                     {
                         'name': 'Performance',
                         'href': '#/infrastructure_monitoring/performance',
                         'svg': 'Performance-Monitoring.svg',
                         'state': 'infrastructure_monitoring.performance'
                     },
                     {
                         'name': 'Network',
                         'href': '#/infrastructure_monitoring/network',
                         'svg': 'Network-Monitoring.svg',
                         'state': 'infrastructure_monitoring.network'
                     },
                     {'name': 'Datacenter', 'href': '#/infrastructure_monitoring/datacenter',
                      'svg': 'Colo-Monitoring.svg',
                      'state': 'infrastructure_monitoring.datacenter'},
                 ]},
                # {'name': 'New Relic', 'href': '', 'fa': 'fa-area-chart', 'disabled': True},
                # {'name': 'Database Monitoring', 'href': '#/database_monitoring', 'state': 'database_monitoring', 'svg': 'Database-Monitoring.svg'},
                # {'name': 'Performance Monitoring', 'href': '#/performance_monitoring', 'state': 'performance_monitoring',
                #     'svg': 'Performance-Monitoring.svg'},
                # {'name': 'Network Monitoring', 'href': '#/network_monitoring', 'state': 'network_monitoring', 'svg': 'Network-Monitoring.svg'},
                # {'name': 'Storage Usage', 'href': '#/storage_usage', 'state': 'storage_usage', 'svg': 'Storage-Usage.svg'},
                # {'name': 'Load Balancer Usage', 'href': '#/loadbalancer_usage', 'state': 'loadbalancer_usage', 'svg': 'Load-Balancer-Usage.svg'},
                # # {'name': 'Colo Monitoring', 'href': '#/colo_monitoring', 'state': 'colo_monitoring', 'svg': 'Colo-Monitoring.svg'},
                {'name': 'Activity Log', 'href': '#/activity/logs', 'state': 'activity_logs',
                 'svg': 'Activity-Log.svg', },
                {'name': 'Alerts', 'href': '#/global_alerts/all_alerts', 'state': 'global_alerts',
                 'fa': 'fa-bell',
                 'arrow': True,
                 'submenu': [
                     {'name': 'All Alerts',
                      'state': 'global_alerts.all_alerts',
                      'fa': 'fa-tasks',
                      'href': '#/global_alerts/firewalls'},
                     {'name': 'Firewalls',
                      'state': 'global_alerts.firewalls',
                      'fa': 'fa-fire',
                      'href': '#/global_alerts/firewalls'},
                     {'name': 'Switches', 'state': 'global_alerts.switches',
                      'fa': 'fa-sitemap',
                      'href': '#/global_alerts/switches'},
                     {'name': 'Load Balancers', 'state': 'global_alerts.loadbalancers',
                      'fa': 'fa-balance-scale',
                      'href': '#/global_alerts/loadbalancers'},
                     {'name': 'Hypervisors', 'state': 'global_alerts.hypervisors',
                      'fa': 'fa-server',
                      'href': '#/global_alerts/hypervisors'},
                     {'name': 'Bare Metal Servers', 'state': 'global_alerts.bm_servers',
                      'fa': 'fa-laptop',
                      'href': '#/global_alerts/bm_servers'},
                     {'name': 'PDUs', 'state': 'global_alerts.pdus',
                      'fa': 'fa-plug',
                      'href': '#/global_alerts/pdus'},
                     {'name': 'Virtual Machines', 'state': 'global_alerts.vms',
                      'fa': 'fa-object-group',
                      'href': '#/global_alerts/vms'}
                 ]
                 },
            ]
        },
        {
            'title': 'UnityCloud',
            'svg': 'United-Cloud.svg',
            'submenu': [
                {'name': 'Private Cloud',
                 'href': '#/pc_clouds',
                 'state': 'pc_cloud',
                 'svg': 'Private-Cloud.svg'},
                {'name': 'Public Cloud', 'href': '#/public_cloud/aws-dashboard', 'state': 'public_cloud',
                 'svg': 'Public-Cloud.svg', 'arrow': True,
                 'submenu': [
                     {'name': 'AWS', 'href': '#/public_cloud/aws-dashboard',
                      'svg': 'aws.svg',
                      'state': 'public_cloud.aws-dashboard'},
                     {'name': 'Azure', 'href': '#/public_cloud/azure-dashboard',
                      'svg': 'azure.svg',
                      'state': 'public_cloud.azure-dashboard'},
                     {'name': 'Google Cloud', 'href': '#/public_cloud/gcp-dashboard',
                      'svg': 'gcp2.svg',
                      'state': 'public_cloud.gcp-dashboard'}
                 ]},
                {'name': 'Colo', 'href': '#/colo/cabs', 'state': 'colo', 'svg': 'Colo.svg',
                 'arrow': True,
                 'hide': True,
                 'submenu': [
                     {'name': 'Cabinets', 'href': '#/colo/cabs', 'state': 'colo.cabs'},
                     {'name': 'PDUs', 'href': '#/colo/pdus', 'state': 'colo.pdus'},
                     {'name': 'Cages', 'href': '#/colo/cages', 'state': 'colo.cages'}, ]},

                {'name': 'Datacenter', 'href': '#/colo_cloud', 'state': 'colo', 'svg': 'Colo.svg'},
                {'name': 'Devices', 'href': '#/devices/firewalls', 'state': 'devices', 'svg': 'Devices.svg',
                 'arrow': True,
                 'submenu': [
                     {'name': 'Firewalls', 'state': 'devices.firewalls', 'fa': 'fa-fire', 'href': '#/devices/firewalls'},
                     {'name': 'Switches', 'state': 'devices.switches', 'fa': 'fa-sitemap', 'href': '#/devices/switches'},
                     {'name': 'Load Balancers', 'state': 'devices.load_balancers', 'fa': 'fa-balance-scale',
                      'href': '#/devices/load_balancers'},
                     {'name': 'Hypervisors', 'state': 'devices.servers', 'fa': 'fa-server', 'href': '#/devices/servers'},
                     {'name': 'Virtual Machines', 'state': 'devices.vms', 'fa': 'fa-object-group', 'href': '#/devices/vms/allvms',
                      'submenu': [
                          {'name': 'All VMs', 'state': 'devices.vms.allvms', 'uuid': 'allvms',
                           'href': '#/devices/vms/allvms'},
                          {'name': 'VMware VMs', 'state': 'devices.vms.vmwarevms', 'uuid': 'vmwarevms',
                           'href': '#/devices/vms/vmwarevms'},
                          {'name': 'vCloud VMs', 'state': 'devices.vms.vcloudvms', 'uuid': 'vcloudvms',
                           'href': '#/devices/vms/vcloudvms'},
                          {'name': 'OpenStack VMs', 'state': 'devices.vms.openstackvms', 'uuid': 'openstackvms',
                           'href': '#/devices/vms/openstackvms'},
                          {'name': 'AWS VMs', 'state': 'devices.vms.awsvms', 'uuid': 'awsvms',
                           'href': '#/devices/vms/awsvms'},
                          {'name': 'Azure VMs', 'state': 'devices.vms.azurevms', 'uuid': 'azurevms',
                           'href': '#/devices/vms/azurevms'},
                      ]},
                     {'name': 'Cloud Controllers', 'state': 'devices.cloud_controllers', 'fa': 'fa-gamepad',
                      'href': '#/devices/cloud_controllers'},
                     {'name': 'Bare Metal Servers', 'state': 'devices.bm_servers', 'fa': 'fa-laptop',
                      'href': '#/devices/bm_servers'},
                     {'name': 'Other Devices', 'state': 'devices.other_devices', 'fa': 'fa-sliders',
                      'href': '#/devices/other_devices'}
                 ]},
                # {'name': 'UnitedConnect', 'href': '#/vxcs', 'state': 'unitedconnect', 'svg': 'United-Connect.svg',
                #  'arrow': True},
                {'name': 'UnityConnect',
                 'href': '#/unityconnect/billing',
                 'state': 'unityconnect',
                 'svg': 'United-Connect.svg',
                 'submenu': [
                     {'name': 'Bandwidth Billing', 'href': '#/unityconnect/billing',
                      'state': 'unityconnect.bandwidth_billing'},
                     {'name': 'Network Bandwidth', 'href': '#/unityconnect/system',
                      'state': 'unityconnect.network_bandwidth'},
                     {'name': 'VXC', 'href': '#/unityconnect/vxcs',
                      'state': 'unityconnect.vxc'},
                 ]},
                {'name': 'Cost Calculator', 'href': '#/cost_calculator', 'state': 'cost_calculator', 'fa': 'fa-money'},
            ]
        },
        {
            'title': 'UnityServices',
            'svg': 'United-Services.svg',
            'arrow': True,
            'submenu': [

                # {'name': 'Security-as-a-Service', 'href': '#/services/security', 'state': 'security',
                #  'svg': 'Security.svg'},
                # {'name': 'Application-as-a-Service', 'href': '#/services/application',
                #  'state': 'application_as_service', 'svg': 'Application-Service.svg'},
                # {'name': 'Database-as-a-Service', 'href': '#/services/database', 'state': 'database_as_service',
                #  'svg': 'Database-Service.svg'},
                {
                    'name': 'DevOps-as-a-Service',
                    'href': '#/devops_controllers',
                    'state': 'devops_controllers',
                    'svg': 'Devops-Service.svg',
                    # 'arrow': True,
                    # 'submenu': [
                    #     {'name': 'DevOps Controllers', 'href': '#/services/devops_controllers', 'state': 'services.devops_controllers'},
                    #     # {'name': 'Terraform', 'href': '#/services/terraform', 'state': 'services.terraform'},
                    #     # {'name': 'DB Instance', 'href': '#/services/db_instance', 'state': 'services.db_instance'},
                    #     {'name': 'Patch Management', 'href': '', 'disabled': True},
                    #     {'name': 'Create Snapshot', 'href': '', 'disabled': True},
                    #     {'name': 'FW Configuration Backup', 'href': '', 'disabled': True},
                    #     {'name': 'LB Configuration Backup', 'href': '', 'disabled': True},
                    #     {'name': 'Router/Switch Configuration Backup', 'href': '', 'disabled': True},
                    # ]
                },
                {
                    'name': 'VM Migration',
                    'href': '#/vm_migration',
                    'state': 'vm_migration',
                    'fa': 'fa-cloud-upload',
                },
                {
                    'name': 'VM Backup',
                    'href': '#/vm_backup',
                    'state': 'vm_backup',
                    'fa': 'fa-hdd-o',
                },
                {
                    'name': 'Deployment Engine',
                    'href': '#/engines/deployment-engine',
                    'state': 'engines',
                    'svg': 'rocket.svg',
                    'arrow': True,
                    'hide': not settings.DEBUG,
                    'submenu': [
                        {'name': 'Deployment Engine', 'href': '#/engines/deployment-engine', 'state': 'engines.deployment-engine'},
                        {'name': 'Deployments', 'href': '#/engines/all-deployments', 'state': 'engines.all-deployments'},
                    ]
                },
            ]
        },
        {
            'title': 'Support',
            'svg': 'Support.svg',
            'submenu': [
                {'name': 'Ticket Management',
                 'href': '#/ticket_management/all_tickets',
                 'state': 'ticket_mgmt',
                 'svg': 'Change-Management.svg',
                 'submenu': [
                     {
                         'name': 'All Tickets',
                         'href': '#/ticket_management/all_tickets',
                         'state': 'ticket_mgmt.all_tickets'
                     },
                     {
                         'name': 'Change Management',
                         'href': '#/ticket_management/change_tickets',
                         'state': 'ticket_mgmt.change_tickets'
                     },
                     {
                         'name': 'Incident Management',
                         'href': '#/ticket_management/existing_tickets',
                         'state': 'ticket_mgmt.existing_tickets'
                     },
                     {
                         'name': 'Service Request',
                         'href': '#/ticket_management/support_tickets',
                         'state': 'ticket_mgmt.support_tickets'
                     }]
                 },
                {'name': 'Unity Feedback',
                 'href': '#/unity_feedback',
                 'state': 'unity_feedback',
                 'fa': 'fa-comments-o'},
                {'name': 'Maintenance', 'href': '#/maintenance-schedules', 'state': 'maintenance-schedules',
                 'svg': 'Maintenance.svg'},
                {
                    'name': 'Documentation',
                    'href': '#/unitydocs/userguide',
                    'state': 'unitydocs',
                    'svg': 'Activity-Log.svg',
                    'submenu': [
                        {'name': 'User Guide', 'href': '#/unitydocs/userguide', 'state': 'unitydocs.userguide'},
                        {
                            'name': 'Releases', 'href': '#/unitydocs/releases', 'state': 'unitydocs.releases',
                            'submenu': [
                                {'name': 'Current Release', 'href': '#/unitydocs/releases/current',
                                 'state': 'unitydocs.releases.current'},
                                {'name': 'Previous Releases', 'href': '#/unitydocs/releases/list',
                                 'state': 'unitydocs.releases.releaselist'},
                            ]
                        }
                    ]
                },
            ]
        },
        {
            'title': 'UnitySetup',
            'svg': 'United-Setup.svg',
            'submenu': [
                {'name': 'Users & Groups', 'href': '#/user', 'state': 'userList', 'svg': 'Users-Groups.svg'},
                {'name': 'Onboarding', 'href': '#/inventory_onboard', 'state': 'inventory_onboard', 'fa': 'fa-file-excel-o', 'admin_only': True},
            ]
        },
    )



ADMIN_MANAGE = {
    'name': 'Advanced', 'href': '', 'fa': 'fa-rocket', 'arrow': True, 'submenu': [
        {'name': 'Import Tool', 'href': '#/import2', 'fa': 'fa-mail-forward', },
        {'name': 'Impersonate User', 'href': '#/hijack', 'fa': 'fa-low-vision', },
        {'name': 'Celery Jobs', 'href': '#/integ/celery_monitor', 'fa': 'fa-tasks', },
        {'name': 'Developer Options', 'href': '#/101010', 'fa': 'fa-save', },
        {'name': 'Proxy Cookies', 'href': '#/proxy-cookies-1', 'fa': 'fa-circle', },
        {'name': 'Release Notes', 'href': '#/release', 'fa': 'fa-sticky-note', },
    ]
}

ADMIN_SNIPPET_MAPPING = {
    'Manage': ADMIN_MANAGE
}


class AdminMenuFactory(object):
    def _is_valid(self, ls_type, items):
        return (isinstance(items, (list, tuple))
                and self.user.is_staff
                and ls_type in ADMIN_SNIPPET_MAPPING)

    def _admin_decorator(self, ls_type=None, items=None):
        """
        Appends items to a menu if the user is admin.
        """
        if not ls_type:
            ls_type = 'Manage'
        if self._is_valid(ls_type, items):
            items.append(ADMIN_SNIPPET_MAPPING[ls_type])
        return items

    def __init__(self, user):
        self.user = user
        self.items = (
            {
                'title': 'UnitedView',
                'fa': ' fa-home ',
                'submenu': [
                    {'name': 'Dashboard', 'href': '#/dashboard', 'fa': 'fa-map-o'},
                    {'name': 'System Monitoring', 'href': '', 'arrow': True, 'fa': 'fa-heartbeat', 'submenu': [
                        # {'name': 'System Health', 'href': '#/integ/health', 'fa': 'fa-heartbeat'},
                        {'name': 'Networking', 'href': '#/integ/net', 'fa': 'fa-area-chart'},
                    ]},
                    {'name': 'Activity Log', 'href': '#/activity/logs', 'fa': 'fa-list-ol', },
                ]
            },
            {
                'title': 'UnitedCloud',
                'glyphicon': 'glyphicon glyphicon-wrench',
                'submenu': [
                    {'name': 'Private Cloud', 'href': '#/cloud', 'fa': 'fa-cloud'},
                    {'name': 'Public Cloud', 'href': '', 'fa': 'fa-cloud', 'arrow': True, 'submenu': [
                        {'name': 'AWS', 'href': '#/aws-dashboard', 'fa': 'fa-cube'},
                        {'name': 'Azure', 'href': '#/azure-dashboard', 'fa': 'fa-desktop'},
                    ]},
                    {'name': 'Devices', 'href': '', 'fa': 'fa-list-ul', 'arrow': True, 'submenu': [
                        {'name': 'Servers', 'href': '#/servers', 'fa': 'fa-server'},
                        {'name': 'Virtual Machines', 'href': '#/vm', 'fa': 'fa-cloud'},
                        {'name': 'SANs', 'href': '#/sans', 'fa': 'fa-database'},
                        {'name': 'Switches', 'href': '#/switch', 'fa': 'fa-sitemap'},
                        {'name': 'Firewalls', 'href': '#/firewall', 'fa': 'fa-fire'},
                        {'name': 'Load Balancers', 'href': '#/loadbalancer', 'fa': 'fa-balance-scale'},
                        {'name': 'Terminal Servers', 'href': '#/terminalserver', 'fa': 'fa-list-ul'},
                        {'name': 'Other Device', 'href': '#/customdevice', 'fa': 'fa-list-ul'},
                    ]},
                    {'name': 'IP Management', 'href': '', 'fa': 'fa-sitemap', 'arrow': True, 'submenu': [
                        {'name': 'Public IPv4', 'href': '#/ipv4_public/assignments', },
                        {'name': 'Private IPv4', 'href': '#/ipv4_private/assignments', },
                        {'name': 'IPv6', 'href': '#/ipv6blocks', },
                        {'name': 'VLANs', 'href': '#/vlan'}
                    ]},
                    {'name': 'Colo', 'href': '', 'fa': 'fa-building', 'arrow': True, 'submenu': [
                        {'name': 'Cabinets', 'href': '#/cabinet', 'fa': 'fa-cube'},
                        {'name': 'PDUs', 'href': '#/pdu', 'fa': 'fa-plug'},
                        {'name': 'Cages', 'href': '#/cage', 'fa': 'fa-cubes'},
                        {'name': 'Power Circuits', 'href': '#/powercircuit', 'fa': 'fa-plug'},
                        {'name': 'Colocation Cloud', 'href': '#colo_cloud', 'fa': 'fa-cloud'},
                    ]},
                    {'name': 'UnityConnect', 'href': '#/cloud', 'fa': 'fa-cloud', 'arrow': True, 'submenu': [
                        {'name': 'UnityConnect', 'href': '#/unityconnect', 'fa': 'fa-cloud', },
                        {'name': 'UCPort', 'href': '#/manage_unityconnect', 'fa': 'fa-plug'},
                        {'name': 'VXC', 'href': '#/manage_unityconnect/vxc', 'fa': 'fa-exchange'},
                    ]},
                ],
            },
            {
                'title': 'UnitedServices',
                'fa': 'fa-rocket',
                'submenu': [
                    {'name': 'DevOps-as-a-Service', 'href': '', 'fa': 'fa-gears', 'arrow': True, 'submenu': [
                        {'name': 'DevOps Scripts', 'href': '#/services/devops-scripts', 'fa': 'fa-cube'},
                        {'name': 'Terraform', 'href': '#/services/terraform', 'fa': 'fa-cube'},
                        {'name': 'VM Migration', 'href': '#/services/vm_migration',
                         'glyphicon': 'glyphicon glyphicon-export', },
                        {'name': 'VM Backup', 'href': '#/services/vm_backup',
                         'glyphicon': 'glyphicon glyphicon-saved', },
                        {'name': 'DB Instance', 'href': '#/services/db_instance',
                         'glyphicon': 'glyphicon glyphicon-saved', },
                        {'name': 'Patch Management', 'href': '', 'fa': 'fa-user', 'disabled': True},
                        {'name': 'Create Snapshot', 'href': '', 'fa': 'fa-user', 'disabled': True},
                        {'name': 'FW Configuration Backup', 'href': '', 'fa': 'fa-user', 'disabled': True},
                        {'name': 'LB Configuration Backup', 'href': '', 'fa': 'fa-user', 'disabled': True},
                        {'name': 'Router/Switch Configuration Backup', 'href': '', 'fa': 'fa-user', 'disabled': True},
                    ]},
                    {'name': 'App Monitoring', 'href': '', 'fa': 'fa-area-chart', 'disabled': True},
                    {'name': 'DB Monitoring', 'href': '', 'fa': 'fa-database', 'disabled': True},
                    {'name': 'Security', 'href': '', 'fa': 'fa-shield', 'arrow': True, 'disabled': True, 'submenu': [
                        {'name': 'Tenable', 'href': '', 'fa': 'fa-cogs', 'disabled': True},
                    ]},
                    {'name': 'Compliance', 'href': '', 'fa': 'fa-legal', 'arrow': True, 'submenu': [
                    ], 'disabled': True},
                    {'name': 'Application', 'href': '', 'fa': 'fa-cubes', 'arrow': True, 'submenu': [
                        {'name': 'Release Management', 'href': '', 'fa': 'fa-cogs', 'disabled': True},
                    ], 'disabled': True},
                    {'name': 'Platform', 'href': '', 'fa': 'fa-map-o', 'arrow': True, 'submenu': [
                        {'name': 'Database Management', 'href': '', 'fa': 'fa-database', 'disabled': True},
                    ], 'disabled': True},
                ]
            },
            {
                'title': 'Support',
                'fa': 'fa-support',
                'submenu': [
                    {'name': 'Admin Tickets', 'href': '#/admin_tickets', 'fa': 'fa-ticket'},
                    {'name': 'Change Management', 'href': '#/change_ticket', 'fa': 'fa-columns'},
                    {'name': 'Incident Management', 'href': '#/existing_ticket', 'fa': 'fa-tags'},
                    {'name': 'Service Requests', 'href': '#/tickets', 'fa': 'fa-question-circle'},
                    {'name': 'Unity Feedback', 'href': '#/unity_feedback', 'fa': 'fa-comments'},
                    {'name': 'Maintenance', 'href': '#/maintenance-schedules', 'fa': 'fa-calendar'},
                ]
            },
            {
                'title': 'UnitedSetup',
                'fa': 'fa-wrench',
                'submenu': self._admin_decorator(ls_type='Manage', items=[
                    {'name': 'Tenant Management', 'href': '', 'fa': 'fa-user-circle', 'arrow': True, 'submenu': [
                        {'name': 'Organizations', 'href': '#/organization', 'fa': 'fa-building'},
                        {'name': 'Users', 'href': '#/user', 'fa': 'fa-user'},
                        {'name': 'Storage', 'href': '#/storage_management', 'fa': 'fa-user'},
                    ]},
                    {'name': 'Billing & Invoicing', 'href': '', 'fa': 'fa-credit-card', 'arrow': True, 'submenu': [
                        {'name': 'Products', 'href': '#/sf_product2', 'fa': 'fa-th-list', },
                        {'name': 'Opportunities', 'href': '#/sf_opportunity', 'fa': 'fa-clone'},
                        {'name': 'Service Contracts', 'href': '#/service_contract', 'fa': 'fa-sticky-note-o'},
                        {'name': 'Import Opportunities', 'href': '#/sf_import_oppty', 'fa': 'fa-mail-forward'},
                    ]},
                    {'name': 'Customer Integrations', 'href': '', 'fa': 'fa-exchange', 'arrow': True, 'submenu': [
                        {'name': 'AWS Integration', 'href': '', 'disabled': True},
                        {'name': 'Azure Integration', 'href': '', 'disabled': True},
                        {'name': 'Zendesk Integration', 'href': '#/integ/support'},
                    ]},
                    {'name': 'Server Components', 'href': '', 'fa': 'fa-briefcase', 'arrow': True, 'submenu': [
                        {'name': 'CPUs', 'href': '#/cpu', },
                        {'name': 'Memory', 'href': '#/memory', },
                        {'name': 'Disks', 'href': '#/disk', },
                        {'name': 'Motherboard', 'href': '#/motherboard', },
                        {'name': 'NICs', 'href': '#/nic', },
                        {'name': 'IPMI', 'href': '#/ipmi', },
                        {'name': 'Operating Systems', 'href': '#/os'}
                    ]},
                    {'name': 'Cloud Setup', 'href': '', 'fa': 'fa-cloud', 'arrow': True, 'submenu': [
                        {'name': 'Private Cloud', 'href': '#cloud_setup/private_cloud', 'fa': 'fa-cloud'},
                        {'name': 'VMware', 'href': '', 'glyphicon': 'glyphicon glyphicon-wrench', 'arrow': True,
                         'submenu': [
                             {'name': 'vCenter API Account', 'href': '#/vmware-dashboard', 'fa': 'fa-cloud'},
                             {'name': 'vCenter Proxy', 'href': '#/vmware-vcenter', 'fa': 'fa-cloud'},
                             {'name': 'VMware ESXi Proxy', 'href': '#/vmware-esxi', 'fa': 'fa-cloud'},
                         ]},
                        {'name': 'OpenStack', 'href': '', 'fa': 'fa-server', 'arrow': True, 'submenu': [
                            # {'name': 'OpenStack Instances', 'href': '#/openstack_instance', 'fa': 'fa-circle-o-notch'},
                            {'name': 'OpenStack API Account', 'href': '#/openstack-dashboard', 'fa': 'fa-cloud'},
                            {'name': 'OpenStack Proxy', 'href': '#/openstack-proxy', 'fa': 'fa-cloud'},
                        ]},
                        {'name': 'Networking', 'href': '', 'fa': 'fa-sitemap', 'arrow': True, 'submenu': [
                            # {'name': 'Cisco Switch', 'href': '#/cisco-switch', 'fa': 'fa-fire'},
                            # {'name': 'Juniper Switch', 'href': '#/juniper-switch', 'fa': 'fa-sitemap'},
                            # {'name': 'F5 LB', 'href': '#/f5-lb-proxy', 'fa': 'fa-balance-scale'},
                            # {'name': 'Citrix VPX', 'href': '#/citrix-vpx-device', 'fa': 'fa-balance-scale'},
                            # {'name': 'Juniper Firewall', 'href': '#/juniper-firewall', 'fa': 'fa-sitemap'},
                            # {'name': 'Cisco Fiewall', 'href': '#/cisco-firewall', 'fa': 'fa-fire'},
                            {'name': 'Switches', 'href': '#/switch', 'fa': 'fa-sitemap'},
                            {'name': 'Firewalls', 'href': '#/firewall', 'fa': 'fa-fire'},
                            {'name': 'Load Balancers', 'href': '#/loadbalancer', 'fa': 'fa-balance-scale'}
                        ]},
                    ]},
                    {'name': 'Supported Hardware', 'href': '', 'fa': 'fa-cog', 'arrow': True, 'submenu': [
                        {'name': 'Manufacturers', 'href': '', 'arrow': True, 'submenu': [
                            {'name': 'PDU', 'href': '#/pdu_manufacturers', },
                            {'name': 'Storage', 'href': '#/storage_manufacturers', },
                            {'name': 'Mobile', 'href': '#/mobile_manufacturers', },
                            {'name': 'System', 'href': '#/system_manufacturers', },
                            {'name': 'Manufacturers', 'href': '#/manufacturers', },
                        ]},
                        {'name': 'Models', 'href': '', 'arrow': True, 'submenu': [
                            {'name': 'PDU', 'href': '#/pdumodel', },
                            {'name': 'Switch', 'href': '#/switchmodel', },
                            {'name': 'Firewall', 'href': '#/firewallmodel', },
                            {'name': 'Load Balancer', 'href': '#/loadbalancermodel', },
                            {'name': 'Server', 'href': '#/server_model', },
                            {'name': 'Storage', 'href': '#/storage_model', },
                            {'name': 'Mobile', 'href': '#/mobile_model', },
                            {'name': 'Motherboard', 'href': '#/motherboardmodel', },
                            {'name': 'CPU', 'href': '#/cputype', },
                            {'name': 'Memory', 'href': '#/memorytype', },
                            {'name': 'Disk', 'href': '#/disktype', },
                            {'name': 'NIC', 'href': '#/nictype', },
                            {'name': 'IPMI', 'href': '#/ipmi_model', },
                            {'name': 'Terminal Server', 'href': '#/terminalservermodel', },
                        ]},
                        {'name': 'Controller Types', 'href': '', 'arrow': True, 'submenu': [
                            {'name': 'SAS', 'href': '#/sascontrollertype', },
                            {'name': 'Disk', 'href': '#/diskcontrollertype', },
                            {'name': 'RAID', 'href': '#/raidcontrollertype', },
                        ]},
                        {'name': 'Miscellaneous', 'href': '', 'arrow': True, 'submenu': [
                            {'name': 'Product Types', 'href': '#/producttype', },
                            {'name': 'Chassis', 'href': '#/chassistype', },
                            {'name': 'Peripheral Types', 'href': '#/peripheraltype', },
                            {'name': 'Cluster Types', 'href': '#/clustertype', },
                            {'name': 'Cloud Types', 'href': '#/cloudtype', },
                        ]},
                    ]},
                    {'name': 'Facilities Config', 'href': '', 'fa': 'fa-globe', 'arrow': True, 'submenu': [
                        {'name': 'Datacenters', 'href': '#/datacenter', },
                        {'name': 'Locations', 'href': '#/location', },
                        {'name': 'Cabinet Types', 'href': '#/cabinettype', },
                        {'name': 'Cabinet Options', 'href': '#/cabinetoption', },
                        {'name': 'Circuit Options', 'href': '#/circuitoption', },
                        {'name': 'Voltage Types', 'href': '#/voltagetype', },
                        {'name': 'Amp Types', 'href': '#/ampstype', },
                        {'name': 'Outlet Types', 'href': '#/outlettype', },
                        {'name': 'Electrical Panels', 'href': '#/electricalpanel', },
                        {'name': 'Electrical Circuits', 'href': '#/electricalcircuit', },
                    ]},
                    {'name': 'IP Config', 'href': '', 'fa': 'fa-wrench', 'arrow': True, 'submenu': [
                        {'name': 'IPv4 ARIN Allocations', 'href': '#/ipv4_public/allocations', },
                        {'name': 'IPv6 Allocations', 'href': '#/ipv6alloc', },
                        {'name': 'Private Allocations', 'href': '#/ipv4_private/allocations', },
                    ]},
                    {'name': 'Monitoring', 'fa': 'fa-area-chart', 'arrow': True, 'submenu': [

                        {'name': 'Configuration', 'fa': 'fa-cog', 'href': '#/monitoring/configure', },
                        {'name': 'Zabbix', 'fa': 'fa-bar-chart', 'arrow': True, 'submenu': [
                            {'name': 'Instance', 'href': '#/zabbix/instance', },
                            {'name': 'Customer Map', 'href': '#/zabbix/customer_instance_map', },
                            {'name': 'Template definition', 'href': '#/zabbix/template_definition', },
                            {'name': 'Template mapping', 'href': '#/zabbix/template_mapping', },
                            {'name': 'Device Map', 'href': '#/zabbix/device_map', },
                            {'name': 'Agent Details', 'href': '#/zabbix/agent_details', },
                        ]},
                        {'name': 'Observium', 'fa': 'fa-line-chart', 'arrow': True, 'submenu': [
                            {'name': 'Instance', 'href': '#/observium/instance', },
                            {'name': 'Device Map', 'href': '#/observium/device_map', },
                            {'name': 'Bill Map', 'href': '#/observium/billing_map', },
                            {'name': 'Port Map', 'href': '#/observium/switch_ports', },
                        ]},

                    ]},
                    {'name': 'AIOPS', 'href': '', 'fa': 'fa-bell', 'arrow': True, 'submenu': [
                        {'name': 'Sources', 'href': '#/aiops/sources', 'fa': 'fa-building'},
                    ]},
                    {'name': 'Discovery', 'fa': 'fa-area-chart', 'arrow': True, 'submenu': [
                        {'name': 'OpenAudit', 'fa': 'fa-cog', 'href': '#/discovery/open_audit', },
                    ]},
                    {'name': 'AWS AMI', 'href': '#/aws_amis', 'fa': 'fa fa-floppy-o'},
                    {'name': 'Device Reports', 'href': '#/device_reports', 'fa': 'fa fa-bar-chart'},
                    {'name': 'Service Catalogues', 'href': '#/service_catalogue', 'fa': 'fa fa-list'},
                ]),
            }
        )
