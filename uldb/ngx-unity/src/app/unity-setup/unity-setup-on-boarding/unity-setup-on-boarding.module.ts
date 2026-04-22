import { NgModule } from '@angular/core';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { AppSharedCrudModule } from 'src/app/app-shared-crud/app-shared-crud.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdvancedDeviceDiscoveryComponent } from './advanced-device-discovery/advanced-device-discovery.component';
import { AdvancedDiscoveryCabinetsComponent } from './advanced-device-discovery/advanced-discovery-cabinets/advanced-discovery-cabinets.component';
import { AdvancedDiscoveryDatacenterComponent } from './advanced-device-discovery/advanced-discovery-datacenter/advanced-discovery-datacenter.component';
import { AdvancedDiscoveryFirewallsComponent } from './advanced-device-discovery/advanced-discovery-firewalls/advanced-discovery-firewalls.component';
import { AdvancedDiscoveryHypervisorsComponent } from './advanced-device-discovery/advanced-discovery-hypervisors/advanced-discovery-hypervisors.component';
import { AdvancedDiscoveryLoadbalancersComponent } from './advanced-device-discovery/advanced-discovery-loadbalancers/advanced-discovery-loadbalancers.component';
import { AdvancedDiscoveryMacdevicesComponent } from './advanced-device-discovery/advanced-discovery-macdevices/advanced-discovery-macdevices.component';
import { AdvancedDiscoveryNetworkScanComponent } from './advanced-device-discovery/advanced-discovery-network-scan/advanced-discovery-network-scan.component';
import { AdvancedDiscoveryNetworkTopologyComponent } from './advanced-device-discovery/advanced-discovery-network-topology/advanced-discovery-network-topology.component';
import { AdvancedDiscoveryNextPrevComponent } from './advanced-device-discovery/advanced-discovery-next-prev/advanced-discovery-next-prev.component';
import { AdvancedDiscoveryPdusComponent } from './advanced-device-discovery/advanced-discovery-pdus/advanced-discovery-pdus.component';
import { AdvancedDiscoveryScanOpComponent } from './advanced-device-discovery/advanced-discovery-scan-op/advanced-discovery-scan-op.component';
import { AdvancedDiscoveryServersComponent } from './advanced-device-discovery/advanced-discovery-servers/advanced-discovery-servers.component';
import { AdvancedDiscoveryStorageComponent } from './advanced-device-discovery/advanced-discovery-storage/advanced-discovery-storage.component';
import { AdvancedDiscoverySummaryNetworkViewComponent } from './advanced-device-discovery/advanced-discovery-summary/advanced-discovery-summary-network-view/advanced-discovery-summary-network-view.component';
import { AdvancedDiscoverySummaryViewComponent } from './advanced-device-discovery/advanced-discovery-summary/advanced-discovery-summary-view/advanced-discovery-summary-view.component';
import { AdvancedDiscoverySummaryComponent } from './advanced-device-discovery/advanced-discovery-summary/advanced-discovery-summary.component';
import { AdvancedDiscoverySwitchesComponent } from './advanced-device-discovery/advanced-discovery-switches/advanced-discovery-switches.component';
import { AdvancedDiscoveryConnectivityCrudComponent } from './advanced-discovery-connectivity/advanced-discovery-connectivity-crud/advanced-discovery-connectivity-crud.component';
import { AdvancedDiscoveryConnectivityCrudService } from './advanced-discovery-connectivity/advanced-discovery-connectivity-crud/advanced-discovery-connectivity-crud.service';
import { AdvancedDiscoveryConnectivityComponent } from './advanced-discovery-connectivity/advanced-discovery-connectivity.component';
import { AdvancedDiscoveryConnectivityService } from './advanced-discovery-connectivity/advanced-discovery-connectivity.service';
import { ExcelOnBoardFilesComponent } from './excel-on-boarding/excel-on-board-files/excel-on-board-files.component';
import { ExcelOnBoardingInventoryComponent } from './excel-on-boarding/excel-on-board-inventory/excel-on-boarding-inventory.component';
import { ExcelOnBoardingBmsComponent } from './excel-on-boarding/excel-on-boarding-bms/excel-on-boarding-bms.component';
import { ExcelOnBoardingCabinetsComponent } from './excel-on-boarding/excel-on-boarding-cabinets/excel-on-boarding-cabinets.component';
import { ExcelOnBoardingDataCentersComponent } from './excel-on-boarding/excel-on-boarding-data-centers/excel-on-boarding-data-centers.component';
import { ExcelOnBoardingDatabaseComponent } from './excel-on-boarding/excel-on-boarding-database/excel-on-boarding-database.component';
import { ExcelOnBoardingFirewallsComponent } from './excel-on-boarding/excel-on-boarding-firewalls/excel-on-boarding-firewalls.component';
import { ExcelOnBoardingHypervisorsComponent } from './excel-on-boarding/excel-on-boarding-hypervisors/excel-on-boarding-hypervisors.component';
import { ExcelOnBoardingLoadbalancersComponent } from './excel-on-boarding/excel-on-boarding-loadbalancers/excel-on-boarding-loadbalancers.component';
import { ExcelOnBoardingMacComponent } from './excel-on-boarding/excel-on-boarding-mac/excel-on-boarding-mac.component';
import { ExcelOnBoardingMobilesComponent } from './excel-on-boarding/excel-on-boarding-mobiles/excel-on-boarding-mobiles.component';
import { ExcelOnBoardingNextPrevComponent } from './excel-on-boarding/excel-on-boarding-next-prev/excel-on-boarding-next-prev.component';
import { ExcelOnBoardingNextPrevService } from './excel-on-boarding/excel-on-boarding-next-prev/excel-on-boarding-next-prev.service';
import { ExcelOnBoardingPduComponent } from './excel-on-boarding/excel-on-boarding-pdu/excel-on-boarding-pdu.component';
import { ExcelOnBoardingStorageComponent } from './excel-on-boarding/excel-on-boarding-storage/excel-on-boarding-storage.component';
import { ExcelOnBoardingSummaryComponent } from './excel-on-boarding/excel-on-boarding-summary/excel-on-boarding-summary.component';
import { ExcelOnBoardingSwitchesComponent } from './excel-on-boarding/excel-on-boarding-switches/excel-on-boarding-switches.component';
import { ExcelOnBoardingComponent } from './excel-on-boarding/excel-on-boarding.component';
import { AgentConfigurationComponent } from './on-boarding/connect-to-unity/agent-configuration/agent-configuration.component';
import { ConnectToUnityComponent } from './on-boarding/connect-to-unity/connect-to-unity.component';
import { DevicesBoardingComponent } from './on-boarding/on-board-assets/devices-boarding/devices-boarding.component';
import { OnBoardAssetsComponent } from './on-boarding/on-board-assets/on-board-assets.component';
import { OnBoardingComponent } from './on-boarding/on-boarding.component';
import { UnitySetupManagementComponent } from './on-boarding/unity-setup-management/unity-setup-management.component';
import { OnBoardingDeviceMonitoringComponent } from './on-boarding/unity-setup-monitoring/on-boarding-device-monitoring/on-boarding-device-monitoring.component';
import { OnBoardingVmMonitoringComponent } from './on-boarding/unity-setup-monitoring/on-boarding-vm-monitoring/on-boarding-vm-monitoring.component';
import { UnitySetupMonitoringComponent } from './on-boarding/unity-setup-monitoring/unity-setup-monitoring.component';
import { DeviceDiscoveryCabinetsComponent } from './unity-setup-device-discovery/device-discovery-cabinets/device-discovery-cabinets.component';
import { DeviceDiscoveryConnectivityComponent } from './unity-setup-device-discovery/device-discovery-connectivity/device-discovery-connectivity.component';
import { DeviceDiscoveryDataCenterComponent } from './unity-setup-device-discovery/device-discovery-data-center/device-discovery-data-center.component';
import { DeviceDiscoveryFirewallsComponent } from './unity-setup-device-discovery/device-discovery-firewalls/device-discovery-firewalls.component';
import { DeviceDiscoveryHypervisorComponent } from './unity-setup-device-discovery/device-discovery-hypervisor/device-discovery-hypervisor.component';
import { DeviceDiscoveryLoadbalancersComponent } from './unity-setup-device-discovery/device-discovery-loadbalancers/device-discovery-loadbalancers.component';
import { DeviceDiscoveryMacComponent } from './unity-setup-device-discovery/device-discovery-mac/device-discovery-mac.component';
import { DeviceDiscoveryNetworkScanComponent } from './unity-setup-device-discovery/device-discovery-network-scan/device-discovery-network-scan.component';
import { DeviceDiscoveryPdusComponent } from './unity-setup-device-discovery/device-discovery-pdus/device-discovery-pdus.component';
import { DeviceDiscoveryScanOpComponent } from './unity-setup-device-discovery/device-discovery-scan-op/device-discovery-scan-op.component';
import { DeviceDiscoveryServersComponent } from './unity-setup-device-discovery/device-discovery-servers/device-discovery-servers.component';
import { DeviceDiscoveryStorageComponent } from './unity-setup-device-discovery/device-discovery-storage/device-discovery-storage.component';
import { DeviceDiscoverySummaryComponent } from './unity-setup-device-discovery/device-discovery-summary/device-discovery-summary.component';
import { DeviceDiscoverySwitchesComponent } from './unity-setup-device-discovery/device-discovery-switches/device-discovery-switches.component';
import { NextPrevComponent } from './unity-setup-device-discovery/next-prev/next-prev.component';
import { UnitySetupDeviceDiscoveryComponent } from './unity-setup-device-discovery/unity-setup-device-discovery.component';
import { UnitySetupOnBoardingResolverService } from './unity-setup-on-boarding-resolver.service';
import { UnitySetupOnBoardingRoutingModule } from './unity-setup-on-boarding-routing.module';
import { UnitySetupOnBoardingSummaryComponent } from './unity-setup-on-boarding-summary/unity-setup-on-boarding-summary.component';
import { UnitySetupOnBoardingComponent } from './unity-setup-on-boarding.component';
import { AdvancedDiscoveryPolicyCrudComponent } from './advanced-device-discovery/advanced-discovery-network-scan/advanced-discovery-policy-crud/advanced-discovery-policy-crud.component';


