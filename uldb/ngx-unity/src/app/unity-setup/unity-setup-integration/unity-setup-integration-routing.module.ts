import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PcCrudComponent } from 'src/app/app-shared-crud/pc-crud/pc-crud.component';
import { UnitySetupLdapCrudComponent } from 'src/app/app-shared-crud/unity-setup-ldap-crud/unity-setup-ldap-crud.component';
import { UsiOntapCrudNewComponent } from 'src/app/app-shared-crud/usi-ontap-crud-new/usi-ontap-crud-new.component';
import { VmBackupHistoryComponent } from 'src/app/shared/vm-backup-history/vm-backup-history.component';
import { ZABBIX_AWS_ACCOUNT_ROUTES } from 'src/app/united-cloud/shared/aws-zabbix/aws-zabbix-routing.const';
import { AwsZabbixComponent } from 'src/app/united-cloud/shared/aws-zabbix/aws-zabbix.component';
import { UnitySetupLdapConfigComponent } from '../unity-setup-ldap-config/unity-setup-ldap-config.component';
import { UnitySetupLdapUserImportComponent } from '../unity-setup-ldap-config/unity-setup-ldap-user-import/unity-setup-ldap-user-import.component';
import { UnitySetupIntegrationComponent } from './unity-setup-integration.component';
import { UsiBmcHelixCrudComponent } from './usi-bmc-helix/usi-bmc-helix-crud/usi-bmc-helix-crud.component';
import { UsiBmcHelixComponent } from './usi-bmc-helix/usi-bmc-helix.component';
import { UsiEventIngestionAppDynamicsComponent } from './usi-event-ingestion-app-dynamics/usi-event-ingestion-app-dynamics.component';
import { UsiEventIngestionAwsComponent } from './usi-event-ingestion-aws/usi-event-ingestion-aws.component';
import { UsiEventIngestionAzureComponent } from './usi-event-ingestion-azure/usi-event-ingestion-azure.component';
import { UsiEventIngestionCommonComponent } from './usi-event-ingestion-common/usi-event-ingestion-common.component';
import { UsiEventIngestionCustomCrudComponent } from './usi-event-ingestion-custom/usi-event-ingestion-custom-crud/usi-event-ingestion-custom-crud.component';
import { UsiEventIngestionCustomListComponent } from './usi-event-ingestion-custom/usi-event-ingestion-custom-list/usi-event-ingestion-custom-list.component';
import { UsiEventIngestionEmailCrudComponent } from './usi-event-ingestion-email/usi-event-ingestion-email-crud/usi-event-ingestion-email-crud.component';
import { UsiEventIngestionEmailHistoryComponent } from './usi-event-ingestion-email/usi-event-ingestion-email-history/usi-event-ingestion-email-history.component';
import { UsiEventIngestionEmailComponent } from './usi-event-ingestion-email/usi-event-ingestion-email.component';
import { UsiEventIngestionGcpComponent } from './usi-event-ingestion-gcp/usi-event-ingestion-gcp.component';
import { UsiEventIngestionLogicMonitorComponent } from './usi-event-ingestion-logic-monitor/usi-event-ingestion-logic-monitor.component';
import { UsiEventIngestionNagiosComponent } from './usi-event-ingestion-nagios/usi-event-ingestion-nagios.component';
import { UsiEventIngestionNewRelicComponent } from './usi-event-ingestion-new-relic/usi-event-ingestion-new-relic.component';
import { UsiEventIngestionOciComponent } from './usi-event-ingestion-oci/usi-event-ingestion-oci.component';
import { UsiEventIngestionOpsrampComponent } from './usi-event-ingestion-opsramp/usi-event-ingestion-opsramp.component';
import { UsiEventIngestionSolarwindsComponent } from './usi-event-ingestion-solarwinds/usi-event-ingestion-solarwinds.component';
import { UsiEventIngestionZabbixComponent } from './usi-event-ingestion-zabbix/usi-event-ingestion-zabbix.component';
import { UsiEventIngestonDynatraceComponent } from './usi-event-ingeston-dynatrace/usi-event-ingeston-dynatrace.component';
import { UsiImportDataCrudComponent } from './usi-import-data/usi-import-data-crud/usi-import-data-crud.component';
import { UsiImportDataComponent } from './usi-import-data/usi-import-data.component';
import { UsiJiraCrudComponent } from './usi-jira/usi-jira-crud/usi-jira-crud.component';
import { UsiJiraComponent } from './usi-jira/usi-jira.component';
import { UsiManageEngineCrudComponent } from './usi-manage-engine/usi-manage-engine-crud/usi-manage-engine-crud.component';
import { UsiManageEngineComponent } from './usi-manage-engine/usi-manage-engine.component';
import { UsiMsDynamicsCrmCrudComponent } from './usi-ms-dynamics-crm/usi-ms-dynamics-crm-crud/usi-ms-dynamics-crm-crud.component';
import { UsiMsDynamicsCRMComponent } from './usi-ms-dynamics-crm/usi-ms-dynamics-crm.component';
import { UsincCiscoMerakiCrudComponent } from './usi-network-controllers/usinc-cisco-meraki/usinc-cisco-meraki-crud/usinc-cisco-meraki-crud.component';
import { UsincCiscoMerakiHistoryComponent } from './usi-network-controllers/usinc-cisco-meraki/usinc-cisco-meraki-history/usinc-cisco-meraki-history.component';
import { UsincCiscoMerakiComponent } from './usi-network-controllers/usinc-cisco-meraki/usinc-cisco-meraki.component';
import { UsincViptelaCrudComponent } from './usi-network-controllers/usinc-viptela/usinc-viptela-crud/usinc-viptela-crud.component';
import { UsincViptelaComponent } from './usi-network-controllers/usinc-viptela/usinc-viptela.component';
import { UsiNutanixCrudComponent } from './usi-nutanix/usi-nutanix-crud/usi-nutanix-crud.component';
import { UsiNutanixDiscovedDevicesComponent } from './usi-nutanix/usi-nutanix-discoved-devices/usi-nutanix-discoved-devices.component';
import { UsiNutanixComponent } from './usi-nutanix/usi-nutanix.component';
import { UsioSdwanCrudComponent } from './usi-others/usio-sdwan/usio-sdwan-crud/usio-sdwan-crud.component';
import { UsioSdwanComponent } from './usi-others/usio-sdwan/usio-sdwan.component';
import { UsioVeeamBackupVmsComponent } from './usi-others/usio-veeam/usio-veeam-backups/usio-veeam-backup-vms/usio-veeam-backup-vms.component';
import { UsioVeeamBackupsComponent } from './usi-others/usio-veeam/usio-veeam-backups/usio-veeam-backups.component';
import { UsioVeeamCrudComponent } from './usi-others/usio-veeam/usio-veeam-crud/usio-veeam-crud.component';
import { UsioVeeamComponent } from './usi-others/usio-veeam/usio-veeam.component';
import { UsiPcVmwareVcenterCrudComponent } from './usi-private-clouds/usi-pc-vmware-vcenter-crud/usi-pc-vmware-vcenter-crud.component';
import { UsiPrivateCloudsResourcesComponent } from './usi-private-clouds/usi-private-clouds-resources/usi-private-clouds-resources.component';
import { UsiPrivateCloudsComponent } from './usi-private-clouds/usi-private-clouds.component';
import { UsiPublicCloudAwsCrudComponent } from './usi-public-cloud-aws/usi-public-cloud-aws-crud/usi-public-cloud-aws-crud.component';
import { UsiPublicCloudAwsResourceDataComponent } from './usi-public-cloud-aws/usi-public-cloud-aws-resource-data/usi-public-cloud-aws-resource-data.component';
import { UsiPublicCloudAwsResourcesComponent } from './usi-public-cloud-aws/usi-public-cloud-aws-resources/usi-public-cloud-aws-resources.component';
import { UsiPublicCloudAzureCrudComponent } from './usi-public-cloud-azure/usi-public-cloud-azure-crud/usi-public-cloud-azure-crud.component';
import { UsiPublicCloudAzureResourceDataComponent } from './usi-public-cloud-azure/usi-public-cloud-azure-resource-data/usi-public-cloud-azure-resource-data.component';
import { UsiPublicCloudAzureResourcesComponent } from './usi-public-cloud-azure/usi-public-cloud-azure-resources/usi-public-cloud-azure-resources.component';
import { UsiPublicCloudGcpCrudComponent } from './usi-public-cloud-gcp/usi-public-cloud-gcp-crud/usi-public-cloud-gcp-crud.component';
import { UsiPublicCloudGcpResourceDataComponent } from './usi-public-cloud-gcp/usi-public-cloud-gcp-resource-data/usi-public-cloud-gcp-resource-data.component';
import { UsiPublicCloudGcpResourcesComponent } from './usi-public-cloud-gcp/usi-public-cloud-gcp-resources/usi-public-cloud-gcp-resources.component';
import { UsiPublicCloudOracleCrudComponent } from './usi-public-cloud-oracle/usi-public-cloud-oracle-crud/usi-public-cloud-oracle-crud.component';
import { UsiPublicCloudOracleResourceDataComponent } from './usi-public-cloud-oracle/usi-public-cloud-oracle-resource-data/usi-public-cloud-oracle-resource-data.component';
import { UsiPublicCloudOracleResourcesComponent } from './usi-public-cloud-oracle/usi-public-cloud-oracle-resources/usi-public-cloud-oracle-resources.component';
import { UsiPublicCloudsComponent } from './usi-public-clouds/usi-public-clouds.component';
import { UsiServicenowCrudComponent } from './usi-servicenow/usi-servicenow-crud/usi-servicenow-crud.component';
import { UsiServicenowIreRulesComponent } from './usi-servicenow/usi-servicenow-ire-rules/usi-servicenow-ire-rules.component';
import { UsiServicenowComponent } from './usi-servicenow/usi-servicenow.component';
import { UsisPureCrudComponent } from './usi-storage/usis-pure/usis-pure-crud/usis-pure-crud.component';
import { UsisPureComponent } from './usi-storage/usis-pure/usis-pure.component';
import { UsiUnityoneItsmCrudComponent } from './usi-unityone-itsm/usi-unityone-itsm-crud/usi-unityone-itsm-crud.component';
import { UsiUnityoneItsmComponent } from './usi-unityone-itsm/usi-unityone-itsm.component';
import { UsiVaultsCrudComponent } from './usi-vaults/usi-vaults-crud/usi-vaults-crud.component';
import { UsiVaultsCyberarcComponent } from './usi-vaults/usi-vaults-cyberarc/usi-vaults-cyberarc.component';
import { UsiWorkflowIntegrationCrudComponent } from './usi-workflow-integration/usi-workflow-integration-crud/usi-workflow-integration-crud.component';
import { UsiWorkflowIntegrationHistoryComponent } from './usi-workflow-integration/usi-workflow-integration-history/usi-workflow-integration-history.component';
import { UsiWorkflowIntegrationComponent } from './usi-workflow-integration/usi-workflow-integration.component';

