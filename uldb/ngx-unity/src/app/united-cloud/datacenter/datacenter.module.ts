import { DragDropModule } from '@angular/cdk/drag-drop';
import { DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { DndModule } from 'ngx-drag-drop';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { AppSharedCrudModule } from 'src/app/app-shared-crud/app-shared-crud.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { UnitedCloudSharedModule } from '../shared/united-cloud-shared.module';
import { DatacenterCabinetViewCabinetInfoComponent } from './datacenter-cabinet-view/datacenter-cabinet-view-cabinet-info/datacenter-cabinet-view-cabinet-info.component';
import { DatacenterCabinetViewDeviceInfoComponent } from './datacenter-cabinet-view/datacenter-cabinet-view-device-info/datacenter-cabinet-view-device-info.component';
import { DatacenterCabinetViewDeviceSensorsComponent } from './datacenter-cabinet-view/datacenter-cabinet-view-device-sensors/datacenter-cabinet-view-device-sensors.component';
import { DatacenterCabinetViewDeviceStatusComponent } from './datacenter-cabinet-view/datacenter-cabinet-view-device-status/datacenter-cabinet-view-device-status.component';
import { DatacenterCabinetViewMonitoringGraphsComponent } from './datacenter-cabinet-view/datacenter-cabinet-view-monitoring-graphs/datacenter-cabinet-view-monitoring-graphs.component';
import { DatacenterCabinetViewComponent } from './datacenter-cabinet-view/datacenter-cabinet-view.component';
import { DatacenterCabinetsComponent } from './datacenter-cabinets/datacenter-cabinets.component';
import { DatacenterPdusAlertComponent } from './datacenter-pdus/datacenter-pdus-observium/datacenter-pdus-alert/datacenter-pdus-alert.component';
import { DatacenterPdusGraphNetstatsComponent } from './datacenter-pdus/datacenter-pdus-observium/datacenter-pdus-graph/datacenter-pdus-graph-netstats/datacenter-pdus-graph-netstats.component';
import { DatacenterPdusGraphPollerComponent } from './datacenter-pdus/datacenter-pdus-observium/datacenter-pdus-graph/datacenter-pdus-graph-poller/datacenter-pdus-graph-poller.component';
import { DatacenterPdusGraphSystemComponent } from './datacenter-pdus/datacenter-pdus-observium/datacenter-pdus-graph/datacenter-pdus-graph-system/datacenter-pdus-graph-system.component';
import { DatacenterPdusGraphComponent } from './datacenter-pdus/datacenter-pdus-observium/datacenter-pdus-graph/datacenter-pdus-graph.component';
import { DatacenterPdusHealthOverviewComponent } from './datacenter-pdus/datacenter-pdus-observium/datacenter-pdus-health/datacenter-pdus-health-overview/datacenter-pdus-health-overview.component';
import { DatacenterPdusHealthComponent } from './datacenter-pdus/datacenter-pdus-observium/datacenter-pdus-health/datacenter-pdus-health.component';
import { DatacenterPdusOverviewDetailsComponent } from './datacenter-pdus/datacenter-pdus-observium/datacenter-pdus-overview/datacenter-pdus-overview-details/datacenter-pdus-overview-details.component';
import { DatacenterPdusOverviewComponent } from './datacenter-pdus/datacenter-pdus-observium/datacenter-pdus-overview/datacenter-pdus-overview.component';
import { DatacenterPdusOverviewService } from './datacenter-pdus/datacenter-pdus-observium/datacenter-pdus-overview/datacenter-pdus-overview.service';
import { DatacenterPduPortGraphsComponent } from './datacenter-pdus/datacenter-pdus-observium/datacenter-pdus-port/datacenter-pdu-port-graphs/datacenter-pdu-port-graphs.component';
import { DatacenterPduPortUsageGraphsComponent } from './datacenter-pdus/datacenter-pdus-observium/datacenter-pdus-port/datacenter-pdu-port-graphs/datacenter-pdu-port-usage-graphs/datacenter-pdu-port-usage-graphs.component';
import { DatacenterPdusPortComponent } from './datacenter-pdus/datacenter-pdus-observium/datacenter-pdus-port/datacenter-pdus-port.component';
import { DatacenterPdusZabbixComponent } from './datacenter-pdus/datacenter-pdus-zabbix/datacenter-pdus-zabbix.component';
import { ZabbixDcPduDetailsComponent } from './datacenter-pdus/datacenter-pdus-zabbix/zabbix-dc-pdu-details/zabbix-dc-pdu-details.component';
import { ZabbixDcPduGraphCrudComponent } from './datacenter-pdus/datacenter-pdus-zabbix/zabbix-dc-pdu-graph-crud/zabbix-dc-pdu-graph-crud.component';
import { ZabbixDcPduGraphsComponent } from './datacenter-pdus/datacenter-pdus-zabbix/zabbix-dc-pdu-graphs/zabbix-dc-pdu-graphs.component';
import { DatacenterPdusComponent } from './datacenter-pdus/datacenter-pdus.component';
import { DatacenterPrivateCloudResolverService } from './datacenter-private-clouds/datacenter-private-cloud-resolver.service';
import { DatacenterPrivateCloudService } from './datacenter-private-clouds/datacenter-private-cloud.service';
import { DatacenterPrivateCloudsComponent } from './datacenter-private-clouds/datacenter-private-clouds.component';
import { DatacenterResolverService } from './datacenter-resolver.service';
import { DatacenterRoutingModule } from './datacenter-routing.module';
import { DatacenterComponent } from './datacenter.component';
import { DatacenterService } from './datacenter.service';


@NgModule({
  declarations: [DatacenterComponent, DatacenterCabinetsComponent,
    DatacenterPdusComponent, DatacenterPrivateCloudsComponent,
    DatacenterPdusOverviewComponent, DatacenterPdusHealthComponent,
    DatacenterPdusPortComponent,
    DatacenterPdusGraphComponent,
    DatacenterPdusAlertComponent,
    DatacenterPdusGraphNetstatsComponent,
    DatacenterPdusGraphPollerComponent,
    DatacenterPdusGraphSystemComponent,
    DatacenterPdusHealthOverviewComponent,
    DatacenterPdusOverviewDetailsComponent,
    DatacenterCabinetViewComponent,
    DatacenterCabinetViewDeviceStatusComponent,
    DatacenterCabinetViewDeviceSensorsComponent,
    DatacenterCabinetViewCabinetInfoComponent,
    DatacenterCabinetViewDeviceInfoComponent,
    DatacenterCabinetViewMonitoringGraphsComponent,
    DatacenterPduPortGraphsComponent,
    DatacenterPduPortUsageGraphsComponent,
    ZabbixDcPduGraphCrudComponent,
    ZabbixDcPduGraphsComponent,
    DatacenterPdusZabbixComponent,
    ZabbixDcPduDetailsComponent
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    AppSharedCrudModule,
    DatacenterRoutingModule,
    UnitedCloudSharedModule,
    DragDropModule,
    DndModule,
  ],
  providers: [DatacenterService,
    DatacenterResolverService,
    DatacenterPrivateCloudService,
    DatacenterPrivateCloudResolverService,
    DatacenterPdusOverviewService,
    DecimalPipe,
  ]
})
export class DatacenterModule { }
