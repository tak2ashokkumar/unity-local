import { NgModule } from '@angular/core';

import { AppHomeRoutingModule } from './app-home-routing.module';
import { AppHomeComponent } from './app-home.component';
import { AppCoreModule } from '../app-core/app-core.module';
import { SharedModule } from '../shared/shared.module';
import { ChartsModule } from 'ng2-charts';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { EchartsxModule } from 'echarts-for-angular';
import { MarkdownModule } from 'ngx-markdown';
import { CurrencyPipe } from '@angular/common';
import { AssetUnderMgmtComponent } from './asset-under-mgmt/asset-under-mgmt.component';
import { AssetsMgmtBarsComponent } from './asset-under-mgmt/assets-mgmt-bars/assets-mgmt-bars.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { AimlMgmtComponent } from './aiml-mgmt/aiml-mgmt.component';
import { DashboardTicketMgmtComponent } from './dashboard-ticket-mgmt/dashboard-ticket-mgmt.component';
import { DashboardMapWidgetComponent } from './dashboard-map-widget/dashboard-map-widget.component';
import { CabinetWidgetWrapperComponent } from './cabinet-widget-wrapper/cabinet-widget-wrapper.component';
import { CabinetWidgetComponent } from './cabinet-widget-wrapper/cabinet-widget/cabinet-widget.component';
import { DcSpinnerUtilComponent } from './cabinet-widget-wrapper/dc-spinner-util.component';
import { AlertsComponent } from './alerts/alerts.component';
import { PrivateCloudComponent } from './infra-as-a-service/private-cloud/private-cloud.component';
import { PrivateCloudWidgetClustersComponent } from './infra-as-a-service/private-cloud/private-cloud-widget-clusters/private-cloud-widget-clusters.component';
import { PrivateCloudWidgetComponent } from './infra-as-a-service/private-cloud/private-cloud-widget/private-cloud-widget.component';
import { DashboardDockerSwarmWidgetComponent } from './infra-as-a-service/dashboard-dockers-controller/dashboard-docker-swarm-widget/dashboard-docker-swarm-widget.component';
import { DashboardDockersControllerComponent } from './infra-as-a-service/dashboard-dockers-controller/dashboard-dockers-controller.component';
import { DashboardNativeDockerWidgetComponent } from './infra-as-a-service/dashboard-dockers-controller/dashboard-native-docker-widget/dashboard-native-docker-widget.component';
import { DashboardKubernetesControllersWidgetComponent } from './infra-as-a-service/dashboard-kubernetes-controllers/dashboard-kubernetes-controllers-widget/dashboard-kubernetes-controllers-widget.component';
import { DashboardKubernetesControllersComponent } from './infra-as-a-service/dashboard-kubernetes-controllers/dashboard-kubernetes-controllers.component';
import { InfraAsAServiceComponent } from './infra-as-a-service/infra-as-a-service.component';
import { AppMeshWidgetComponent } from './infra-as-a-service/mesh-services/app-mesh-widget/app-mesh-widget.component';
import { IstioWidgetComponent } from './infra-as-a-service/mesh-services/istio-widget/istio-widget.component';
import { MeshServicesComponent } from './infra-as-a-service/mesh-services/mesh-services.component';
import { TrafficDirectorWidgetComponent } from './infra-as-a-service/mesh-services/traffic-director-widget/traffic-director-widget.component';
import { GcpWidgetComponent } from './infra-as-a-service/public-cloud/gcp-widget/gcp-widget.component';
import { OciWidgetComponent } from './infra-as-a-service/public-cloud/oci-widget/oci-widget.component';
import { PublicCloudWidgetComponent } from './infra-as-a-service/public-cloud/public-cloud-widget/public-cloud-widget.component';
import { PublicCloudComponent } from './infra-as-a-service/public-cloud/public-cloud.component';


@NgModule({
  declarations: [
    AppHomeComponent,
    AssetUnderMgmtComponent,
    AssetsMgmtBarsComponent,
    MaintenanceComponent,
    AimlMgmtComponent,
    DashboardTicketMgmtComponent,
    DashboardMapWidgetComponent,
    CabinetWidgetWrapperComponent,
    CabinetWidgetComponent,
    DcSpinnerUtilComponent,
    AlertsComponent,
    PrivateCloudComponent,
    PrivateCloudWidgetClustersComponent,
    PrivateCloudWidgetComponent,
    DashboardDockerSwarmWidgetComponent,
    DashboardDockersControllerComponent,
    DashboardNativeDockerWidgetComponent,
    DashboardKubernetesControllersWidgetComponent,
    DashboardKubernetesControllersComponent,
    InfraAsAServiceComponent,
    AppMeshWidgetComponent,
    IstioWidgetComponent,
    MeshServicesComponent,
    TrafficDirectorWidgetComponent,
    GcpWidgetComponent,
    OciWidgetComponent,
    PublicCloudWidgetComponent,
    PublicCloudComponent,
  ],
  imports: [
    AppHomeRoutingModule,
    AppCoreModule,
    SharedModule,
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
    NgxGraphModule,
    EchartsxModule,
    MarkdownModule
  ],
  exports: [
    PrivateCloudComponent,
    PrivateCloudWidgetClustersComponent,
    PrivateCloudWidgetComponent
  ],
  providers: [
    CurrencyPipe
  ]
})
export class AppHomeModule { }