@NgModule({
  declarations: [
    UnitySetupOnBoardingComponent,
    ConnectToUnityComponent,
    OnBoardAssetsComponent,
    UnitySetupMonitoringComponent,
    UnitySetupManagementComponent,
    DevicesBoardingComponent,
    OnBoardingVmMonitoringComponent,
    OnBoardingDeviceMonitoringComponent,
    AgentConfigurationComponent,
    OnBoardingComponent,

    UnitySetupDeviceDiscoveryComponent,
    DeviceDiscoveryDataCenterComponent,
    DeviceDiscoveryCabinetsComponent,
    DeviceDiscoverySummaryComponent,
    DeviceDiscoveryServersComponent,
    DeviceDiscoveryLoadbalancersComponent,
    DeviceDiscoveryFirewallsComponent,
    DeviceDiscoverySwitchesComponent,
    DeviceDiscoveryConnectivityComponent,
    DeviceDiscoveryNetworkScanComponent,
    DeviceDiscoveryScanOpComponent,
    DeviceDiscoveryStorageComponent,
    NextPrevComponent,
    DeviceDiscoveryPdusComponent,
    DeviceDiscoveryHypervisorComponent,
    DeviceDiscoveryMacComponent,
    AdvancedDeviceDiscoveryComponent,
    AdvancedDiscoveryCabinetsComponent,
    AdvancedDiscoveryDatacenterComponent,
    AdvancedDiscoveryFirewallsComponent,
    AdvancedDiscoveryHypervisorsComponent,
    AdvancedDiscoveryLoadbalancersComponent,
    AdvancedDiscoveryMacdevicesComponent,
    AdvancedDiscoveryNetworkScanComponent,
    AdvancedDiscoveryPdusComponent,
    AdvancedDiscoveryScanOpComponent,
    AdvancedDiscoveryServersComponent,
    AdvancedDiscoveryStorageComponent,
    AdvancedDiscoverySummaryComponent,
    AdvancedDiscoverySwitchesComponent,
    AdvancedDiscoveryNextPrevComponent,
    AdvancedDiscoveryConnectivityComponent,

    ExcelOnBoardingComponent,
    ExcelOnBoardFilesComponent,
    ExcelOnBoardingFirewallsComponent,
    ExcelOnBoardingSwitchesComponent,
    ExcelOnBoardingLoadbalancersComponent,
    ExcelOnBoardingBmsComponent,
    ExcelOnBoardingHypervisorsComponent,
    ExcelOnBoardingMacComponent,
    ExcelOnBoardingStorageComponent,
    ExcelOnBoardingPduComponent,
    ExcelOnBoardingMobilesComponent,
    ExcelOnBoardingDataCentersComponent,
    ExcelOnBoardingCabinetsComponent,
    ExcelOnBoardingNextPrevComponent,
    ExcelOnBoardingSummaryComponent,
    ExcelOnBoardingInventoryComponent,
    UnitySetupOnBoardingSummaryComponent,
    AdvancedDiscoveryNetworkTopologyComponent,
    AdvancedDiscoverySummaryViewComponent,
    AdvancedDiscoverySummaryNetworkViewComponent,
    ExcelOnBoardingDatabaseComponent,
    AdvancedDiscoveryConnectivityCrudComponent,
    AdvancedDiscoveryPolicyCrudComponent,
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    AppSharedCrudModule,
    PerfectScrollbarModule,
    UnitySetupOnBoardingRoutingModule,
    // ChartsModule
  ],
  providers: [
    ExcelOnBoardingNextPrevService,
    UnitySetupOnBoardingResolverService,
    AdvancedDiscoveryConnectivityService,
    AdvancedDiscoveryConnectivityCrudService
  ]
})
export class UnitySetupOnBoardingModule { }
