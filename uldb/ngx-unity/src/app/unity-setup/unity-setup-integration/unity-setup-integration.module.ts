import { NgModule } from '@angular/core';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { UnitySetupIntegrationRoutingModule } from './unity-setup-integration-routing.module';
import { UnitySetupIntegrationWidgetComponent } from './unity-setup-integration-widget/unity-setup-integration-widget.component';
import { UnitySetupIntegrationComponent } from './unity-setup-integration.component';
import { UsiJiraCrudComponent } from './usi-jira/usi-jira-crud/usi-jira-crud.component';
import { UsiJiraCrudService } from './usi-jira/usi-jira-crud/usi-jira-crud.service';
import { UsiJiraWidgetComponent } from './usi-jira/usi-jira-widget/usi-jira-widget.component';
import { UsiJiraComponent } from './usi-jira/usi-jira.component';
import { UsiLdapWidgetComponent } from './usi-ldap-widget/usi-ldap-widget.component';
import { UsiMsDynamicsCrmCrudComponent } from './usi-ms-dynamics-crm/usi-ms-dynamics-crm-crud/usi-ms-dynamics-crm-crud.component';
import { UsiMsDynamicsCrmCrudService } from './usi-ms-dynamics-crm/usi-ms-dynamics-crm-crud/usi-ms-dynamics-crm-crud.service';
import { UsiMsDynamicsCrmWidgetComponent } from './usi-ms-dynamics-crm/usi-ms-dynamics-crm-widget/usi-ms-dynamics-crm-widget.component';
import { UsiMsDynamicsCRMComponent } from './usi-ms-dynamics-crm/usi-ms-dynamics-crm.component';
import { UsiPcCrudComponent } from './usi-pc-crud/usi-pc-crud.component';
import { UsiPublicCloudAwsWidgetComponent } from './usi-public-cloud-aws-widget/usi-public-cloud-aws-widget.component';
import { UsiPublicCloudAzureWidgetComponent } from './usi-public-cloud-azure-widget/usi-public-cloud-azure-widget.component';
import { UsiPublicCloudGcpWidgetComponent } from './usi-public-cloud-gcp-widget/usi-public-cloud-gcp-widget.component';
import { UsiPublicCloudOracleWidgetComponent } from './usi-public-cloud-oracle-widget/usi-public-cloud-oracle-widget.component';
import { UsiServicenowCrudComponent } from './usi-servicenow/usi-servicenow-crud/usi-servicenow-crud.component';
import { UsiServicenowCrudService } from './usi-servicenow/usi-servicenow-crud/usi-servicenow-crud.service';
import { UsiServicenowWidgetComponent } from './usi-servicenow/usi-servicenow-widget/usi-servicenow-widget.component';
import { UsiServicenowComponent } from './usi-servicenow/usi-servicenow.component';
import { UsiImportDataComponent } from './usi-import-data/usi-import-data.component';
import { UsiImportDataCrudComponent } from './usi-import-data/usi-import-data-crud/usi-import-data-crud.component';
import { UsiImportDataWidgetComponent } from './usi-import-data/usi-import-data-widget/usi-import-data-widget.component';
import { UsiImportSustainabilityDataComponent } from './usi-import-data/usi-import-data-crud/usi-import-sustainability-data/usi-import-sustainability-data.component';
import { UsiImportAwsDataComponent } from './usi-import-data/usi-import-data-crud/usi-import-sustainability-data/usi-import-aws-data/usi-import-aws-data.component';
import { UsiImportDataCrudService } from './usi-import-data/usi-import-data-crud/usi-import-data-crud.service';
import { UsiOntapWidgetComponent } from './usi-ontap-widget/usi-ontap-widget.component';
import { UsiEventIngestionNagiosWidgetComponent } from './usi-event-ingestion-nagios/usi-event-ingestion-nagios-widget/usi-event-ingestion-nagios-widget.component';
import { UsiEventIngestionNagiosComponent } from './usi-event-ingestion-nagios/usi-event-ingestion-nagios.component';
import { UsiEventIngestionNagiosCrudComponent } from './usi-event-ingestion-nagios/usi-event-ingestion-nagios-crud/usi-event-ingestion-nagios-crud.component';
import { UsiEventIngestionNagiosCrudService } from './usi-event-ingestion-nagios/usi-event-ingestion-nagios-crud/usi-event-ingestion-nagios-crud.service';
import { UsiEventIngestionAzureComponent } from './usi-event-ingestion-azure/usi-event-ingestion-azure.component';
import { UsiEventIngestionAzureWidgetComponent } from './usi-event-ingestion-azure/usi-event-ingestion-azure-widget/usi-event-ingestion-azure-widget.component';
import { UsiEventIngestionAzureCrudComponent } from './usi-event-ingestion-azure/usi-event-ingestion-azure-crud/usi-event-ingestion-azure-crud.component';
import { UsiEventIngestionAzureCrudService } from './usi-event-ingestion-azure/usi-event-ingestion-azure-crud/usi-event-ingestion-azure-crud.service';
import { UsiEventIngestionZabbixComponent } from './usi-event-ingestion-zabbix/usi-event-ingestion-zabbix.component';
import { UsiEventIngestionZabbixWidgetComponent } from './usi-event-ingestion-zabbix/usi-event-ingestion-zabbix-widget/usi-event-ingestion-zabbix-widget.component';
import { UsiEventIngestionZabbixCrudComponent } from './usi-event-ingestion-zabbix/usi-event-ingestion-zabbix-crud/usi-event-ingestion-zabbix-crud.component';
import { UsiEventIngestionZabbixCrudService } from './usi-event-ingestion-zabbix/usi-event-ingestion-zabbix-crud/usi-event-ingestion-zabbix-crud.service';
import { UsiPublicCloudAzureComponent } from './usi-public-cloud-azure/usi-public-cloud-azure.component';
import { UsiPublicCloudAzureCrudComponent } from './usi-public-cloud-azure/usi-public-cloud-azure-crud/usi-public-cloud-azure-crud.component';
import { UsiPublicCloudAzureResourcesComponent } from './usi-public-cloud-azure/usi-public-cloud-azure-resources/usi-public-cloud-azure-resources.component';
import { UsiPublicCloudAzureResourceDataComponent } from './usi-public-cloud-azure/usi-public-cloud-azure-resource-data/usi-public-cloud-azure-resource-data.component';
import { UsiEventIngestionGcpComponent } from './usi-event-ingestion-gcp/usi-event-ingestion-gcp.component';
import { UsiEventIngestionGcpWidgetComponent } from './usi-event-ingestion-gcp/usi-event-ingestion-gcp-widget/usi-event-ingestion-gcp-widget.component';
import { UsiEventIngestionGcpCrudComponent } from './usi-event-ingestion-gcp/usi-event-ingestion-gcp-crud/usi-event-ingestion-gcp-crud.component';
import { UsiEventIngestionGcpCrudService } from './usi-event-ingestion-gcp/usi-event-ingestion-gcp-crud/usi-event-ingestion-gcp-crud.service';
import { UsiEventIngestionAwsComponent } from './usi-event-ingestion-aws/usi-event-ingestion-aws.component';
import { UsiEventIngestionAwsCrudComponent } from './usi-event-ingestion-aws/usi-event-ingestion-aws-crud/usi-event-ingestion-aws-crud.component';
import { UsiEventIngestionAwsWidgetComponent } from './usi-event-ingestion-aws/usi-event-ingestion-aws-widget/usi-event-ingestion-aws-widget.component';
import { UsiEventIngestionAwsCrudService } from './usi-event-ingestion-aws/usi-event-ingestion-aws-crud/usi-event-ingestion-aws-crud.service';
import { UsiEventIngestionOciComponent } from './usi-event-ingestion-oci/usi-event-ingestion-oci.component';
import { UsiEventIngestionOciWidgetComponent } from './usi-event-ingestion-oci/usi-event-ingestion-oci-widget/usi-event-ingestion-oci-widget.component';
import { UsiEventIngestionOciCrudComponent } from './usi-event-ingestion-oci/usi-event-ingestion-oci-crud/usi-event-ingestion-oci-crud.component';
import { UsiEventIngestionOciCrudService } from './usi-event-ingestion-oci/usi-event-ingestion-oci-crud/usi-event-ingestion-oci-crud.service';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { UsiPublicCloudAwsComponent } from './usi-public-cloud-aws/usi-public-cloud-aws.component';
import { UsiPublicCloudAwsCrudComponent } from './usi-public-cloud-aws/usi-public-cloud-aws-crud/usi-public-cloud-aws-crud.component';
import { UsiPublicCloudAwsResourcesComponent } from './usi-public-cloud-aws/usi-public-cloud-aws-resources/usi-public-cloud-aws-resources.component';
import { UsiPublicCloudAwsResourceDataComponent } from './usi-public-cloud-aws/usi-public-cloud-aws-resource-data/usi-public-cloud-aws-resource-data.component';
import { UsiServicenowIreRulesComponent } from './usi-servicenow/usi-servicenow-ire-rules/usi-servicenow-ire-rules.component';
import { UsiNutanixComponent } from './usi-nutanix/usi-nutanix.component';
import { UsiNutanixCrudComponent } from './usi-nutanix/usi-nutanix-crud/usi-nutanix-crud.component';
import { UsiPrivateCloudNutanixWidgetComponent } from './usi-private-cloud-nutanix-widget/usi-private-cloud-nutanix-widget.component';
import { UsiNutanixDiscovedDevicesComponent } from './usi-nutanix/usi-nutanix-discoved-devices/usi-nutanix-discoved-devices.component';
import { UsiPublicCloudOracleComponent } from './usi-public-cloud-oracle/usi-public-cloud-oracle.component';
import { UsiPublicCloudOracleCrudComponent } from './usi-public-cloud-oracle/usi-public-cloud-oracle-crud/usi-public-cloud-oracle-crud.component';
import { UsiPublicCloudOracleResourcesComponent } from './usi-public-cloud-oracle/usi-public-cloud-oracle-resources/usi-public-cloud-oracle-resources.component';
import { UsiPublicCloudOracleResourceDataComponent } from './usi-public-cloud-oracle/usi-public-cloud-oracle-resource-data/usi-public-cloud-oracle-resource-data.component';
import { UsiEventIngestionOpsrampComponent } from './usi-event-ingestion-opsramp/usi-event-ingestion-opsramp.component';
import { UsiEventIngestionOpsrampCrudComponent } from './usi-event-ingestion-opsramp/usi-event-ingestion-opsramp-crud/usi-event-ingestion-opsramp-crud.component';
import { UsiEventIngestionOpsrampWidgetComponent } from './usi-event-ingestion-opsramp/usi-event-ingestion-opsramp-widget/usi-event-ingestion-opsramp-widget.component';
import { UsiEventIngestionOpsrampCrudService } from './usi-event-ingestion-opsramp/usi-event-ingestion-opsramp-crud/usi-event-ingestion-opsramp-crud.service';
import { UsiEventIngestionSolarwindsComponent } from './usi-event-ingestion-solarwinds/usi-event-ingestion-solarwinds.component';
import { UsiEventIngestionSolarwindsWidgetsComponent } from './usi-event-ingestion-solarwinds/usi-event-ingestion-solarwinds-widgets/usi-event-ingestion-solarwinds-widgets.component';
import { UsiEventIngestionSolarwindsCrudComponent } from './usi-event-ingestion-solarwinds/usi-event-ingestion-solarwinds-crud/usi-event-ingestion-solarwinds-crud.component';
import { UsiEventIngestionSolarwindsCrudService } from './usi-event-ingestion-solarwinds/usi-event-ingestion-solarwinds-crud/usi-event-ingestion-solarwinds-crud.service';
import { UsiBmcHelixComponent } from './usi-bmc-helix/usi-bmc-helix.component';
import { UsiBmcHelixCrudComponent } from './usi-bmc-helix/usi-bmc-helix-crud/usi-bmc-helix-crud.component';
import { UsiBmcHelixWidgetComponent } from './usi-bmc-helix/usi-bmc-helix-widget/usi-bmc-helix-widget.component';
import { UsiBmcHelixCrudService } from './usi-bmc-helix/usi-bmc-helix-crud/usi-bmc-helix-crud.service';
import { UsiManageEngineComponent } from './usi-manage-engine/usi-manage-engine.component';
import { UsiManageEngineCrudComponent } from './usi-manage-engine/usi-manage-engine-crud/usi-manage-engine-crud.component';
import { UsiManageEngineWidgetComponent } from './usi-manage-engine/usi-manage-engine-widget/usi-manage-engine-widget.component';
import { UsiPcIntegrationWidgetComponent } from './usi-pc-integration-widget/usi-pc-integration-widget.component';
import { UsiEventIngestionAppDynamicsComponent } from './usi-event-ingestion-app-dynamics/usi-event-ingestion-app-dynamics.component';
import { UsiEventIngestionAppDynamicsCrudComponent } from './usi-event-ingestion-app-dynamics/usi-event-ingestion-app-dynamics-crud/usi-event-ingestion-app-dynamics-crud.component';
import { UsiEventIngestionAppDynamicsWidgetComponent } from './usi-event-ingestion-app-dynamics/usi-event-ingestion-app-dynamics-widget/usi-event-ingestion-app-dynamics-widget.component';
import { UsiEventIngestionAppDynamicsCrudService } from './usi-event-ingestion-app-dynamics/usi-event-ingestion-app-dynamics-crud/usi-event-ingestion-app-dynamics-crud.service';
import { UsiEventIngestionLogicMonitorComponent } from './usi-event-ingestion-logic-monitor/usi-event-ingestion-logic-monitor.component';
import { UsiEventIngestionLogicMonitorWidgetComponent } from './usi-event-ingestion-logic-monitor/usi-event-ingestion-logic-monitor-widget/usi-event-ingestion-logic-monitor-widget.component';
import { UsiEventIngestionLogicMonitorCrudComponent } from './usi-event-ingestion-logic-monitor/usi-event-ingestion-logic-monitor-crud/usi-event-ingestion-logic-monitor-crud.component';
import { UsiEventIngestionLogicMonitorCrudService } from './usi-event-ingestion-logic-monitor/usi-event-ingestion-logic-monitor-crud/usi-event-ingestion-logic-monitor-crud.service';
import { UsiEventIngestonDynatraceComponent } from './usi-event-ingeston-dynatrace/usi-event-ingeston-dynatrace.component';
import { UsiEventIngestionDynatraceCrudComponent } from './usi-event-ingeston-dynatrace/usi-event-ingestion-dynatrace-crud/usi-event-ingestion-dynatrace-crud.component';
import { UsiEventIngestionDynatraceWidgetComponent } from './usi-event-ingeston-dynatrace/usi-event-ingestion-dynatrace-widget/usi-event-ingestion-dynatrace-widget.component';
import { UsiEventIngestionDynatraceCrudService } from './usi-event-ingeston-dynatrace/usi-event-ingestion-dynatrace-crud/usi-event-ingestion-dynatrace-crud.service';
import { UsiEventIngestionNewRelicComponent } from './usi-event-ingestion-new-relic/usi-event-ingestion-new-relic.component';
import { UsiEventIngestionNewRelicCrudComponent } from './usi-event-ingestion-new-relic/usi-event-ingestion-new-relic-crud/usi-event-ingestion-new-relic-crud.component';
import { UsiEventIngestionNewRelicWidgetComponent } from './usi-event-ingestion-new-relic/usi-event-ingestion-new-relic-widget/usi-event-ingestion-new-relic-widget.component';
import { UsiEventIngestionNewRelicCrudService } from './usi-event-ingestion-new-relic/usi-event-ingestion-new-relic-crud/usi-event-ingestion-new-relic-crud.service';
import { UsiPrivateCloudsComponent } from './usi-private-clouds/usi-private-clouds.component';
import { UsiPcVmwareVcenterCrudComponent } from './usi-private-clouds/usi-pc-vmware-vcenter-crud/usi-pc-vmware-vcenter-crud.component';
import { UsiEventIngestionCrudComponent } from './usi-event-ingestion/usi-event-ingestion-crud/usi-event-ingestion-crud.component';
import { UsiEventIngestionCustomComponent } from './usi-event-ingestion-custom/usi-event-ingestion-custom.component';
import { UsiEventIngestionCustomCrudComponent } from './usi-event-ingestion-custom/usi-event-ingestion-custom-crud/usi-event-ingestion-custom-crud.component';
import { UsiEventIngestionComponent } from './usi-event-ingestion/usi-event-ingestion.component';
import { UsiEventIngestionCustomListComponent } from './usi-event-ingestion-custom/usi-event-ingestion-custom-list/usi-event-ingestion-custom-list.component';
import { UsiPublicCloudGcpComponent } from './usi-public-cloud-gcp/usi-public-cloud-gcp.component';
import { UsiPublicCloudGcpCrudComponent } from './usi-public-cloud-gcp/usi-public-cloud-gcp-crud/usi-public-cloud-gcp-crud.component';
import { UsiPublicCloudGcpResourcesComponent } from './usi-public-cloud-gcp/usi-public-cloud-gcp-resources/usi-public-cloud-gcp-resources.component';
import { UsiPublicCloudGcpResourceDataComponent } from './usi-public-cloud-gcp/usi-public-cloud-gcp-resource-data/usi-public-cloud-gcp-resource-data.component';
import { UsiWorkflowIntegrationComponent } from './usi-workflow-integration/usi-workflow-integration.component';
import { UsiWorkflowIntegrationWidgetComponent } from './usi-workflow-integration/usi-workflow-integration-widget/usi-workflow-integration-widget.component';
import { UsiWorkflowIntegrationCrudComponent } from './usi-workflow-integration/usi-workflow-integration-crud/usi-workflow-integration-crud.component';
import { UsiPublicCloudsComponent } from './usi-public-clouds/usi-public-clouds.component';
import { UsiPrivateCloudsResourcesComponent } from './usi-private-clouds/usi-private-clouds-resources/usi-private-clouds-resources.component';
import { UsiWorkflowIntegrationHistoryComponent } from './usi-workflow-integration/usi-workflow-integration-history/usi-workflow-integration-history.component';
import { UsiItsmComponent } from './usi-itsm/usi-itsm.component';
import { UsiPublicCloudComponent } from './usi-public-cloud/usi-public-cloud.component';
import { UsiIngestEventComponent } from './usi-ingest-event/usi-ingest-event.component';
import { UsiStorageComponent } from './usi-storage/usi-storage.component';
import { UsisPureComponent } from './usi-storage/usis-pure/usis-pure.component';
import { UsiOthersComponent } from './usi-others/usi-others.component';
import { UsioVeeamComponent } from './usi-others/usio-veeam/usio-veeam.component';
import { UsioVeeamCrudComponent } from './usi-others/usio-veeam/usio-veeam-crud/usio-veeam-crud.component';
import { UsioVeeamBackupsComponent } from './usi-others/usio-veeam/usio-veeam-backups/usio-veeam-backups.component';
import { UsioVeeamBackupVmsComponent } from './usi-others/usio-veeam/usio-veeam-backups/usio-veeam-backup-vms/usio-veeam-backup-vms.component';
import { UsiBmcHelixConfigurationCrudComponent } from './usi-bmc-helix/usi-bmc-helix-crud/usi-bmc-helix-configuration-crud/usi-bmc-helix-configuration-crud.component';
import { UsioSdwanComponent } from './usi-others/usio-sdwan/usio-sdwan.component';
import { UsioSdwanCrudComponent } from './usi-others/usio-sdwan/usio-sdwan-crud/usio-sdwan-crud.component';
import { UsiNetworkControllersComponent } from './usi-network-controllers/usi-network-controllers.component';
import { UsincViptelaComponent } from './usi-network-controllers/usinc-viptela/usinc-viptela.component';
import { UsincViptelaCrudComponent } from './usi-network-controllers/usinc-viptela/usinc-viptela-crud/usinc-viptela-crud.component';
import { UsincCiscoMerakiComponent } from './usi-network-controllers/usinc-cisco-meraki/usinc-cisco-meraki.component';
import { UsincCiscoMerakiCrudComponent } from './usi-network-controllers/usinc-cisco-meraki/usinc-cisco-meraki-crud/usinc-cisco-meraki-crud.component';
import { UsincCiscoMerakiHistoryComponent } from './usi-network-controllers/usinc-cisco-meraki/usinc-cisco-meraki-history/usinc-cisco-meraki-history.component';
import { UsiEventIngestionEmailComponent } from './usi-event-ingestion-email/usi-event-ingestion-email.component';
import { UsiEventIngestionEmailCrudComponent } from './usi-event-ingestion-email/usi-event-ingestion-email-crud/usi-event-ingestion-email-crud.component';
import { UsiEventIngestionEmailHistoryComponent } from './usi-event-ingestion-email/usi-event-ingestion-email-history/usi-event-ingestion-email-history.component';