const routes: Routes = [
  {
    path: '',
    component: UnitySetupIntegrationComponent,
    data: {
      breadcrumb: {
        title: 'Integration'
      }
    }
  },
  {
    path: '',
    data: {
      breadcrumb: {
        title: 'Integration'
      }
    },
    children: [
      // {
      //   path: 'azure-account',
      //   component: UsiPublicCloudAzureCrudComponent,
      //   data: {
      //     breadcrumb: {
      //       title: 'Azure account'
      //     }
      //   }
      // },
      // {
      //   path: 'azure/instances',
      //   component: UsiPublicCloudAzureComponent,
      //   data: {
      //     breadcrumb: {
      //       title: 'Azure instances'
      //     }
      //   }
      // },
      {
        path: 'azure/instances',
        component: UsiPublicCloudsComponent,
        data: {
          breadcrumb: {
            title: 'Azure instances'
          }
        }
      },
      {
        path: 'azure/add',
        component: UsiPublicCloudAzureCrudComponent,
        data: {
          breadcrumb: {
            title: 'Azure account'
          }
        }
      },
      {
        path: 'azure/instances/:instanceId/edit',
        component: UsiPublicCloudAzureCrudComponent,
        data: {
          breadcrumb: {
            title: 'Azure account'
          }
        }
      },
      {
        path: 'azure/instances/:instanceId/resources',
        component: UsiPublicCloudAzureResourcesComponent,
        data: {
          breadcrumb: {
            title: 'Azure Resources'
          }
        }
      },
      {
        path: 'azure/instances/:instanceId/resources/:resourceId',
        component: UsiPublicCloudAzureResourceDataComponent,
        data: {
          breadcrumb: {
            title: 'Azure Resources'
          }
        }
      },
      // {
      //   path: 'aws-account',
      //   component: UsiPublicCloudAwsCrudComponent,
      //   data: {
      //     breadcrumb: {
      //       title: 'Aws account'
      //     }
      //   }
      // },
      {
        path: 'aws/add',
        component: UsiPublicCloudAwsCrudComponent,
        data: {
          breadcrumb: {
            title: 'Aws account'
          }
        }
      },
      {
        path: 'aws/instances',
        component: UsiPublicCloudsComponent,
        data: {
          breadcrumb: {
            title: 'Aws instances',
          }
        }
      },
      {
        path: 'aws/instances/:instanceId/edit',
        component: UsiPublicCloudAwsCrudComponent,
        data: {
          breadcrumb: {
            title: 'Aws account'
          }
        }
      },
      {
        path: 'aws/instances/:instanceId/resources',
        component: UsiPublicCloudAwsResourcesComponent,
        data: {
          breadcrumb: {
            title: 'Aws Resources'
          }
        }
      },
      {
        path: 'aws/instances/:instanceId/resources/:resourceId',
        component: UsiPublicCloudAwsResourceDataComponent,
        data: {
          breadcrumb: {
            title: 'Aws Resources'
          }
        }
      },
      {
        path: 'aws/instances/:deviceid/zbx',
        component: AwsZabbixComponent,
        data: {
          breadcrumb: {
            title: 'Aws Accounts',
          }
        },
        children: ZABBIX_AWS_ACCOUNT_ROUTES
      },
      // {
      //   path: 'gcp-account',
      //   component: UsiPublicCloudGcpCrudComponent,
      //   data: {
      //     breadcrumb: {
      //       title: 'GCP account'
      //     }
      //   }
      // },
      {
        path: 'gcp/instances',
        component: UsiPublicCloudsComponent,
        data: {
          breadcrumb: {
            title: 'GCP instances'
          }
        }
      },
      {
        path: 'gcp/add',
        component: UsiPublicCloudGcpCrudComponent,
        data: {
          breadcrumb: {
            title: 'GCP account'
          }
        }
      },
      {
        path: 'gcp/instances/:instanceId/edit',
        component: UsiPublicCloudGcpCrudComponent,
        data: {
          breadcrumb: {
            title: 'GCP account'
          }
        }
      },
      {
        path: 'gcp/instances/:instanceId/resources',
        component: UsiPublicCloudGcpResourcesComponent,
        data: {
          breadcrumb: {
            title: 'GCP Resources'
          }
        }
      },
      {
        path: 'gcp/instances/:instanceId/resources/:resourceId',
        component: UsiPublicCloudGcpResourceDataComponent,
        data: {
          breadcrumb: {
            title: 'GCP Resource Details'
          }
        }
      },
      // {
      //   path: 'oracle/instances',
      //   component: UsiPublicCloudOracleComponent,
      //   data: {
      //     breadcrumb: {
      //       title: 'Oracle Instances'
      //     }
      //   }
      // },
      {
        path: 'oracle/instances',
        component: UsiPublicCloudsComponent,
        data: {
          breadcrumb: {
            title: 'Oracle Instances'
          }
        }
      },
      {
        path: 'oracle/instances/:instanceId/resources',
        component: UsiPublicCloudOracleResourcesComponent,
        data: {
          breadcrumb: {
            title: 'Oracle Resources'
          }
        }
      },
      {
        path: 'oracle/instances/:instanceId/resources/:resourceId',
        component: UsiPublicCloudOracleResourceDataComponent,
        data: {
          breadcrumb: {
            title: 'Oracle Resource'
          }
        }
      },
      {
        path: 'oracle/add',
        component: UsiPublicCloudOracleCrudComponent,
        data: {
          breadcrumb: {
            title: 'Oracle Account'
          }
        }
      },
      {
        path: 'oracle/instances/:instanceId/edit',
        component: UsiPublicCloudOracleCrudComponent,
        data: {
          breadcrumb: {
            title: 'Oracle Account'
          }
        }
      },
      {
        path: 'servicenow',
        component: UsiServicenowCrudComponent,
        data: {
          breadcrumb: {
            title: 'ServiceNow'
          }
        }
      },
      {
        path: 'servicenow/instances',
        component: UsiServicenowComponent,
        data: {
          breadcrumb: {
            title: 'ServiceNow'
          }
        }
      },
      {
        path: 'servicenow/instances/create',
        component: UsiServicenowCrudComponent,
        data: {
          breadcrumb: {
            title: 'ServiceNow'
          }
        }
      },
      {
        path: 'servicenow/:snId/edit',
        component: UsiServicenowCrudComponent,
        data: {
          breadcrumb: {
            title: 'ServiceNow'
          }
        }
      },
      {
        path: 'servicenow/instances/:snId/edit',
        component: UsiServicenowCrudComponent,
        data: {
          breadcrumb: {
            title: 'ServiceNow'
          }
        }
      },
      {
        path: 'servicenow/:snId/IRERules',
        component: UsiServicenowIreRulesComponent,
        data: {
          breadcrumb: {
            title: 'ServiceNow'
          }
        }
      },
      {
        path: 'servicenow/instances/:snId/IRERules',
        component: UsiServicenowIreRulesComponent,
        data: {
          breadcrumb: {
            title: 'ServiceNow'
          }
        }
      },
      {
        path: 'bmchelix',
        component: UsiBmcHelixCrudComponent,
        data: {
          breadcrumb: {
            title: 'BMC Helix'
          }
        }
      },
      {
        path: 'bmchelix/instances',
        component: UsiBmcHelixComponent,
        data: {
          breadcrumb: {
            title: 'BMC Helix'
          }
        }
      },
      {
        path: 'bmchelix/instances/create',
        component: UsiBmcHelixCrudComponent,
        data: {
          breadcrumb: {
            title: 'BMC Helix'
          }
        }
      },
      {
        path: 'bmchelix/instances/:id/edit',
        component: UsiBmcHelixCrudComponent,
        data: {
          breadcrumb: {
            title: 'BMC Helix'
          }
        }
      },
      {
        path: 'manage-engine',
        component: UsiManageEngineCrudComponent,
        data: {
          breadcrumb: {
            title: 'Manage Engine'
          }
        }
      },
      {
        path: 'manage-engine/instances',
        component: UsiManageEngineComponent,
        data: {
          breadcrumb: {
            title: 'Manage Engine'
          }
        }
      },
      {
        path: 'manage-engine/instances/create',
        component: UsiManageEngineCrudComponent,
        data: {
          breadcrumb: {
            title: 'Manage Engine'
          }
        }
      },
      {
        path: 'manage-engine/instances/:id/edit',
        component: UsiManageEngineCrudComponent,
        data: {
          breadcrumb: {
            title: 'Manage Engine'
          }
        }
      },
      {
        path: 'nutanix',
        component: UsiNutanixComponent,
        data: {
          breadcrumb: {
            title: 'Nutanix'
          }
        }
      },
      {
        path: 'nutanix/add',
        component: UsiNutanixCrudComponent,
        data: {
          breadcrumb: {
            title: 'Nutanix'
          }
        }
      },
      {
        path: 'nutanix/:instanceId/edit',
        component: UsiNutanixCrudComponent,
        data: {
          breadcrumb: {
            title: 'Nutanix'
          }
        }
      },
      {
        path: 'nutanix/:instanceId/discovery',
        component: UsiNutanixDiscovedDevicesComponent,
        data: {
          breadcrumb: {
            title: 'Nutanix'
          }
        }
      },
      {
        path: 'msdynamics',
        component: UsiMsDynamicsCrmCrudComponent,
        data: {
          breadcrumb: {
            title: 'Microsoft Dynamics CRM'
          }
        }
      },
      {
        path: 'msdynamics/instances',
        component: UsiMsDynamicsCRMComponent,
        data: {
          breadcrumb: {
            title: 'Microsoft Dynamics CRM'
          }
        }
      },
      {
        path: 'msdynamics/instances/create',
        component: UsiMsDynamicsCrmCrudComponent,
        data: {
          breadcrumb: {
            title: 'Microsoft Dynamics CRM'
          }
        }
      },
      {
        path: 'msdynamics/instances/:instanceId/edit',
        component: UsiMsDynamicsCrmCrudComponent,
        data: {
          breadcrumb: {
            title: 'Microsoft Dynamics CRM'
          }
        }
      },
      {
        path: 'jira',
        component: UsiJiraCrudComponent,
        data: {
          breadcrumb: {
            title: 'JIRA'
          }
        }
      },
      {
        path: 'jira/instances',
        component: UsiJiraComponent,
        data: {
          breadcrumb: {
            title: 'JIRA'
          }
        }
      },
      {
        path: 'jira/instances/create',
        component: UsiJiraCrudComponent,
        data: {
          breadcrumb: {
            title: 'JIRA'
          }
        }
      },
      {
        path: 'jira/instances/:instanceId/edit',
        component: UsiJiraCrudComponent,
        data: {
          breadcrumb: {
            title: 'JIRA'
          }
        }
      },
      {
        path: 'ldap-config',
        component: UnitySetupLdapConfigComponent,
        data: {
          breadcrumb: {
            title: 'LDAP Config'
          }
        }
      },
      {
        path: 'ldap-config/create',
        component: UnitySetupLdapCrudComponent,
        data: {
          breadcrumb: {
            title: 'LDAP Config Create'
          }
        }
      },
      {
        path: 'ldap-config/:ldapConfigId/edit',
        component: UnitySetupLdapCrudComponent,
        data: {
          breadcrumb: {
            title: 'LDAP Config Edit'
          }
        }
      },
      {
        path: 'ldap-config/:ldapConfigId/ldap-user-import',
        component: UnitySetupLdapUserImportComponent,
        data: {
          breadcrumb: {
            title: 'LDAP User Import'
          }
        }
      },
      {
        path: 'import-data',
        component: UsiImportDataComponent,
        data: {
          breadcrumb: {
            title: 'Import Data'
          }
        }
      },
      {
        path: 'import-data/create',
        component: UsiImportDataCrudComponent,
        data: {
          breadcrumb: {
            title: 'Import Data Create'
          }
        }
      },
      {
        path: 'pure-storage',
        component: UsisPureComponent,
        data: {
          breadcrumb: {
            title: 'Pure Storage'
          }
        }
      },
      {
        path: 'storage/add',
        component: UsiOntapCrudNewComponent,
        data: {
          breadcrumb: {
            title: 'OnTap Storage'
          }
        }
      },
      {
        path: 'storage/:storageId/edit',
        component: UsiOntapCrudNewComponent,
        data: {
          breadcrumb: {
            title: 'OnTap Storage'
          }
        }
      },
      {
        path: 'pure-storage/add',
        component: UsisPureCrudComponent,
        data: {
          breadcrumb: {
            title: 'Pure Storage'
          }
        }
      },
      {
        path: 'pure-storage/:deviceId/edit',
        component: UsisPureCrudComponent,
        data: {
          breadcrumb: {
            title: 'Pure Storage'
          }
        }
      },
      {
        path: 'nagios',
        component: UsiEventIngestionNagiosComponent,
        data: {
          breadcrumb: {
            title: 'Nagios Event Ingestion'
          }
        }
      },
      {
        path: 'nagios/add',
        component: UsiEventIngestionCommonComponent,
        data: {
          breadcrumb: {
            title: 'Nagios Event Ingestion'
          }
        }
      },
      {
        path: 'nagios/:integrationId/edit',
        component: UsiEventIngestionCommonComponent,
        data: {
          breadcrumb: {
            title: 'Nagios Event Ingestion'
          }
        }
      },
      {
        path: 'zabbix',
        component: UsiEventIngestionZabbixComponent,
        data: {
          breadcrumb: {
            title: 'Zabbix Event Ingestion'
          }
        }
      },
      {
        path: 'zabbix/add',
        component: UsiEventIngestionCommonComponent,
        data: {
          breadcrumb: {
            title: 'Zabbix Event Ingestion'
          }
        }
      },
      {
        path: 'zabbix/:integrationId/edit',
        component: UsiEventIngestionCommonComponent,
        data: {
          breadcrumb: {
            title: 'Zabbix Event Ingestion'
          }
        }
      },
      {
        path: 'azure',
        component: UsiEventIngestionAzureComponent,
        data: {
          breadcrumb: {
            title: 'Azure Event Ingestion'
          }
        }
      },
      {
        path: 'gcp',
        component: UsiEventIngestionGcpComponent,
        data: {
          breadcrumb: {
            title: 'GCP Event Ingestion'
          }
        }
      },
      {
        path: 'aws',
        component: UsiEventIngestionAwsComponent,
        data: {
          breadcrumb: {
            title: 'AWS Event Ingestion'
          }
        }
      },
      {
        path: 'oci',
        component: UsiEventIngestionOciComponent,
        data: {
          breadcrumb: {
            title: 'OCI Event Ingestion'
          }
        }
      },
      {
        path: 'opsramp',
        component: UsiEventIngestionOpsrampComponent,
        data: {
          breadcrumb: {
            title: 'OpsRamp Event Ingestion'
          }
        }
      },
      {
        path: 'opsramp/add',
        component: UsiEventIngestionCommonComponent,
        data: {
          breadcrumb: {
            title: 'Opsramp Event Ingestion'
          }
        }
      },
      {
        path: 'opsramp/:integrationId/edit',
        component: UsiEventIngestionCommonComponent,
        data: {
          breadcrumb: {
            title: 'Opsramp Event Ingestion'
          }
        }
      },
      {
        path: 'solarwinds',
        component: UsiEventIngestionSolarwindsComponent,
        data: {
          breadcrumb: {
            title: 'SolarWinds Event Ingestion'
          }
        }
      },
      {
        path: 'appdynamics',
        component: UsiEventIngestionAppDynamicsComponent,
        data: {
          breadcrumb: {
            title: 'AppDynamics Event Ingestion'
          }
        }
      },
      {
        path: 'appdynamics/add',
        component: UsiEventIngestionCommonComponent,
        data: {
          breadcrumb: {
            title: 'App Dynamics Event Ingestion'
          }
        }
      },
      {
        path: 'appdynamics/:integrationId/edit',
        component: UsiEventIngestionCommonComponent,
        data: {
          breadcrumb: {
            title: 'App Dynamics Event Ingestion'
          }
        }
      },
      {
        path: 'logicmonitor',
        component: UsiEventIngestionLogicMonitorComponent,
        data: {
          breadcrumb: {
            title: 'Logic Monitor Event Ingestion'
          }
        }
      },
      {
        path: 'logicmonitor/add',
        component: UsiEventIngestionCommonComponent,
        data: {
          breadcrumb: {
            title: 'Logicmonitor Event Ingestion'
          }
        }
      },
      {
        path: 'logicmonitor/:integrationId/edit',
        component: UsiEventIngestionCommonComponent,
        data: {
          breadcrumb: {
            title: 'Logicmonitor Event Ingestion'
          }
        }
      },
      {
        path: 'dynatrace',
        component: UsiEventIngestonDynatraceComponent,
        data: {
          breadcrumb: {
            title: 'Dynatrace Event Ingestion'
          }
        }
      },
      {
        path: 'dynatrace/add',
        component: UsiEventIngestionCommonComponent,
        data: {
          breadcrumb: {
            title: 'Dynatrace Event Ingestion'
          }
        }
      },
      {
        path: 'dynatrace/:integrationId/edit',
        component: UsiEventIngestionCommonComponent,
        data: {
          breadcrumb: {
            title: 'Dynatrace Event Ingestion'
          }
        }
      },
      {
        path: 'new-relic',
        component: UsiEventIngestionNewRelicComponent,
        data: {
          breadcrumb: {
            title: 'New Relic Event Ingestion'
          }
        }
      },
      {
        path: 'new-relic/add',
        component: UsiEventIngestionCommonComponent,
        data: {
          breadcrumb: {
            title: 'New Relic Event Ingestion'
          }
        }
      },
      {
        path: 'new-relic/:integrationId/edit',
        component: UsiEventIngestionCommonComponent,
        data: {
          breadcrumb: {
            title: 'New Relic Event Ingestion'
          }
        }
      },
      {
        path: 'vmware-vcenter',
        component: UsiPrivateCloudsComponent,
        data: {
          breadcrumb: {
            title: 'VMvare VCenter Instances'
          }
        }
      },
      {
        path: 'vmware-vcenter/add',
        component: UsiPcVmwareVcenterCrudComponent,
        data: {
          breadcrumb: {
            title: 'VMvare VCenter Create'
          }
        }
      },
      {
        path: 'vmware-vcenter/:instanceId/edit',
        component: UsiPcVmwareVcenterCrudComponent,
        data: {
          breadcrumb: {
            title: 'VMvare VCenter Create'
          }
        }
      },
      {
        path: 'vmware-vcenter/:instanceId/resources',
        component: UsiPrivateCloudsResourcesComponent,
        data: {
          breadcrumb: {
            title: 'VMvare VCenter Resources'
          }
        }
      },
      {
        path: 'unity-vcenter',
        component: UsiPrivateCloudsComponent,
        data: {
          breadcrumb: {
            title: 'United Private Cloud VMvare VCenter Instances'
          }
        }
      },
      {
        path: 'unity-vcenter/add',
        component: UsiPcVmwareVcenterCrudComponent,
        data: {
          breadcrumb: {
            title: 'United Private Cloud VMvare VCenter Create'
          }
        }
      },
      {
        path: 'unity-vcenter/:instanceId/edit',
        component: UsiPcVmwareVcenterCrudComponent,
        data: {
          breadcrumb: {
            title: 'United Private Cloud VMvare VCenter Edit'
          }
        }
      },
      {
        path: 'unity-vcenter/:instanceId/resources',
        component: UsiPrivateCloudsResourcesComponent,
        data: {
          breadcrumb: {
            title: 'United Private Cloud VMvare VCenter Resources'
          }
        }
      },
      {
        path: 'custom',
        component: UsiEventIngestionCustomListComponent,
        data: {
          breadcrumb: {
            title: 'Custom Event Ingestion'
          }
        }
      },
      {
        path: 'custom/crud',
        component: UsiEventIngestionCustomCrudComponent,
        data: {
          breadcrumb: {
            title: 'Custom Event Ingestion'
          }
        }
      },
      {
        path: 'custom/:instanceId/edit',
        component: UsiEventIngestionCustomCrudComponent,
        data: {
          breadcrumb: {
            title: 'Custom Event Ingestion'
          }
        }
      },
      {
        path: 'email',
        component: UsiEventIngestionEmailComponent,
        data: {
          breadcrumb: {
            title: 'Email'
          }
        }
      },
      {
        path: 'email/crud',
        component: UsiEventIngestionEmailCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create'
          }
        }
      },
      {
        path: 'email/:instanceId/edit',
        component: UsiEventIngestionEmailCrudComponent,
        data: {
          breadcrumb: {
            title: 'Edit'
          }
        }
      },
      {
        path: 'email/:instanceId/history',
        component: UsiEventIngestionEmailHistoryComponent,
        data: {
          breadcrumb: {
            title: 'History'
          }
        }
      },
      {
        path: 'workflow',
        component: UsiWorkflowIntegrationComponent,
        data: {
          breadcrumb: {
            title: 'Workflow'
          }
        }
      },
      {
        path: 'workflow/create',
        component: UsiWorkflowIntegrationCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create'
          }
        }
      },
      {
        path: 'workflow/:workflowId/edit',
        component: UsiWorkflowIntegrationCrudComponent,
        data: {
          breadcrumb: {
            title: 'Edit'
          }
        }
      },
      {
        path: 'workflow/:workflowId/history',
        component: UsiWorkflowIntegrationHistoryComponent,
        data: {
          breadcrumb: {
            title: 'Edit'
          }
        }
      },
      {
        path: 'veeam',
        component: UsioVeeamComponent,
        data: {
          breadcrumb: {
            title: 'Veeam'
          }
        }
      },
      {
        path: 'veeam/create',
        component: UsioVeeamCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create'
          }
        }
      },
      {
        path: 'veeam/:veeamId/edit',
        component: UsioVeeamCrudComponent,
        data: {
          breadcrumb: {
            title: 'Edit'
          }
        }
      },
      {
        path: 'veeam/:veeamId/backups',
        component: UsioVeeamBackupsComponent,
        data: {
          breadcrumb: {
            title: 'Backups'
          }
        }
      },
      {
        path: 'veeam/:veeamId/backups/:backupId/backup-vms',
        component: UsioVeeamBackupVmsComponent,
        data: {
          breadcrumb: {
            title: 'Backup VMs'
          }
        }
      },
      {
        path: 'veeam/:veeamId/backups/:backupId/backup-vms/:backupId/vm-backup-history',
        component: VmBackupHistoryComponent,
        data: {
          breadcrumb: {
            title: 'VM Backup History'
          }
        }
      },
      {
        path: 'sdwan',
        component: UsioSdwanComponent,
        data: {
          breadcrumb: {
            title: 'Sdwan'
          }
        }
      },
      {
        path: 'sdwan/create',
        component: UsioSdwanCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create'
          }
        }
      },
      {
        path: 'sdwan/:sdwanId/edit',
        component: UsioSdwanCrudComponent,
        data: {
          breadcrumb: {
            title: 'Edit'
          }
        }
      },
      {
        path: 'viptela',
        component: UsincViptelaComponent,
        data: {
          breadcrumb: {
            title: 'Viptela'
          }
        }
      },
      {
        path: 'viptela/create',
        component: UsincViptelaCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create'
          }
        }
      },
      {
        path: 'viptela/:viptelaId/edit',
        component: UsincViptelaCrudComponent,
        data: {
          breadcrumb: {
            title: 'Edit'
          }
        }
      },
      {
        path: 'meraki',
        component: UsincCiscoMerakiComponent,
        data: {
          breadcrumb: {
            title: 'Meraki'
          }
        }
      },
      {
        path: 'meraki/create',
        component: UsincCiscoMerakiCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create'
          }
        }
      },
      {
        path: 'meraki/:merakiId/edit',
        component: UsincCiscoMerakiCrudComponent,
        data: {
          breadcrumb: {
            title: 'Edit'
          }
        }
      },
      {
        path: 'meraki/:merakiId/history',
        component: UsincCiscoMerakiHistoryComponent,
        data: {
          breadcrumb: {
            title: 'Schedule History'
          }
        }
      },
      {
        path: ':pcType/add',
        component: PcCrudComponent,
        data: {
          breadcrumb: {
            title: 'Integrate Private Cloud'
          }
        }
      },
      {
        path: 'vaults',
        component: UsiVaultsCyberarcComponent,
        data: {
          breadcrumb: {
            title: 'Vaults'
          }
        }
      },
      {
        path: 'vaults/create',
        component: UsiVaultsCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create Vault'
          }
        }
      },
      {
        path: 'vaults/:vaultId/edit',
        component: UsiVaultsCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create Vault'
          }
        }
      },
      {
        path: 'unityone-itsm',
        component: UsiUnityoneItsmCrudComponent,
        data: {
          breadcrumb: {
            title: 'UnityOne ITSM'
          }
        }
      },
      {
        path: 'unityone-itsm/instances',
        component: UsiUnityoneItsmComponent,
        data: {
          breadcrumb: {
            title: 'UnityOne ITSM'
          }
        }
      },
      {
        path: 'unityone-itsm/instances/create',
        component: UsiUnityoneItsmCrudComponent,
        data: {
          breadcrumb: {
            title: 'UnityOne ITSM'
          }
        }
      },
      {
        path: 'unityone-itsm/instances/:id/edit',
        component: UsiUnityoneItsmCrudComponent,
        data: {
          breadcrumb: {
            title: 'UnityOne ITSM'
          }
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnitySetupIntegrationRoutingModule { }