import { NgModule } from '@angular/core';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { ChartsModule } from 'ng2-charts';
// RECOMMENDED
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AllDevicesAlertsComponent } from './all-devices/all-devices-alerts/all-devices-alerts.component';
import { AllDevicesBmsComponent } from './all-devices/all-devices-bms/all-devices-bms.component';
import { AllDevicesContainersComponent } from './all-devices/all-devices-containers/all-devices-containers.component';
import { AllDevicesFirewallsComponent } from './all-devices/all-devices-firewalls/all-devices-firewalls.component';
import { AllDevicesHypervisorsComponent } from './all-devices/all-devices-hypervisors/all-devices-hypervisors.component';
import { AllDevicesLoadbalancersComponent } from './all-devices/all-devices-loadbalancers/all-devices-loadbalancers.component';
import { AllDevicesMacminiComponent } from './all-devices/all-devices-macmini/all-devices-macmini.component';
import { AllDevicesOtherdevicesComponent } from './all-devices/all-devices-otherdevices/all-devices-otherdevices.component';
import { AllDevicesStorageComponent } from './all-devices/all-devices-storage/all-devices-storage.component';
import { AllDevicesSwitchesComponent } from './all-devices/all-devices-switches/all-devices-switches.component';
import { AllDevicesVmsComponent } from './all-devices/all-devices-vms/all-devices-vms.component';
import { AllDevicesComponent } from './all-devices/all-devices.component';
import { AwsDeviceTabComponent } from './aws-device-tab/aws-device-tab.component';
import { AwsVirtualMachinesComponent } from './aws-virtual-machines/aws-virtual-machines.component';
import { AzureVirtualMachinesComponent } from './azure-virtual-machines/azure-virtual-machines.component';
import { BmServersCrudComponent } from './bm-servers/bm-servers-crud/bm-servers-crud.component';
import { BmServersCrudService } from './bm-servers/bm-servers-crud/bm-servers-crud.service';
import { BmServersMonitoringConfigComponent } from './bm-servers/bm-servers-monitoring-config/bm-servers-monitoring-config.component';
import { BmServersAlertsComponent } from './bm-servers/bm-servers-observium/bm-servers-alert/bm-servers-alert.component';
import { BmServersGraphNetstatsComponent } from './bm-servers/bm-servers-observium/bm-servers-graph/bm-servers-graph-netstats/bm-servers-graph-netstats.component';
import { BmServersGraphPollerComponent } from './bm-servers/bm-servers-observium/bm-servers-graph/bm-servers-graph-poller/bm-servers-graph-poller.component';
import { BmServersGraphSystemComponent } from './bm-servers/bm-servers-observium/bm-servers-graph/bm-servers-graph-system/bm-servers-graph-system.component';
import { BmServersGraphComponent } from './bm-servers/bm-servers-observium/bm-servers-graph/bm-servers-graph.component';
import { BmServersHealthOverviewComponent } from './bm-servers/bm-servers-observium/bm-servers-health/bm-servers-health-overview/bm-servers-health-overview.component';
import { BmServersHealthComponent } from './bm-servers/bm-servers-observium/bm-servers-health/bm-servers-health.component';
import { BmServerOverviewDetailsComponent } from './bm-servers/bm-servers-observium/bm-servers-overview/bm-server-overview-details/bm-server-overview-details.component';
import { BmServerOverviewMemoryComponent } from './bm-servers/bm-servers-observium/bm-servers-overview/bm-server-overview-memory/bm-server-overview-memory.component';
import { BmServerOverviewPortsComponent } from './bm-servers/bm-servers-observium/bm-servers-overview/bm-server-overview-ports/bm-server-overview-ports.component';
import { BmServerOverviewProcessorsComponent } from './bm-servers/bm-servers-observium/bm-servers-overview/bm-server-overview-processors/bm-server-overview-processors.component';
import { BmServersOverviewComponent } from './bm-servers/bm-servers-observium/bm-servers-overview/bm-servers-overview.component';
import { BmServersOverviewService } from './bm-servers/bm-servers-observium/bm-servers-overview/bm-servers-overview.service';
import { BmServerPortGraphsComponent } from './bm-servers/bm-servers-observium/bm-servers-port/bm-server-port-graphs/bm-server-port-graphs.component';
import { BmServerPortUsageGraphsComponent } from './bm-servers/bm-servers-observium/bm-servers-port/bm-server-port-graphs/bm-server-port-usage-graphs/bm-server-port-usage-graphs.component';
import { BmServersPortsComponent } from './bm-servers/bm-servers-observium/bm-servers-port/bm-servers-port.component';
import { BmServersStatsTabComponent } from './bm-servers/bm-servers-observium/bm-servers-stats-tab/bm-servers-stats-tab.component';
import { BmServersStatsService } from './bm-servers/bm-servers-observium/bm-servers-stats-tab/bm-servers-stats.service';
import { BmServersStatsComponent } from './bm-servers/bm-servers-observium/bm-servers-stats-tab/bm-servers-stats/bm-servers-stats.component';
import { BmServersZabbixComponent } from './bm-servers/bm-servers-zabbix/bm-servers-zabbix.component';
import { ZabbixBmsDetailsComponent } from './bm-servers/bm-servers-zabbix/zabbix-bms-details/zabbix-bms-details.component';
import { BmServersComponent } from './bm-servers/bm-servers.component';
import { BmServersService } from './bm-servers/bm-servers.service';
import { ContainerControllerCrudComponent } from './container-controllers/container-controller-crud/container-controller-crud.component';
import { ContainerControllerCrudService } from './container-controllers/container-controller-crud/container-controller-crud.service';
import { ContainerControllersComponent } from './container-controllers/container-controllers.component';
import { DockerContainerComponent } from './container-controllers/docker-containers/docker-container.component';
import { DockerNodesComponent } from './container-controllers/docker-nodes/docker-nodes.component';
import { DockerTabsComponent } from './container-controllers/docker-tabs/docker-tabs.component';
import { KubernetesNodesComponent } from './container-controllers/kubernetes-nodes/kubernetes-nodes.component';
import { KubernetesContainersComponent } from './container-controllers/kubernetes-pods/kubernetes-containers/kubernetes-containers.component';
import { KubernetesPodsComponent } from './container-controllers/kubernetes-pods/kubernetes-pods.component';
import { KubernetesPodsService } from './container-controllers/kubernetes-pods/kubernetes-pods.service';
import { KubernetesTabsComponent } from './container-controllers/kubernetes-tabs/kubernetes-tabs.component';
import { DatabaseMonitoringConfigComponent } from './database-servers/database-monitoring/database-monitoring-config/database-monitoring-config.component';
import { DatabaseMonitoringConfigService } from './database-servers/database-monitoring/database-monitoring-config/database-monitoring-config.service';
import { DatabaseMonitoringGraphCrudComponent } from './database-servers/database-monitoring/database-monitoring-graph-crud/database-monitoring-graph-crud.component';
import { DatabaseMonitoringGraphsComponent } from './database-servers/database-monitoring/database-monitoring-graphs/database-monitoring-graphs.component';
import { DatabaseMonitoringComponent } from './database-servers/database-monitoring/database-monitoring.component';
import { DatabaseServerCrudComponent } from './database-servers/database-server-crud/database-server-crud.component';
import { DatabaseServerCrudService } from './database-servers/database-server-crud/database-server-crud.service';
import { DatabaseServersComponent } from './database-servers/database-servers.component';
import { DatabaseServersService } from './database-servers/database-servers.service';
import { DeviceGraphsComponent } from './device-graphs/device-graphs.component';
import { DeviceSensorComponent } from './device-sensor/device-sensor.component';
import { DeviceStatusComponent } from './device-status/device-status.component';
import { DeviceTabComponent } from './device-tab/device-tab.component';
import { DevicesCrudMonitoringComponent } from './devices-crud-monitoring/devices-crud-monitoring.component';
import { DevicesMonitoringConfigComponent } from './devices-monitoring-config/devices-monitoring-config.component';
import { DevicesPopoverComponent } from './devices-popover/devices-popover.component';
import { FirewallsCrudComponent } from './firewalls/firewalls-crud/firewalls-crud.component';
import { FirewallCrudService } from './firewalls/firewalls-crud/firewalls-crud.service';
import { FirewallsAlertComponent } from './firewalls/firewalls-observium/firewalls-alert/firewalls-alert.component';
import { FirewallsGraphFirewallComponent } from './firewalls/firewalls-observium/firewalls-graph/firewalls-graph-firewall/firewalls-graph-firewall.component';
import { FirewallsGraphNetstatsComponent } from './firewalls/firewalls-observium/firewalls-graph/firewalls-graph-netstats/firewalls-graph-netstats.component';
import { FirewallsGraphPollerComponent } from './firewalls/firewalls-observium/firewalls-graph/firewalls-graph-poller/firewalls-graph-poller.component';
import { FirewallsGraphSystemComponent } from './firewalls/firewalls-observium/firewalls-graph/firewalls-graph-system/firewalls-graph-system.component';
import { FirewallsGraphComponent } from './firewalls/firewalls-observium/firewalls-graph/firewalls-graph.component';
import { FirewallsHealthOverviewComponent } from './firewalls/firewalls-observium/firewalls-health/firewalls-health-overview/firewalls-health-overview.component';
import { FirewallsHealthComponent } from './firewalls/firewalls-observium/firewalls-health/firewalls-health.component';
import { FirewallsOverviewDetailsComponent } from './firewalls/firewalls-observium/firewalls-overview/firewalls-overview-details/firewalls-overview-details.component';
import { FirewallsOverviewComponent } from './firewalls/firewalls-observium/firewalls-overview/firewalls-overview.component';
import { FirewallsOverviewService } from './firewalls/firewalls-observium/firewalls-overview/firewalls-overview.service';
import { FirewallPortGraphsComponent } from './firewalls/firewalls-observium/firewalls-port/firewall-port-graphs/firewall-port-graphs.component';
import { FirewallPortUsageGraphsComponent } from './firewalls/firewalls-observium/firewalls-port/firewall-port-graphs/firewall-port-usage-graphs/firewall-port-usage-graphs.component';
import { FirewallsPortComponent } from './firewalls/firewalls-observium/firewalls-port/firewalls-port.component';
import { FirewallsZabbixComponent } from './firewalls/firewalls-zabbix/firewalls-zabbix.component';
import { ZabbixFirewallDetailsComponent } from './firewalls/firewalls-zabbix/zabbix-firewall-details/zabbix-firewall-details.component';
import { FirewallsComponent } from './firewalls/firewalls.component';
import { FirewallsService } from './firewalls/firewalls.service';
import { GcpVirtualMachinesComponent } from './gcp-virtual-machines/gcp-virtual-machines.component';
import { GraphDetailsComponent } from './graph-details/graph-details.component';
import { HypervisorsCrudComponent } from './hypervisors/hypervisors-crud/hypervisors-crud.component';
import { HypervisorsCrudService } from './hypervisors/hypervisors-crud/hypervisors-crud.service';
import { HypervisorAlertComponent } from './hypervisors/hypervisors-observium/hypervisor-alert/hypervisor-alert.component';
import { HypervisorGraphNetstatsComponent } from './hypervisors/hypervisors-observium/hypervisor-graph/hypervisor-graph-netstats/hypervisor-graph-netstats.component';
import { HypervisorGraphPollerComponent } from './hypervisors/hypervisors-observium/hypervisor-graph/hypervisor-graph-poller/hypervisor-graph-poller.component';
import { HypervisorGraphSystemComponent } from './hypervisors/hypervisors-observium/hypervisor-graph/hypervisor-graph-system/hypervisor-graph-system.component';
import { HypervisorGraphComponent } from './hypervisors/hypervisors-observium/hypervisor-graph/hypervisor-graph.component';
import { HypervisorHealthDiskioComponent } from './hypervisors/hypervisors-observium/hypervisor-health/hypervisor-health-diskio/hypervisor-health-diskio.component';
import { HypervisorHealthOverviewComponent } from './hypervisors/hypervisors-observium/hypervisor-health/hypervisor-health-overview/hypervisor-health-overview.component';
import { HypervisorHealthStorageComponent } from './hypervisors/hypervisors-observium/hypervisor-health/hypervisor-health-storage/hypervisor-health-storage.component';
import { HypervisorHealthComponent } from './hypervisors/hypervisors-observium/hypervisor-health/hypervisor-health.component';
import { HypervisorOverviewDetailsComponent } from './hypervisors/hypervisors-observium/hypervisor-overview/hypervisor-overview-details/hypervisor-overview-details.component';
import { HypervisorOverviewMemoryComponent } from './hypervisors/hypervisors-observium/hypervisor-overview/hypervisor-overview-memory/hypervisor-overview-memory.component';
import { HypervisorOverviewPortsComponent } from './hypervisors/hypervisors-observium/hypervisor-overview/hypervisor-overview-ports/hypervisor-overview-ports.component';
import { HypervisorOverviewProcessorsComponent } from './hypervisors/hypervisors-observium/hypervisor-overview/hypervisor-overview-processors/hypervisor-overview-processors.component';
import { HypervisorOverviewComponent } from './hypervisors/hypervisors-observium/hypervisor-overview/hypervisor-overview.component';
import { HypervisorOverviewService } from './hypervisors/hypervisors-observium/hypervisor-overview/hypervisor-overview.service';
import { HypervisorPortGraphsComponent } from './hypervisors/hypervisors-observium/hypervisor-port/hypervisor-port-graphs/hypervisor-port-graphs.component';
import { HypervisorPortUsageGraphsComponent } from './hypervisors/hypervisors-observium/hypervisor-port/hypervisor-port-graphs/hypervisor-port-usage-graphs/hypervisor-port-usage-graphs.component';
import { HypervisorPortComponent } from './hypervisors/hypervisors-observium/hypervisor-port/hypervisor-port.component';
import { HypervisorsEsxiPlaceholderComponent } from './hypervisors/hypervisors-observium/hypervisors-esxi-placeholder/hypervisors-esxi-placeholder.component';
import { HypervisorsEsxiVmsComponent } from './hypervisors/hypervisors-observium/hypervisors-esxi-vms/hypervisors-esxi-vms.component';
import { HypervisorsZabbixComponent } from './hypervisors/hypervisors-zabbix/hypervisors-zabbix.component';
import { ZabbixHypervisorDetailsComponent } from './hypervisors/hypervisors-zabbix/zabbix-hypervisor-details/zabbix-hypervisor-details.component';
import { HypervisorsComponent } from './hypervisors/hypervisors.component';
import { HypervisorsService } from './hypervisors/hypervisors.service';
import { LoadbalancersCrudComponent } from './loadbalancers/loadbalancers-crud/loadbalancers-crud.component';
import { LoadbalancersCrudService } from './loadbalancers/loadbalancers-crud/loadbalancers-crud.service';
import { LoadbalancersAlertComponent } from './loadbalancers/loadbalancers-observium/loadbalancers-alert/loadbalancers-alert.component';
import { LoadbalancersGraphNetstatsComponent } from './loadbalancers/loadbalancers-observium/loadbalancers-graph/loadbalancers-graph-netstats/loadbalancers-graph-netstats.component';
import { LoadbalancersGraphPollerComponent } from './loadbalancers/loadbalancers-observium/loadbalancers-graph/loadbalancers-graph-poller/loadbalancers-graph-poller.component';
import { LoadbalancersGraphSystemComponent } from './loadbalancers/loadbalancers-observium/loadbalancers-graph/loadbalancers-graph-system/loadbalancers-graph-system.component';
import { LoadbalancersGraphComponent } from './loadbalancers/loadbalancers-observium/loadbalancers-graph/loadbalancers-graph.component';
import { LoadbalancersHealthOverviewComponent } from './loadbalancers/loadbalancers-observium/loadbalancers-health/loadbalancers-health-overview/loadbalancers-health-overview.component';
import { LoadbalancersHealthComponent } from './loadbalancers/loadbalancers-observium/loadbalancers-health/loadbalancers-health.component';
import { LoadbalancersOverviewDetailsComponent } from './loadbalancers/loadbalancers-observium/loadbalancers-overview/loadbalancers-overview-details/loadbalancers-overview-details.component';
import { LoadbalancersOverviewComponent } from './loadbalancers/loadbalancers-observium/loadbalancers-overview/loadbalancers-overview.component';
import { LoadbalancersOverviewService } from './loadbalancers/loadbalancers-observium/loadbalancers-overview/loadbalancers-overview.service';
import { LoadbalancerPortGraphsComponent } from './loadbalancers/loadbalancers-observium/loadbalancers-port/loadbalancer-port-graphs/loadbalancer-port-graphs.component';
import { LoadbalancerPortUsageGraphsComponent } from './loadbalancers/loadbalancers-observium/loadbalancers-port/loadbalancer-port-graphs/loadbalancer-port-usage-graphs/loadbalancer-port-usage-graphs.component';
import { LoadbalancersPortComponent } from './loadbalancers/loadbalancers-observium/loadbalancers-port/loadbalancers-port.component';
import { LoadbalancersZabbixComponent } from './loadbalancers/loadbalancers-zabbix/loadbalancers-zabbix.component';
import { ZabbixLoadbalancerDetailsComponent } from './loadbalancers/loadbalancers-zabbix/zabbix-loadbalancer-details/zabbix-loadbalancer-details.component';
import { LoadbalancersComponent } from './loadbalancers/loadbalancers.component';
import { LoadbalancersService } from './loadbalancers/loadbalancers.service';
import { MacMiniCrudComponent } from './mac-mini/mac-mini-crud/mac-mini-crud.component';
import { MacMiniCrudService } from './mac-mini/mac-mini-crud/mac-mini-crud.service';
import { MacMiniComponent } from './mac-mini/mac-mini.component';
import { MacMiniService } from './mac-mini/mac-mini.service';
import { MacminiAlertComponent } from './mac-mini/macmini-observium/macmini-alert/macmini-alert.component';
import { MacminiGraphNetstatsComponent } from './mac-mini/macmini-observium/macmini-graph/macmini-graph-netstats/macmini-graph-netstats.component';
import { MacminiGraphPollerComponent } from './mac-mini/macmini-observium/macmini-graph/macmini-graph-poller/macmini-graph-poller.component';
import { MacminiGraphSystemComponent } from './mac-mini/macmini-observium/macmini-graph/macmini-graph-system/macmini-graph-system.component';
import { MacminiGraphComponent } from './mac-mini/macmini-observium/macmini-graph/macmini-graph.component';
import { MacminiHealthOverviewComponent } from './mac-mini/macmini-observium/macmini-health/macmini-health-overview/macmini-health-overview.component';
import { MacminiHealthComponent } from './mac-mini/macmini-observium/macmini-health/macmini-health.component';
import { MacminiOverviewDetailsComponent } from './mac-mini/macmini-observium/macmini-overview/macmini-overview-details/macmini-overview-details.component';
import { MacminiOverviewComponent } from './mac-mini/macmini-observium/macmini-overview/macmini-overview.component';
import { MacminiOverviewService } from './mac-mini/macmini-observium/macmini-overview/macmini-overview.service';
import { MacminiPortGraphsComponent } from './mac-mini/macmini-observium/macmini-ports/macmini-port-graphs/macmini-port-graphs.component';
import { MacminiPortUsageGraphsComponent } from './mac-mini/macmini-observium/macmini-ports/macmini-port-graphs/macmini-port-usage-graphs/macmini-port-usage-graphs.component';
import { MacminiPortsComponent } from './mac-mini/macmini-observium/macmini-ports/macmini-ports.component';
import { MacminiZabbixComponent } from './mac-mini/macmini-zabbix/macmini-zabbix.component';
import { ZabbixMacminiDetailsComponent } from './mac-mini/macmini-zabbix/zabbix-macmini-details/zabbix-macmini-details.component';
import { ZabbixMacminiGraphCrudComponent } from './mac-mini/macmini-zabbix/zabbix-macmini-graph-crud/zabbix-macmini-graph-crud.component';
import { OciVirtualMachinesComponent } from './oci-virtual-machines/oci-virtual-machines.component';
import { OtherdevicesComponent } from './otherdevices/otherdevices.component';
import { OtherdevicesService } from './otherdevices/otherdevices.service';
import { PduRecycleComponent } from './pdu-recycle/pdu-recycle.component';
import { PduRecycleService } from './pdu-recycle/pdu-recycle.service';
import { AwsCloudWatchDetailsComponent } from './public-cloud-aws-cloudwatch/aws-cloud-watch-details/aws-cloud-watch-details.component';
import { AwsCloudWatchGraphComponent } from './public-cloud-aws-cloudwatch/aws-cloud-watch-graph/aws-cloud-watch-graph.component';
import { PublicCloudAwsCloudwatchComponent } from './public-cloud-aws-cloudwatch/public-cloud-aws-cloudwatch.component';
import { ServerPowerToggleComponent } from './server-power-toggle/server-power-toggle.component';
import { StorageCrudComponent } from './storage-devices/storage-crud/storage-crud.component';
import { StorageCrudService } from './storage-devices/storage-crud/storage-crud.service';
import { StorageDevicesComponent } from './storage-devices/storage-devices.component';
import { StorageDevicesService } from './storage-devices/storage-devices.service';
import { StorageAlertComponent } from './storage-devices/storage-observium/storage-alert/storage-alert.component';
import { StorageGraphPollerComponent } from './storage-devices/storage-observium/storage-graph/storage-graph-poller/storage-graph-poller.component';
import { StorageGraphStorageComponent } from './storage-devices/storage-observium/storage-graph/storage-graph-storage/storage-graph-storage.component';
import { StorageGraphSystemComponent } from './storage-devices/storage-observium/storage-graph/storage-graph-system/storage-graph-system.component';
import { StorageGraphComponent } from './storage-devices/storage-observium/storage-graph/storage-graph.component';
import { StorageHealthDiskIOComponent } from './storage-devices/storage-observium/storage-health/storage-health-diskio/storage-health-diskio.component';
import { StorageHealthOverviewComponent } from './storage-devices/storage-observium/storage-health/storage-health-overview/storage-health-overview.component';
import { StorageHealthComponent } from './storage-devices/storage-observium/storage-health/storage-health.component';
import { StorageOverviewDetailsComponent } from './storage-devices/storage-observium/storage-overview/storage-overview-details/storage-overview-details.component';
import { StorageOverviewComponent } from './storage-devices/storage-observium/storage-overview/storage-overview.component';
import { StorageOverviewService } from './storage-devices/storage-observium/storage-overview/storage-overview.service';
import { StoragePortGraphsComponent } from './storage-devices/storage-observium/storage-port/storage-port-graphs/storage-port-graphs.component';
import { StoragePortUsageGraphsComponent } from './storage-devices/storage-observium/storage-port/storage-port-graphs/storage-port-usage-graphs/storage-port-usage-graphs.component';
import { StoragePortComponent } from './storage-devices/storage-observium/storage-port/storage-port.component';
import { StorageZabbixComponent } from './storage-devices/storage-zabbix/storage-zabbix.component';
import { ZabbixStorageDetailsComponent } from './storage-devices/storage-zabbix/zabbix-storage-details/zabbix-storage-details.component';
import { SummaryComponent } from './summary/summary.component';
import { SwitchesCrudComponent } from './switches/switches-crud/switches-crud.component';
import { SwitchesCrudService } from './switches/switches-crud/switches-crud.service';
import { SwitchesAlertComponent } from './switches/switches-observium/switches-alert/switches-alert.component';
import { SwitchesGraphNetstatsComponent } from './switches/switches-observium/switches-graph/switches-graph-netstats/switches-graph-netstats.component';
import { SwitchesGraphPollerComponent } from './switches/switches-observium/switches-graph/switches-graph-poller/switches-graph-poller.component';
import { SwitchesGraphSystemComponent } from './switches/switches-observium/switches-graph/switches-graph-system/switches-graph-system.component';
import { SwitchesGraphComponent } from './switches/switches-observium/switches-graph/switches-graph.component';
import { SwitchesHealthOverviewComponent } from './switches/switches-observium/switches-health/switches-health-overview/switches-health-overview.component';
import { SwitchesHealthComponent } from './switches/switches-observium/switches-health/switches-health.component';
import { SwitchesOverviewDetailsComponent } from './switches/switches-observium/switches-overview/switches-overview-details/switches-overview-details.component';
import { SwitchesOverviewComponent } from './switches/switches-observium/switches-overview/switches-overview.component';
import { SwitchesOverviewService } from './switches/switches-observium/switches-overview/switches-overview.service';
import { SwitchPortGraphsComponent } from './switches/switches-observium/switches-port/switch-port-graphs/switch-port-graphs.component';
import { SwitchPortUsageGraphsComponent } from './switches/switches-observium/switches-port/switch-port-graphs/switch-port-usage-graphs/switch-port-usage-graphs.component';
import { SwitchesPortComponent } from './switches/switches-observium/switches-port/switches-port.component';
import { SwitchesZabbixComponent } from './switches/switches-zabbix/switches-zabbix.component';
import { ZabbixSwitchDetailsComponent } from './switches/switches-zabbix/zabbix-switch-details/zabbix-switch-details.component';
import { SwitchesComponent } from './switches/switches.component';
import { SwitchesService } from './switches/switches.service';
import { UnitedCloudSharedService } from './united-cloud-shared.service';
import { UnityS3AccountComponent } from './unity-s3-account/unity-s3-account.component';
import { UnityS3TabsComponent } from './unity-s3-account/unity-s3-tabs/unity-s3-tabs.component';
import { UnityS3BucketFilesComponent } from './unity-s3-account/unity-s3/unity-s3-bucket-files/unity-s3-bucket-files.component';
import { UnityS3Component } from './unity-s3-account/unity-s3/unity-s3.component';
import { VcenterContentLibraryFilesComponent } from './vcenter-content-library/vcenter-content-library-files/vcenter-content-library-files.component';
import { VcenterContentLibraryComponent } from './vcenter-content-library/vcenter-content-library.component';
import { VmsListCustomCrudComponent } from './vms/vms-list-custom/vms-list-custom-crud/vms-list-custom-crud.component';
import { VmsListCustomCrudService } from './vms/vms-list-custom/vms-list-custom-crud/vms-list-custom-crud.service';
import { VmsListCustomComponent } from './vms/vms-list-custom/vms-list-custom.component';
import { VmsListEsxiComponent } from './vms/vms-list-esxi/vms-list-esxi.component';
import { VmsListHypervComponent } from './vms/vms-list-hyperv/vms-list-hyperv.component';
import { VmsListOpenstackComponent } from './vms/vms-list-openstack/vms-list-openstack.component';
import { VmsListProxmoxComponent } from './vms/vms-list-proxmox/vms-list-proxmox.component';
import { VmsListVcloudComponent } from './vms/vms-list-vcloud/vms-list-vcloud.component';
import { VmsListVmwareAddComponent } from './vms/vms-list-vmware/vms-list-vmware-add/vms-list-vmware-add.component';
import { VmsListVmwareAddService } from './vms/vms-list-vmware/vms-list-vmware-add/vms-list-vmware-add.service';
import { VmsListVmwareDeployOvaComponent } from './vms/vms-list-vmware/vms-list-vmware-deploy-ova/vms-list-vmware-deploy-ova.component';
import { VmsListVmwareDeployOvfComponent } from './vms/vms-list-vmware/vms-list-vmware-deploy-ovf/vms-list-vmware-deploy-ovf.component';
import { VmsListVmwareDeployOvfService } from './vms/vms-list-vmware/vms-list-vmware-deploy-ovf/vms-list-vmware-deploy-ovf.service';
import { VmsListVmwareComponent } from './vms/vms-list-vmware/vms-list-vmware.component';
import { VmsVmwareSnapshotsComponent } from './vms/vms-list-vmware/vms-vmware-snapshots/vms-vmware-snapshots.component';
import { VmsMgmtCrudComponent } from './vms/vms-mgmt-crud/vms-mgmt-crud.component';
import { VmsAlertComponent } from './vms/vms-observium/vms-alert/vms-alert.component';
import { VmsGraphNetstatsComponent } from './vms/vms-observium/vms-graph/vms-graph-netstats/vms-graph-netstats.component';
import { VmsGraphPollerComponent } from './vms/vms-observium/vms-graph/vms-graph-poller/vms-graph-poller.component';
import { VmsGraphSystemComponent } from './vms/vms-observium/vms-graph/vms-graph-system/vms-graph-system.component';
import { VmsGraphComponent } from './vms/vms-observium/vms-graph/vms-graph.component';
import { VmsHealthOverviewComponent } from './vms/vms-observium/vms-health/vms-health-overview/vms-health-overview.component';
import { VmsHealthComponent } from './vms/vms-observium/vms-health/vms-health.component';
import { VmsOverviewDetailsComponent } from './vms/vms-observium/vms-overview/vms-overview-details/vms-overview-details.component';
import { VmsOverviewMemoryComponent } from './vms/vms-observium/vms-overview/vms-overview-memory/vms-overview-memory.component';
import { VmsOverviewPortsComponent } from './vms/vms-observium/vms-overview/vms-overview-ports/vms-overview-ports.component';
import { VmsOverviewProcessorsComponent } from './vms/vms-observium/vms-overview/vms-overview-processors/vms-overview-processors.component';
import { VmsOverviewComponent } from './vms/vms-observium/vms-overview/vms-overview.component';
import { VmsOverviewService } from './vms/vms-observium/vms-overview/vms-overview.service';
import { VmPortGraphsComponent } from './vms/vms-observium/vms-port/vm-port-graphs/vm-port-graphs.component';
import { VmPortUsageGraphsComponent } from './vms/vms-observium/vms-port/vm-port-graphs/vm-port-usage-graphs/vm-port-usage-graphs.component';
import { VmsPortComponent } from './vms/vms-observium/vms-port/vms-port.component';
import { VmsTagsCrudComponent } from './vms/vms-tags-crud/vms-tags-crud.component';
import { VmsZabbixComponent } from './vms/vms-zabbix/vms-zabbix.component';
import { ZabbixVmsGraphCrudComponent } from './vms/vms-zabbix/zabbix-vms-graph-crud/zabbix-vms-graph-crud.component';
import { ZabbixVmsGraphsComponent } from './vms/vms-zabbix/zabbix-vms-graphs/zabbix-vms-graphs.component';
import { VmsComponent } from './vms/vms.component';
import { WebAccessComponent } from './web-access/web-access.component';
import { ZabbixGraphCrudComponent } from './zabbix-graph-crud/zabbix-graph-crud.component';
import { ZabbixTriggerCrudComponent } from './zabbix-trigger-crud/zabbix-trigger-crud.component';
import { ZabbixTriggersComponent } from './zabbix-triggers/zabbix-triggers.component';
import { VmsListVmwareDeployOvaService } from './vms/vms-list-vmware/vms-list-vmware-deploy-ova/vms-list-vmware-deploy-ova.service';
import { AzureZabbixComponent } from './azure-zabbix/azure-zabbix.component';
import { ZabbixAzureGraphsCrudComponent } from './azure-zabbix/zabbix-azure-graphs-crud/zabbix-azure-graphs-crud.component';
import { ZabbixAzureMonitoringConfigComponent } from './azure-zabbix/zabbix-azure-monitoring-config/zabbix-azure-monitoring-config.component';
import { ZabbixVmsDetailsComponent } from './vms/vms-zabbix/zabbix-vms-details/zabbix-vms-details.component';