import { UsisPureCrudComponent } from './usi-storage/usis-pure/usis-pure-crud/usis-pure-crud.component';
import { UsiEventIngestionCommonComponent } from './usi-event-ingestion-common/usi-event-ingestion-common.component';
import { UsiEventIngestionCommonService } from './usi-event-ingestion-common/usi-event-ingestion-common.service';
import { UsiVaultsComponent } from './usi-vaults/usi-vaults.component';
import { UsiVaultsCrudComponent } from './usi-vaults/usi-vaults-crud/usi-vaults-crud.component';
import { UsiVaultsCyberarcComponent } from './usi-vaults/usi-vaults-cyberarc/usi-vaults-cyberarc.component';
import { UsiUnityoneItsmComponent } from './usi-unityone-itsm/usi-unityone-itsm.component';
import { UsiUnityoneItsmCrudComponent } from './usi-unityone-itsm/usi-unityone-itsm-crud/usi-unityone-itsm-crud.component';

@NgModule({
  declarations: [
    UnitySetupIntegrationComponent,
    UsiServicenowComponent,
    UsiMsDynamicsCRMComponent,
    UnitySetupIntegrationWidgetComponent,
    UsiServicenowWidgetComponent,
    UsiMsDynamicsCrmWidgetComponent,
    UsiPublicCloudAwsWidgetComponent,
    UsiPublicCloudAzureWidgetComponent,
    UsiPublicCloudGcpWidgetComponent,
    UsiPublicCloudOracleWidgetComponent,
    UsiPcCrudComponent,
    UsiLdapWidgetComponent,
    UsiServicenowCrudComponent,
    UsiMsDynamicsCrmCrudComponent,
    UsiImportDataComponent,
    UsiImportDataCrudComponent,
    UsiImportDataWidgetComponent,
    UsiImportSustainabilityDataComponent,
    UsiImportAwsDataComponent,
    UsiJiraComponent,
    UsiJiraWidgetComponent,
    UsiJiraCrudComponent,
    UsiOntapWidgetComponent,
    UsiEventIngestionNagiosWidgetComponent,
    UsiEventIngestionNagiosComponent,
    UsiEventIngestionNagiosCrudComponent,
    UsiEventIngestionAzureComponent,
    UsiEventIngestionAzureWidgetComponent,
    UsiEventIngestionAzureCrudComponent,
    UsiEventIngestionZabbixComponent,
    UsiEventIngestionZabbixWidgetComponent,
    UsiEventIngestionZabbixCrudComponent,
    UsiPublicCloudAzureComponent,
    UsiPublicCloudAzureCrudComponent,
    UsiPublicCloudAzureResourcesComponent,
    UsiPublicCloudAzureResourceDataComponent,
    UsiEventIngestionGcpComponent,
    UsiEventIngestionGcpWidgetComponent,
    UsiEventIngestionGcpCrudComponent,
    UsiEventIngestionAwsComponent,
    UsiEventIngestionAwsCrudComponent,
    UsiEventIngestionAwsWidgetComponent,
    UsiEventIngestionOciComponent,
    UsiEventIngestionOciWidgetComponent,
    UsiEventIngestionOciCrudComponent,
    UsiPublicCloudAwsComponent,
    UsiPublicCloudAwsCrudComponent,
    UsiPublicCloudAwsResourcesComponent,
    UsiPublicCloudAwsResourceDataComponent,
    UsiServicenowIreRulesComponent,
    UsiNutanixComponent,
    UsiNutanixCrudComponent,
    UsiPrivateCloudNutanixWidgetComponent,
    UsiNutanixDiscovedDevicesComponent,
    UsiPublicCloudOracleComponent,
    UsiPublicCloudOracleCrudComponent,
    UsiPublicCloudOracleResourcesComponent,
    UsiPublicCloudOracleResourceDataComponent,
    UsiEventIngestionOpsrampComponent,
    UsiEventIngestionOpsrampCrudComponent,
    UsiEventIngestionOpsrampWidgetComponent,
    UsiEventIngestionSolarwindsComponent,
    UsiEventIngestionSolarwindsWidgetsComponent,
    UsiEventIngestionSolarwindsCrudComponent,
    UsiBmcHelixComponent,
    UsiBmcHelixCrudComponent,
    UsiBmcHelixWidgetComponent,
    UsiManageEngineComponent,
    UsiManageEngineCrudComponent,
    UsiManageEngineWidgetComponent,
    UsiPcIntegrationWidgetComponent,
    UsiEventIngestionAppDynamicsComponent,
    UsiEventIngestionAppDynamicsCrudComponent,
    UsiEventIngestionAppDynamicsWidgetComponent,
    UsiEventIngestionLogicMonitorComponent,
    UsiEventIngestionLogicMonitorWidgetComponent,
    UsiEventIngestionLogicMonitorCrudComponent,
    UsiEventIngestonDynatraceComponent,
    UsiEventIngestionDynatraceCrudComponent,
    UsiEventIngestionDynatraceWidgetComponent,
    UsiEventIngestionNewRelicComponent,
    UsiEventIngestionNewRelicCrudComponent,
    UsiEventIngestionNewRelicWidgetComponent,
    UsiPrivateCloudsComponent,
    UsiPcVmwareVcenterCrudComponent,
    UsiEventIngestionCrudComponent,
    UsiEventIngestionCustomComponent,
    UsiEventIngestionCustomCrudComponent,
    UsiEventIngestionComponent,
    UsiEventIngestionCustomListComponent,
    UsiPublicCloudGcpComponent,
    UsiPublicCloudGcpCrudComponent,
    UsiPublicCloudGcpResourcesComponent,
    UsiPublicCloudGcpResourceDataComponent,
    UsiWorkflowIntegrationComponent,
    UsiWorkflowIntegrationWidgetComponent,
    UsiWorkflowIntegrationCrudComponent,
    UsiPublicCloudsComponent,
    UsiPrivateCloudsResourcesComponent,
    UsiWorkflowIntegrationHistoryComponent,
    UsiItsmComponent,
    UsiPublicCloudComponent,
    UsiIngestEventComponent,
    UsiStorageComponent,
    UsisPureComponent,
    UsiOthersComponent,
    UsioVeeamComponent,
    UsioVeeamCrudComponent,
    UsioVeeamBackupsComponent,
    UsioVeeamBackupVmsComponent,
    UsiBmcHelixConfigurationCrudComponent,
    UsioSdwanComponent,
    UsioSdwanCrudComponent,
    UsiNetworkControllersComponent,
    UsincViptelaComponent,
    UsincViptelaCrudComponent,
    UsincCiscoMerakiComponent,
    UsincCiscoMerakiCrudComponent,
    UsincCiscoMerakiHistoryComponent,
    UsiEventIngestionEmailComponent,
    UsiEventIngestionEmailCrudComponent,
    UsiEventIngestionEmailHistoryComponent,
    UsisPureCrudComponent,
    UsiEventIngestionCommonComponent,
    UsiVaultsComponent,
    UsiVaultsCrudComponent,
    UsiVaultsCyberarcComponent,
    UsiUnityoneItsmComponent,
    UsiUnityoneItsmCrudComponent
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    UnitySetupIntegrationRoutingModule,
    CollapseModule,
    // UnitySetupModule
  ],
  providers: [
    UsiServicenowCrudService,
    UsiMsDynamicsCrmCrudService,
    UsiImportDataCrudService,
    UsiJiraCrudService,
    UsiEventIngestionNagiosCrudService,
    UsiEventIngestionAzureCrudService,
    UsiEventIngestionZabbixCrudService,
    UsiEventIngestionGcpCrudService,
    UsiEventIngestionAwsCrudService,
    UsiEventIngestionOciCrudService,
    UsiEventIngestionOpsrampCrudService,
    UsiEventIngestionSolarwindsCrudService,
    UsiBmcHelixCrudService,
    UsiEventIngestionAppDynamicsCrudService,
    UsiEventIngestionLogicMonitorCrudService,
    UsiEventIngestionDynatraceCrudService,
    UsiEventIngestionNewRelicCrudService,
    UsiEventIngestionCommonService
  ]
})
export class UnitySetupIntegrationModule { }
