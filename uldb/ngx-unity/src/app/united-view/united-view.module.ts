import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ChartsModule } from 'ng2-charts';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ModalModule } from 'ngx-bootstrap/modal';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedModule } from 'src/app/shared/shared.module';
import { AppCoreModule } from '../app-core/app-core.module';
import { ActivityLogsComponent } from './activity-logs/activity-logs.component';
import { DatabaseComponent } from './monitoring/database/database.component';
import { DeviceGroupComponent } from './monitoring/devices/device-group/device-group.component';
import { DeviceService } from './monitoring/devices/device.service';
import { DevicesCrudComponent } from './monitoring/devices/devices-crud/devices-crud.component';
import { DevicesIconComponent } from './monitoring/devices/devices-icon.component';
import { DevicesComponent } from './monitoring/devices/devices.component';
import { MonitoringConfigurationComponent } from './monitoring/monitoring-configuration/monitoring-configuration.component';
import { MonitoringDatacenterWidgetComponent } from './monitoring/monitoring-datacenter/monitoring-datacenter-widget/monitoring-datacenter-widget.component';
import { MonitoringDatacenterComponent } from './monitoring/monitoring-datacenter/monitoring-datacenter.component';
import { MonitoringComponent } from './monitoring/monitoring.component';
import { NetworkComponent } from './monitoring/network/network.component';
import { PerformanceComponent } from './monitoring/performance/performance.component';
import { StorageComponent } from './monitoring/storage/storage.component';
import { SystemComponent } from './monitoring/system/system.component';
import { UnitedViewRoutingModule } from './united-view-routing.module';
import { AllAlertsComponent } from './unity-alerts/all-alerts/all-alerts.component';
import { DeviceAlertsComponent } from './unity-alerts/device-alerts/device-alerts.component';
import { ObserviumAlertsComponent } from './unity-alerts/device-alerts/observium-alerts/observium-alerts.component';
import { ObserviumAlertsService } from './unity-alerts/device-alerts/observium-alerts/observium-alerts.service';
import { ZabbixAlertsComponent } from './unity-alerts/device-alerts/zabbix-alerts/zabbix-alerts.component';
import { ZabbixAlertsService } from './unity-alerts/device-alerts/zabbix-alerts/zabbix-alerts.service';
import { UnityAlertGraphsComponent } from './unity-alerts/unity-alerts-graph/unity-alerts-graph.component';
import { UnityAlertsHistoryComponent } from './unity-alerts/unity-alerts-history/unity-alerts-history.component';
import { UnityAlertsViewComponent } from './unity-alerts/unity-alerts-view/unity-alerts-view.component';
import { UnityAlertsComponent } from './unity-alerts/unity-alerts.component';
import { VmsAlertsComponent } from './unity-alerts/vms-alerts/vms-alerts.component';
import { UnityNetworkTopologyComponent } from './unity-network-topology/unity-network-topology.component';
import { UnityAzureTopologyViewComponent } from './unity-topology/unity-azure-topology-view/unity-azure-topology-view.component';
import { UnityOciTopologyViewComponent } from './unity-topology/unity-oci-topology-view/unity-oci-topology-view.component';
import { UnityTopologyViewComponent } from './unity-topology/unity-topology-view/unity-topology-view.component';
import { UnityTopologyComponent } from './unity-topology/unity-topology.component';
import { UnityGcpTopologyViewComponent } from './unity-topology/unity-gcp-topology-view/unity-gcp-topology-view.component';
import { CurrencyPipe } from '@angular/common';
import { UnityServiceTopologyComponent } from './unity-service-topology/unity-service-topology.component';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { AppSecToDaysPipe } from 'src/app/app-filters/pipes';
// import { UnityZabbixVmsAlertsComponent } from './unity-alerts/vms-alerts/unity-zabbix-vms-alerts/unity-zabbix-vms-alerts.component';
// import { UnityObserviumVmsAlertsComponent } from './unity-alerts/vms-alerts/unity-observium-vms-alerts/unity-observium-vms-alerts.component';

@NgModule({
  declarations: [
    MonitoringComponent,
    DevicesComponent,
    SystemComponent,
    StorageComponent,
    DatabaseComponent,
    PerformanceComponent,
    NetworkComponent,
    MonitoringDatacenterComponent,
    ActivityLogsComponent,
    UnityAlertsComponent,
    AllAlertsComponent,
    DeviceAlertsComponent,
    VmsAlertsComponent,
    MonitoringDatacenterWidgetComponent,
    DeviceGroupComponent,
    DevicesIconComponent,
    DevicesCrudComponent,
    ZabbixAlertsComponent,
    ObserviumAlertsComponent,
    UnityAlertsViewComponent,
    UnityAlertsHistoryComponent,
    UnityAlertGraphsComponent,
    MonitoringConfigurationComponent,
    UnityNetworkTopologyComponent,
    UnityTopologyComponent,
    UnityTopologyViewComponent,
    UnityAzureTopologyViewComponent,
    UnityOciTopologyViewComponent,
    UnityGcpTopologyViewComponent,
    UnityServiceTopologyComponent
    // UnityZabbixVmsAlertsComponent,
    // UnityObserviumVmsAlertsComponent
  ],
  imports: [
    SharedModule,
    AppCoreModule,
    UnitedViewRoutingModule,
    ChartsModule,
    NgbDatepickerModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    ModalModule.forRoot(),
    CollapseModule.forRoot(),
    DragDropModule,
    InfiniteScrollModule,
    NgxGraphModule
  ],
  entryComponents: [DevicesIconComponent],
  providers: [DeviceService,
    ZabbixAlertsService,
    ObserviumAlertsService,
    CurrencyPipe,
    AppSecToDaysPipe
  ]
})
export class UnitedViewModule { }