import { ZabbixTriggerScriptsComponent } from './zabbix-trigger-scripts/zabbix-trigger-scripts.component';
import { StorageOntapComponent } from './storage-devices/storage-ontap/storage-ontap.component';
import { StorageOntapSummaryComponent } from './storage-devices/storage-ontap/storage-ontap-summary/storage-ontap-summary.component';
import { StorageOntapNodesComponent } from './storage-devices/storage-ontap/storage-ontap-nodes/storage-ontap-nodes.component';
import { StorageOntapAggregatesComponent } from './storage-devices/storage-ontap/storage-ontap-aggregates/storage-ontap-aggregates.component';
import { StorageOntapVolumesComponent } from './storage-devices/storage-ontap/storage-ontap-volumes/storage-ontap-volumes.component';
import { StorageOntapLunsComponent } from './storage-devices/storage-ontap/storage-ontap-luns/storage-ontap-luns.component';
import { StorageOntapSvmsComponent } from './storage-devices/storage-ontap/storage-ontap-svms/storage-ontap-svms.component';
import { StorageMonitoringConfigComponent } from './storage-devices/storage-monitoring-config/storage-monitoring-config.component';
import { StorageOntapDetailsComponent } from './storage-devices/storage-ontap/storage-ontap-details/storage-ontap-details.component';
import { StorageOntapNodeDetailsComponent } from './storage-devices/storage-ontap/storage-ontap-node-details/storage-ontap-node-details.component';
import { StorageOntapAggregateDetailsComponent } from './storage-devices/storage-ontap/storage-ontap-aggregate-details/storage-ontap-aggregate-details.component';
import { StorageOntapSvmDetailsComponent } from './storage-devices/storage-ontap/storage-ontap-svm-details/storage-ontap-svm-details.component';
import { StorageOntapVolumeDetailsComponent } from './storage-devices/storage-ontap/storage-ontap-volume-details/storage-ontap-volume-details.component';
import { StorageOntapLunDetailsComponent } from './storage-devices/storage-ontap/storage-ontap-lun-details/storage-ontap-lun-details.component';
import { StorageOntapDetailsTabComponent } from './storage-devices/storage-ontap/storage-ontap-details-tab/storage-ontap-details-tab.component';
import { StorageOntapEventsComponent } from './storage-devices/storage-ontap/storage-ontap-events/storage-ontap-events.component';
import { StorageOntapTriggersComponent } from './storage-devices/storage-ontap/storage-ontap-triggers/storage-ontap-triggers.component';
import { StorageOntapStatisticsComponent } from './storage-devices/storage-ontap/storage-ontap-statistics/storage-ontap-statistics.component';
import { StorageOntapDisksComponent } from './storage-devices/storage-ontap/storage-ontap-disks/storage-ontap-disks.component';
import { StorageOntapShelvesComponent } from './storage-devices/storage-ontap/storage-ontap-shelves/storage-ontap-shelves.component';
import { StorageOntapEthernetPortsComponent } from './storage-devices/storage-ontap/storage-ontap-ethernet-ports/storage-ontap-ethernet-ports.component';
import { StorageOntapFcPortsComponent } from './storage-devices/storage-ontap/storage-ontap-fc-ports/storage-ontap-fc-ports.component';
import { StorageOntapSnapMirrorsComponent } from './storage-devices/storage-ontap/storage-ontap-snap-mirrors/storage-ontap-snap-mirrors.component';
import { StorageOntapClusterPeersComponent } from './storage-devices/storage-ontap/storage-ontap-cluster-peers/storage-ontap-cluster-peers.component';
import { OtherdevicesCrudComponent } from './otherdevices/otherdevices-crud/otherdevices-crud.component';
import { OtherdevicesZabbixComponent } from './otherdevices/otherdevices-zabbix/otherdevices-zabbix.component';
import { ZabbixOtherdeviceDetailsComponent } from './otherdevices/otherdevices-zabbix/zabbix-otherdevice-details/zabbix-otherdevice-details.component';
import { ZabbixOtherdeviceMonitoringConfigComponent } from './otherdevices/otherdevices-zabbix/zabbix-otherdevice-monitoring-config/zabbix-otherdevice-monitoring-config.component';
import { AwsZabbixComponent } from './aws-zabbix/aws-zabbix.component';
import { ZabbixAwsMonitoringConfigComponent } from './aws-zabbix/zabbix-aws-monitoring-config/zabbix-aws-monitoring-config.component';
import { ZabbixEventsComponent } from './zabbix-events/zabbix-events.component';
import { NutanixComponent } from './nutanix/nutanix.component';
import { NutanixClustersComponent } from './nutanix/nutanix-clusters/nutanix-clusters.component';
import { NutanixClusterDetailsComponent } from './nutanix/nutanix-clusters/nutanix-cluster-details/nutanix-cluster-details.component';
import { NutanixHostsComponent } from './nutanix/nutanix-hosts/nutanix-hosts.component';
import { NutanixHostDetailsComponent } from './nutanix/nutanix-hosts/nutanix-host-details/nutanix-host-details.component';
import { NutanixDisksComponent } from './nutanix/nutanix-disks/nutanix-disks.component';
import { NutanixDiskDetailsComponent } from './nutanix/nutanix-disks/nutanix-disk-details/nutanix-disk-details.component';
import { NutanixStorageContainersComponent } from './nutanix/nutanix-storage-containers/nutanix-storage-containers.component';
import { NutanixStorageContainersDetailsComponent } from './nutanix/nutanix-storage-containers/nutanix-storage-containers-details/nutanix-storage-containers-details.component';
import { NutanixStoragePoolsComponent } from './nutanix/nutanix-storage-pools/nutanix-storage-pools.component';
import { NutanixStoragePoolsDetailsComponent } from './nutanix/nutanix-storage-pools/nutanix-storage-pools-details/nutanix-storage-pools-details.component';
import { VmsListNutanixComponent } from './vms/vms-list-nutanix/vms-list-nutanix.component';
import { NutanixVmsDetailsComponent } from './vms/vms-list-nutanix/nutanix-vms-details/nutanix-vms-details.component';
import { NutanixVirtualDisksComponent } from './nutanix/nutanix-virtual-disks/nutanix-virtual-disks.component';
import { NutanixVirtualDisksDetailsComponent } from './nutanix/nutanix-virtual-disks/nutanix-virtual-disks-details/nutanix-virtual-disks-details.component';
import { NutanixZabbixComponent } from './nutanix/nutanix-zabbix/nutanix-zabbix.component';
import { NutanixDetailsComponent } from './nutanix/nutanix-zabbix/nutanix-details/nutanix-details.component';
import { ContainerControllersZabbixComponent } from './container-controllers/container-controllers-zabbix/container-controllers-zabbix.component';
import { ZabbixGraphsComponent } from './zabbix-graphs/zabbix-graphs.component';
import { DeviceDetailsComponentsComponent } from './device-details-components/device-details-components.component';
import { GcpZabbixComponent } from './gcp-zabbix/gcp-zabbix.component';
import { ZabbixGcpGraphsComponent } from './gcp-zabbix/zabbix-gcp-graphs/zabbix-gcp-graphs.component';
import { ZabbixGcpGraphsCrudComponent } from './gcp-zabbix/zabbix-gcp-graphs-crud/zabbix-gcp-graphs-crud.component';
import { ZabbixGcpMonitoringConfigComponent } from './gcp-zabbix/zabbix-gcp-monitoring-config/zabbix-gcp-monitoring-config.component';
import { DockerContainersZabbixComponent } from './container-controllers/docker-containers/docker-containers-zabbix/docker-containers-zabbix.component';
import { VcenterCloudComponent } from './vcenter-cloud/vcenter-cloud.component';
import { VcenterClustersComponent } from './vcenter-cloud/vcenter-clusters/vcenter-clusters.component';
import { VcenterDatastoresComponent } from './vcenter-cloud/vcenter-datastores/vcenter-datastores.component';
import { VcenterNetworksComponent } from './vcenter-cloud/vcenter-networks/vcenter-networks.component';
import { VcenterClusterItemsComponent } from './vcenter-cloud/vcenter-clusters/vcenter-cluster-items/vcenter-cluster-items.component';
import { StoragePureComponent } from './storage-devices/storage-pure/storage-pure.component';
import { PureStorageHostsComponent } from './storage-devices/storage-pure/pure-storage-hosts/pure-storage-hosts.component';
import { PureStorageHostGroupsComponent } from './storage-devices/storage-pure/pure-storage-host-groups/pure-storage-host-groups.component';
import { PureStorageVolumesComponent } from './storage-devices/storage-pure/pure-storage-volumes/pure-storage-volumes.component';
import { PureStorageVolumeSnapshotsComponent } from './storage-devices/storage-pure/pure-storage-volume-snapshots/pure-storage-volume-snapshots.component';
import { PureStorageVolumeGroupsComponent } from './storage-devices/storage-pure/pure-storage-volume-groups/pure-storage-volume-groups.component';
import { PureStoragePodsComponent } from './storage-devices/storage-pure/pure-storage-pods/pure-storage-pods.component';
import { PureStorageProtectionGroupsComponent } from './storage-devices/storage-pure/pure-storage-protection-groups/pure-storage-protection-groups.component';
import { PureStorageProtectionGroupSnapshotsComponent } from './storage-devices/storage-pure/pure-storage-protection-group-snapshots/pure-storage-protection-group-snapshots.component';
import { EchartsxModule } from 'echarts-for-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SdwansComponent } from './sdwans/sdwans.component';
import { SdwansDetailsComponent } from './sdwans/sdwans-details/sdwans-details.component';
import { SdwansZabbixComponent } from './sdwans/sdwans-zabbix/sdwans-zabbix.component';
import { SdwanDetailsZabbixComponent } from './sdwans/sdwans-details/sdwan-details-zabbix/sdwan-details-zabbix.component';
import { ZabbixSdwanDeviceDetailsComponent } from './sdwans/sdwans-details/sdwan-details-zabbix/zabbix-sdwan-device-details/zabbix-sdwan-device-details.component';
import { DeviceDetailsBulkUpdatePopupComponent } from './device-details-bulk-update-popup/device-details-bulk-update-popup.component';
import { VcenterZabbixComponent } from './vcenter-cloud/vcenter-zabbix/vcenter-zabbix.component';
import { ZabbixVcenterMonitoringConfigComponent } from './vcenter-cloud/vcenter-zabbix/zabbix-vcenter-monitoring-config/zabbix-vcenter-monitoring-config.component';
import { NetworkControllersComponent } from './network-controllers/network-controllers.component';
import { NetworkControllersZabbixComponent } from './network-controllers/network-controllers-zabbix/network-controllers-zabbix.component';
import { NetworkControllersViptelaComponentsComponent } from './network-controllers/network-controllers-viptela-components/network-controllers-viptela-components.component';
import { NetworkControllersViptelaComponentZabbixComponent } from './network-controllers/network-controllers-viptela-components/network-controllers-viptela-component-zabbix/network-controllers-viptela-component-zabbix.component';
import { ZabbixNetworkControllersViptelaComponentDetailsComponent } from './network-controllers/network-controllers-viptela-components/network-controllers-viptela-component-zabbix/zabbix-network-controllers-viptela-component-details/zabbix-network-controllers-viptela-component-details.component';
import { NetworkControllersCiscoMerakiComponent } from './network-controllers/network-controllers-cisco-meraki/network-controllers-cisco-meraki.component';
import { NetworkControllersCiscoMerakiOrganizationsComponent } from './network-controllers/network-controllers-cisco-meraki/network-controllers-cisco-meraki-organizations/network-controllers-cisco-meraki-organizations.component';
import { NetworkControllersCiscoMerakiDevicesComponent } from './network-controllers/network-controllers-cisco-meraki/network-controllers-cisco-meraki-devices/network-controllers-cisco-meraki-devices.component';
import { NetworkControllersCiscoMerakiOrganizationsZabbixComponent } from './network-controllers/network-controllers-cisco-meraki/network-controllers-cisco-meraki-organizations/network-controllers-cisco-meraki-organizations-zabbix/network-controllers-cisco-meraki-organizations-zabbix.component';
import { ZabbixNetworkControllersCiscoMerakiOrganizationsDetailsComponent } from './network-controllers/network-controllers-cisco-meraki/network-controllers-cisco-meraki-organizations/network-controllers-cisco-meraki-organizations-zabbix/zabbix-network-controllers-cisco-meraki-organizations-details/zabbix-network-controllers-cisco-meraki-organizations-details.component';
import { NetworkControllersCiscoMerakiDevicesZabbixComponent } from './network-controllers/network-controllers-cisco-meraki/network-controllers-cisco-meraki-devices/network-controllers-cisco-meraki-devices-zabbix/network-controllers-cisco-meraki-devices-zabbix.component';
import { ZabbixNetworkControllersCiscoMerakiDevicesDetailsComponent } from './network-controllers/network-controllers-cisco-meraki/network-controllers-cisco-meraki-devices/network-controllers-cisco-meraki-devices-zabbix/zabbix-network-controllers-cisco-meraki-devices-details/zabbix-network-controllers-cisco-meraki-devices-details.component';
import { IotDevicesComponent } from './iot-devices/iot-devices.component';
import { IotDevicesZabbixComponent } from './iot-devices/iot-devices-zabbix/iot-devices-zabbix.component';
import { ZabbixIotDeviceSensorDetailsComponent } from './iot-devices/iot-devices-zabbix/zabbix-iot-device-sensor-details/zabbix-iot-device-sensor-details.component';
import { ZabbixIotDeviceSmartPduDetailsComponent } from './iot-devices/iot-devices-zabbix/zabbix-iot-device-smart-pdu-details/zabbix-iot-device-smart-pdu-details.component';
import { ZabbixIotDeviceRfidReaderDetailsComponent } from './iot-devices/iot-devices-zabbix/zabbix-iot-device-rfid-reader-details/zabbix-iot-device-rfid-reader-details.component';
import { ZabbixIotDeviceSensorOverviewComponent } from './iot-devices/iot-devices-zabbix/zabbix-iot-device-sensor-overview/zabbix-iot-device-sensor-overview.component';
import { TitleCasePipe } from '@angular/common';
import { DeviceOverviewComponent } from './device-overview/device-overview.component';
import { DatabaseZabbixDetailsComponent } from './database-servers/database-monitoring/database-zabbix-details/database-zabbix-details.component';
import { DatabaseDetailsComponent } from './database-servers/database-monitoring/database-zabbix-details/database-details/database-details.component';
import { NetworkDevicesDetailsComponentsComponent } from './device-details-components/network-devices-details-components/network-devices-details-components.component';
import { BaremetalDetailsComponentsComponent } from './device-details-components/baremetal-details-components/baremetal-details-components.component';
import { StorageDetailsComponentsComponent } from './device-details-components/storage-details-components/storage-details-components.component';
import { VmDetailsComponentsComponent } from './device-details-components/vm-details-components/vm-details-components.component';
/**
 * Change format according to need
 */
