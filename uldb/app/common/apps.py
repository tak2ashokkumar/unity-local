from __future__ import absolute_import

from django.apps import AppConfig
from django.apps import apps
from django.conf import settings

excluded_models = [
    'CloudService.Cloud',
    'CloudService.PublicCloudData',
    'CloudService.AWSPublicCloudData',
    'CloudService.AzurePublicCloudData',
    'CloudService.GCPPublicCloudData',
    'CloudService.OCIPublicCloudData',
    'CloudService.ColoCloudData',
    'AWSAdapter.Volumes',
    'AWSAdapter.Instance',
    'AWSAdapter.AutoScalingGroup',
    'AWSAdapter.Policy',
    'AWSAdapter.NetworkInterface',
    'AWSAdapter.SecurityGroups',
    'AWSAdapter.Subnet',
    'gcp.GCPVirtualMachines',
    'gcp.GCPSnapshots',
    'monitoring.DashboardDevice',
    'zabbix.ZabbixCustomerAlerts',
    'zabbix.ZabbixInstance',
    'zabbix.ZabbixHostDeviceMap',
    'zabbix.ZabbixCustomer',
    'aiops.Event',
    'aiops.InboundDedupAlerts',
    'aiops.Condition',
    'sustainability.RegionName',
    'sustainability.CountryCo2Factor',
    'sustainability.StateCo2Factor',
    'sustainability.AWSEmissionData',
    'mtp.MTPRolePermission',
    'mtp.UserPermission',
    'jira.ProjectDetails',
    'Mtp_DynamicsCrm.NotesInstance',
    'Mtp_DynamicsCrm.TenantCRMInstance',
    'Mtp_DynamicsCrm.CrmTenantContactInstance',
    'orchestration.TaskParameter',
    'orchestration.WorkflowTaskParameter',
    'orchestration.WorkflowParameter',
]

excluded_model_fields = {
    'inventory.Switch': ['_zabbix'],
    'inventory.Firewall': ['_zabbix'],
    'inventory.Server': ['_server_zabbix', '_bm_server_zabbix'],
    'inventory.StorageDevice': ['_zabbix'],
    'inventory.MacDevice': ['_zabbix'],
    'inventory.LoadBalancer': ['_zabbix'],
    'inventory.PDU': ['_zabbix'],
    'inventory.CustomDevice': ['_zabbix'],
    'inventory.DatabaseServer': ['_zabbix'],
    'inventory.VirtualMachine': ['_zabbix'],
    'vcloud.VCloudVirtualMachines': ['_zabbix'],
    'openstack_app.OpenStackVmMigration': ['_zabbix'],
    'AzureAdapter.AzureAccount': ['_zabbix'],
    'AzureAdapter.AzureResource': ['_zabbix'],
    'gcp.GCPAccount': ['_zabbix'],
    'gcp.GCPResource': ['_zabbix'],
    'gcp.GCPInstance': ['_zabbix'],
    'gcp.GCPSnapshot': ['_zabbix'],
    'AWSAdapter.AWSAccount': ['_zabbix'],
    'AWSAdapter.AwsResource': ['_zabbix'],
    'vmware.VMwareVcenter': ['_zabbix'],
    'VmwareAdapter.VmwareVmMigration': ['_zabbix', '_esxi_zabbix'],
}

masked_model_fields = {
    'user2.User': ['password', ],
    'AWSAdapter.AWSAccount': ['access_key', 'secret_key'],
    'openstack_app.OpenStackController': ['password'],
    'vmware.VMwareVcenter': ['password'],
    'vcloud.VMwareVCloud': ['password'],
    'inventory.IPMIController': ['password'],
    'inventory.DRACController': ['password'],
    'AzureAdapter.AzureAccount': ['secret_key'],
    'gcp.GCPAccount': ['service_account_info'],
    'kubernetes.KubernetesAccount': ['password'],
    'inventory.Switch': ['snmp_authpass', 'snmp_cryptopass'],
    'inventory.Firewall': ['snmp_authpass', 'snmp_cryptopass'],
    'inventory.Server': ['snmp_authpass', 'snmp_cryptopass'],
    'inventory.StorageDevice': ['snmp_authpass', 'snmp_cryptopass'],
    'inventory.MacDevice': ['snmp_authpass', 'snmp_cryptopass'],
    'inventory.LoadBalancer': ['snmp_authpass', 'snmp_cryptopass'],
    'ULS3.ULS3Account': ['access_key', 'secret_key'],
    'oci_cloud.OCIAccount': ['fingerprint', 'key_content'],
    'unity_discovery.DiscoveryCredential': ['api_token', 'password', 'sudo_password', 'snmp_authpass', 'snmp_cryptopass'],
    'EmailIntegration.EmailAccount': ['client_secret', 'access_token', 'token_code']
}


class CommonConfig(AppConfig):
    name = 'app.common'
    verbose_name = "Common App"
    label = 'common'

    def ready(self):
        from libraries.auditlog.registry import auditlog
        for each_app in settings.AUDIT_LOG_REGISTERED_APPS:
            app_models = apps.get_app_config(each_app).get_models()
            for each_model in app_models:
                if not auditlog.contains(each_model):
                    if each_model._meta.label not in excluded_models:
                        masked_fields = masked_model_fields.get(
                            each_model._meta.label, []
                        )
                        excluded_fields = excluded_model_fields.get(
                            each_model._meta.label, []
                        )
                        auditlog.register(
                            each_model,
                            masked_fields=masked_fields,
                            exclude_fields=excluded_fields
                        )