export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'DD MMM, YYYY hh:mm A',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};


@NgModule({
  declarations: [
    AllDevicesComponent,
    HypervisorsComponent, BmServersComponent,
    VmsComponent, SwitchesComponent, FirewallsComponent,
    LoadbalancersComponent, OtherdevicesComponent,
    DeviceTabComponent, HypervisorOverviewComponent,
    HypervisorGraphComponent, HypervisorHealthComponent,
    HypervisorPortComponent, HypervisorAlertComponent,
    HypervisorOverviewDetailsComponent, HypervisorOverviewProcessorsComponent,
    HypervisorOverviewPortsComponent, HypervisorOverviewMemoryComponent,
    HypervisorGraphNetstatsComponent,
    HypervisorGraphPollerComponent, HypervisorGraphSystemComponent,
    GraphDetailsComponent, HypervisorHealthOverviewComponent,
    BmServersOverviewComponent, BmServerOverviewDetailsComponent,
    BmServerOverviewProcessorsComponent, BmServerOverviewPortsComponent,
    BmServerOverviewMemoryComponent,
    BmServersGraphComponent,
    BmServersGraphNetstatsComponent,
    BmServersGraphPollerComponent,
    BmServersGraphSystemComponent,
    BmServersHealthComponent,
    BmServersHealthOverviewComponent,
    BmServersPortsComponent,
    BmServersAlertsComponent,
    VmsOverviewComponent,
    VmsOverviewDetailsComponent,
    VmsOverviewPortsComponent,
    VmsOverviewProcessorsComponent,
    VmsOverviewMemoryComponent,
    VmsGraphComponent,
    VmsHealthComponent,
    VmsPortComponent,
    VmsAlertComponent,
    VmsGraphNetstatsComponent,
    VmsGraphPollerComponent,
    VmsGraphSystemComponent,
    VmsHealthOverviewComponent,
    SwitchesOverviewComponent,
    SwitchesGraphComponent,
    SwitchesHealthComponent,
    SwitchesPortComponent,
    SwitchesAlertComponent,
    SwitchesOverviewDetailsComponent,
    SwitchesGraphPollerComponent,
    SwitchesGraphNetstatsComponent,
    SwitchesGraphSystemComponent,
    SwitchesHealthOverviewComponent,
    FirewallsOverviewComponent,
    FirewallsGraphComponent,
    FirewallsHealthComponent,
    FirewallsPortComponent,
    FirewallsAlertComponent,
    FirewallsOverviewDetailsComponent,
    FirewallsGraphNetstatsComponent,
    FirewallsGraphPollerComponent,
    FirewallsGraphSystemComponent,
    FirewallsHealthOverviewComponent,
    FirewallsGraphFirewallComponent,
    LoadbalancersOverviewComponent,
    LoadbalancersGraphComponent,
    LoadbalancersHealthComponent,
    LoadbalancersPortComponent,
    LoadbalancersAlertComponent,
    LoadbalancersOverviewDetailsComponent,
    LoadbalancersGraphNetstatsComponent,
    LoadbalancersGraphPollerComponent,
    LoadbalancersGraphSystemComponent,
    LoadbalancersHealthOverviewComponent,
    DevicesPopoverComponent,
    DeviceGraphsComponent,
    SummaryComponent,
    WebAccessComponent,
    DeviceSensorComponent,
    DeviceStatusComponent,
    ServerPowerToggleComponent,
    BmServersStatsTabComponent,
    BmServersStatsComponent,
    VmsListCustomComponent,
    VmsListOpenstackComponent,
    VmsListVmwareComponent,
    AllDevicesLoadbalancersComponent,
    AllDevicesSwitchesComponent,
    AllDevicesFirewallsComponent,
    AllDevicesHypervisorsComponent,
    AllDevicesVmsComponent,
    AllDevicesOtherdevicesComponent,
    AllDevicesBmsComponent,
    VmsListVcloudComponent,
    AwsVirtualMachinesComponent,
    AllDevicesAlertsComponent,
    AwsDeviceTabComponent,
    PublicCloudAwsCloudwatchComponent,
    AwsCloudWatchDetailsComponent,
    AwsCloudWatchGraphComponent,
    AzureVirtualMachinesComponent,
    FirewallsCrudComponent,
    HypervisorsCrudComponent,
    LoadbalancersCrudComponent,
    SwitchesCrudComponent,
    BmServersCrudComponent,
    ContainerControllersComponent,
    KubernetesContainersComponent,
    KubernetesPodsComponent,
    GcpVirtualMachinesComponent,
    PduRecycleComponent,
    VmsMgmtCrudComponent,
    AllDevicesContainersComponent,
    StorageDevicesComponent,
    StorageCrudComponent,
    StorageOverviewComponent,
    StorageOverviewDetailsComponent,
    StorageGraphComponent,
    StorageGraphSystemComponent,
    StorageGraphStorageComponent,
    StorageGraphPollerComponent,
    StorageHealthComponent,
    StorageHealthOverviewComponent,
    StoragePortComponent,
    StorageAlertComponent,
    AllDevicesStorageComponent,
    HypervisorHealthStorageComponent,
    HypervisorHealthDiskioComponent,
    StorageHealthDiskIOComponent,
    KubernetesNodesComponent,
    KubernetesTabsComponent,
    DockerTabsComponent,
    DockerNodesComponent,
    DockerContainerComponent,
    ContainerControllerCrudComponent,
    DevicesCrudMonitoringComponent,
    MacMiniComponent,
    MacMiniCrudComponent,
    MacminiOverviewComponent,
    MacminiOverviewDetailsComponent,
    MacminiGraphComponent,
    MacminiPortsComponent,
    MacminiHealthComponent,
    MacminiAlertComponent,
    MacminiGraphNetstatsComponent,
    MacminiGraphPollerComponent,
    MacminiGraphSystemComponent,
    MacminiHealthOverviewComponent,
    VmsListProxmoxComponent,
    AllDevicesMacminiComponent,
    FirewallPortGraphsComponent,
    FirewallPortUsageGraphsComponent,
    SwitchPortGraphsComponent,
    SwitchPortUsageGraphsComponent,
    LoadbalancerPortGraphsComponent,
    LoadbalancerPortUsageGraphsComponent,
    HypervisorPortGraphsComponent,
    HypervisorPortUsageGraphsComponent,
    BmServerPortGraphsComponent,
    BmServerPortUsageGraphsComponent,
    MacminiPortGraphsComponent,
    MacminiPortUsageGraphsComponent,
    StoragePortGraphsComponent,
    StoragePortUsageGraphsComponent,
    VmPortGraphsComponent,
    VmPortUsageGraphsComponent,
    UnityS3AccountComponent,
    UnityS3Component,
    UnityS3TabsComponent,
    UnityS3BucketFilesComponent,
    VmsListHypervComponent,
    DatabaseServersComponent,
    DatabaseServerCrudComponent,
    DatabaseMonitoringComponent,
    DatabaseMonitoringGraphsComponent,
    DatabaseMonitoringGraphCrudComponent,
    VmsListEsxiComponent,
    OciVirtualMachinesComponent,
    HypervisorsEsxiVmsComponent,
    HypervisorsEsxiPlaceholderComponent,
    DatabaseMonitoringConfigComponent,
    SwitchesZabbixComponent,
    DevicesMonitoringConfigComponent,
    LoadbalancersZabbixComponent,
    FirewallsZabbixComponent,
    BmServersZabbixComponent,
    HypervisorsZabbixComponent,
    StorageZabbixComponent,
    ZabbixTriggersComponent,
    ZabbixTriggerCrudComponent,
    VmsTagsCrudComponent,
    VmsZabbixComponent,
    ZabbixVmsGraphsComponent,
    ZabbixVmsGraphCrudComponent,
    ZabbixGraphCrudComponent,
    ZabbixMacminiGraphCrudComponent,
    MacminiZabbixComponent,
    VmsListVmwareAddComponent,
    VmsListCustomCrudComponent,
    BmServersMonitoringConfigComponent,
    VmsVmwareSnapshotsComponent,
    VcenterContentLibraryComponent,
    VcenterContentLibraryFilesComponent,
    ZabbixSwitchDetailsComponent,
    ZabbixFirewallDetailsComponent,
    ZabbixLoadbalancerDetailsComponent,
    ZabbixHypervisorDetailsComponent,
    ZabbixBmsDetailsComponent,
    ZabbixMacminiDetailsComponent,
    ZabbixStorageDetailsComponent,
    VmsListVmwareDeployOvfComponent,
    VmsListVmwareDeployOvaComponent,
    AzureZabbixComponent,
    ZabbixAzureGraphsCrudComponent,
    ZabbixAzureMonitoringConfigComponent,
    ZabbixTriggerScriptsComponent,
    ZabbixVmsDetailsComponent,
    StorageOntapComponent,
    StorageOntapSummaryComponent,
    StorageOntapNodesComponent,
    StorageOntapAggregatesComponent,
    StorageOntapVolumesComponent,
    StorageOntapLunsComponent,
    StorageOntapSvmsComponent,
    StorageMonitoringConfigComponent,
    StorageOntapDetailsComponent,
    StorageOntapNodeDetailsComponent,
    StorageOntapAggregateDetailsComponent,
    StorageOntapSvmDetailsComponent,
    StorageOntapVolumeDetailsComponent,
    StorageOntapLunDetailsComponent,
    StorageOntapDetailsTabComponent,
    StorageOntapEventsComponent,
    StorageOntapTriggersComponent,
    StorageOntapStatisticsComponent,
    StorageOntapDisksComponent,
    StorageOntapShelvesComponent,
    StorageOntapEthernetPortsComponent,
    StorageOntapFcPortsComponent,
    StorageOntapSnapMirrorsComponent,
    StorageOntapClusterPeersComponent,
    OtherdevicesCrudComponent,
    OtherdevicesZabbixComponent,
    ZabbixOtherdeviceDetailsComponent,
    ZabbixOtherdeviceMonitoringConfigComponent,
    AwsZabbixComponent,
    ZabbixAwsMonitoringConfigComponent,
    ZabbixEventsComponent,
    NutanixComponent,
    NutanixClustersComponent,
    NutanixClusterDetailsComponent,
    NutanixHostsComponent,
    NutanixHostDetailsComponent,
    NutanixDisksComponent,
    NutanixDiskDetailsComponent,
    NutanixStorageContainersComponent,
    NutanixStorageContainersDetailsComponent,
    NutanixStoragePoolsComponent,
    NutanixStoragePoolsDetailsComponent,
    VmsListNutanixComponent,
    NutanixVmsDetailsComponent,
    NutanixVirtualDisksComponent,
    NutanixVirtualDisksDetailsComponent,
    NutanixZabbixComponent,
    NutanixDetailsComponent,
    ContainerControllersZabbixComponent,
    ZabbixGraphsComponent,
    DeviceDetailsComponentsComponent,
    GcpZabbixComponent,
    ZabbixGcpGraphsComponent,
    ZabbixGcpGraphsCrudComponent,
    ZabbixGcpMonitoringConfigComponent,
    DockerContainersZabbixComponent,
    VcenterCloudComponent,
    VcenterClustersComponent,
    VcenterDatastoresComponent,
    VcenterNetworksComponent,
    VcenterClusterItemsComponent,
    StoragePureComponent,
    PureStorageHostsComponent,
    PureStorageHostGroupsComponent,
    PureStorageVolumesComponent,
    PureStorageVolumeSnapshotsComponent,
    PureStorageVolumeGroupsComponent,
    PureStoragePodsComponent,
    PureStorageProtectionGroupsComponent,
    PureStorageProtectionGroupSnapshotsComponent,
    SdwansComponent,
    SdwansDetailsComponent,
    SdwansZabbixComponent,
    SdwanDetailsZabbixComponent,
    ZabbixSdwanDeviceDetailsComponent,
    DeviceDetailsBulkUpdatePopupComponent,
    VcenterZabbixComponent,
    ZabbixVcenterMonitoringConfigComponent,
    NetworkControllersComponent,
    NetworkControllersZabbixComponent,
    NetworkControllersViptelaComponentsComponent,
    NetworkControllersViptelaComponentZabbixComponent,
    ZabbixNetworkControllersViptelaComponentDetailsComponent,
    NetworkControllersCiscoMerakiComponent,
    NetworkControllersCiscoMerakiOrganizationsComponent,
    NetworkControllersCiscoMerakiDevicesComponent,
    NetworkControllersCiscoMerakiOrganizationsZabbixComponent,
    ZabbixNetworkControllersCiscoMerakiOrganizationsDetailsComponent,
    NetworkControllersCiscoMerakiDevicesZabbixComponent,
    ZabbixNetworkControllersCiscoMerakiDevicesDetailsComponent,
    IotDevicesComponent,
    IotDevicesZabbixComponent,
    ZabbixIotDeviceSensorDetailsComponent,
    ZabbixIotDeviceSmartPduDetailsComponent,
    ZabbixIotDeviceRfidReaderDetailsComponent,
    ZabbixIotDeviceSensorOverviewComponent,
    DeviceOverviewComponent,
    DatabaseZabbixDetailsComponent,
    DatabaseDetailsComponent,
    NetworkDevicesDetailsComponentsComponent,
    BaremetalDetailsComponentsComponent,
    StorageDetailsComponentsComponent,
    VmDetailsComponentsComponent,
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    ChartsModule,
    CollapseModule.forRoot(),
    EchartsxModule,
    NgbModule
  ],
  exports: [
    DevicesPopoverComponent,
    DeviceGraphsComponent,
    DeviceSensorComponent,
    DeviceStatusComponent,
    VmsListVmwareComponent,
    VmsListOpenstackComponent,
    ServerPowerToggleComponent,
    AwsVirtualMachinesComponent,
    AwsDeviceTabComponent,
    PublicCloudAwsCloudwatchComponent,
    AzureVirtualMachinesComponent,
    GcpVirtualMachinesComponent,
    ContainerControllersComponent,
    KubernetesPodsComponent,
    KubernetesContainersComponent,
    PduRecycleComponent,
    OciVirtualMachinesComponent,
    DevicesMonitoringConfigComponent,
    SwitchesZabbixComponent,
    FirewallsZabbixComponent,
    LoadbalancersZabbixComponent,
    DeviceDetailsComponentsComponent
  ],
  providers: [
    HypervisorsService,
    HypervisorOverviewService,
    UnitedCloudSharedService,
    BmServersService,
    BmServersOverviewService,
    BmServersStatsService,
    VmsOverviewService,
    SwitchesService,
    SwitchesOverviewService,
    FirewallsService,
    FirewallsOverviewService,
    LoadbalancersService,
    KubernetesPodsService,
    LoadbalancersOverviewService,
    OtherdevicesService,
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
    FirewallCrudService,
    BmServersCrudService,
    HypervisorsCrudService,
    LoadbalancersCrudService,
    SwitchesCrudService,
    PduRecycleService,
    StorageDevicesService,
    StorageCrudService,
    StorageOverviewService,
    ContainerControllerCrudService,
    MacMiniService,
    MacMiniCrudService,
    MacminiOverviewService,
    DatabaseServersService,
    DatabaseServerCrudService,
    DatabaseMonitoringConfigService,
    VmsListVmwareAddService,
    VmsListCustomCrudService,
    VmsListVmwareDeployOvfService,
    VmsListVmwareDeployOvaService,
    TitleCasePipe,
  ]
})
export class UnitedCloudSharedModule { }