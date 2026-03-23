import { DragDropModule } from '@angular/cdk/drag-drop';
import { CurrencyPipe } from '@angular/common';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { NgModule } from '@angular/core';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { EchartsxModule } from 'echarts-for-angular';
import { ChartsModule } from 'ng2-charts';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ModalModule } from 'ngx-bootstrap/modal';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MarkdownModule } from 'ngx-markdown';
import { AppCoreModule } from '../app-core/app-core.module';
import { SharedModule } from '../shared/shared.module';
import { AppDashboardCrudComponent } from './app-dashboard-crud/app-dashboard-crud.component';
import { AppDashboardListComponent } from './app-dashboard-list/app-dashboard-list.component';
import { AppDashboardRoutingModule } from './app-dashboard-routing.module';
import { AppDashboardViewComponent } from './app-dashboard-view/app-dashboard-view.component';
import { AppDashboardComponent } from './app-dashboard.component';
// import { AimlMgmtComponent } from '../app-home/aiml-mgmt/aiml-mgmt.component';
// import { AlertsComponent } from '../app-home/alerts/alerts.component';
import { AppGlobalDashboardComponent } from './app-global-dashboard/app-global-dashboard.component';
// import { AssetUnderMgmtComponent } from '../app-home/asset-under-mgmt/asset-under-mgmt.component';
// import { AssetsMgmtBarsComponent } from '../app-home/asset-under-mgmt/assets-mgmt-bars/assets-mgmt-bars.component';
// import { CabinetWidgetWrapperComponent } from '../app-home/cabinet-widget-wrapper/cabinet-widget-wrapper.component';
// import { CabinetWidgetComponent } from '../app-home/cabinet-widget-wrapper/cabinet-widget/cabinet-widget.component';
// import { DcSpinnerUtilComponent } from '../app-home/cabinet-widget-wrapper/dc-spinner-util.component';
// import { DashboardTicketMgmtComponent } from '../app-home/dashboard-ticket-mgmt/dashboard-ticket-mgmt.component';
// import { DashboardDockerSwarmWidgetComponent } from '../app-home/infra-as-a-service/dashboard-dockers-controller/dashboard-docker-swarm-widget/dashboard-docker-swarm-widget.component';
// import { DashboardDockersControllerComponent } from '../app-home/infra-as-a-service/dashboard-dockers-controller/dashboard-dockers-controller.component';
// import { DashboardNativeDockerWidgetComponent } from '../app-home/infra-as-a-service/dashboard-dockers-controller/dashboard-native-docker-widget/dashboard-native-docker-widget.component';
// import { DashboardKubernetesControllersWidgetComponent } from '../app-home/infra-as-a-service/dashboard-kubernetes-controllers/dashboard-kubernetes-controllers-widget/dashboard-kubernetes-controllers-widget.component';
// import { DashboardKubernetesControllersComponent } from '../app-home/infra-as-a-service/dashboard-kubernetes-controllers/dashboard-kubernetes-controllers.component';
// import { InfraAsAServiceComponent } from '../app-home/infra-as-a-service/infra-as-a-service.component';
// import { AppMeshWidgetComponent } from '../app-home/infra-as-a-service/mesh-services/app-mesh-widget/app-mesh-widget.component';
// import { IstioWidgetComponent } from '../app-home/infra-as-a-service/mesh-services/istio-widget/istio-widget.component';
// import { MeshServicesComponent } from '../app-home/infra-as-a-service/mesh-services/mesh-services.component';
// import { TrafficDirectorWidgetComponent } from '../app-home/infra-as-a-service/mesh-services/traffic-director-widget/traffic-director-widget.component';
// import { PrivateCloudWidgetClustersComponent } from '../app-home/infra-as-a-service/private-cloud/private-cloud-widget-clusters/private-cloud-widget-clusters.component';
// import { PrivateCloudWidgetComponent } from '../app-home/infra-as-a-service/private-cloud/private-cloud-widget/private-cloud-widget.component';
// import { PrivateCloudComponent } from '../app-home/infra-as-a-service/private-cloud/private-cloud.component';
// import { GcpWidgetComponent } from '../app-home/infra-as-a-service/public-cloud/gcp-widget/gcp-widget.component';
// import { OciWidgetComponent } from '../app-home/infra-as-a-service/public-cloud/oci-widget/oci-widget.component';
// import { PublicCloudWidgetComponent } from '../app-home/infra-as-a-service/public-cloud/public-cloud-widget/public-cloud-widget.component';
// import { PublicCloudComponent } from '../app-home/infra-as-a-service/public-cloud/public-cloud.component';
// import { MaintenanceComponent } from '../app-home/maintenance/maintenance.component';
import { AppDefaultDashboardsComponent } from './app-default-dashboards/app-default-dashboards.component';
import { CloudCostOverviewDashboardComponent } from './app-default-dashboards/cloud-cost-overview-dashboard/cloud-cost-overview-dashboard.component';
import { ResourceLevelDashboardComponent } from './app-default-dashboards/cloud-cost-overview-dashboard/resource-level-dashboard/resource-level-dashboard.component';
import { OrchestrationOverviewDashboardComponent } from './app-default-dashboards/orchestration-overview-dashboard/orchestration-overview-dashboard.component';
import { AppPersonaDashboardComponent } from './app-persona-dashboard/app-persona-dashboard.component';
import { InfrastructureOverviewDashboardComponent } from './app-default-dashboards/infrastructure-overview-dashboard/infrastructure-overview-dashboard.component';
import { IotDevicesSummaryDashboardComponent } from './app-default-dashboards/iot-devices-summary-dashboard/iot-devices-summary-dashboard.component';
import { NetworkDevicesOverviewDashboardComponent } from './app-default-dashboards/network-devices-overview-dashboard/network-devices-overview-dashboard.component';
import { InterfaceDetailsDashboardComponent } from './app-default-dashboards/interface-details-dashboard/interface-details-dashboard.component';
import { ApplicationOverviewDashboardComponent } from './app-default-dashboards/application-overview-dashboard/application-overview-dashboard.component';
import { ConversionSalesFunnelKpisWidgetComponent } from './app-default-dashboards/application-overview-dashboard/conversion-sales-funnel-kpis-widget/conversion-sales-funnel-kpis-widget.component';
import { CustomerBehaviorInsightsKpisWidgetComponent } from './app-default-dashboards/application-overview-dashboard/customer-behavior-insights-kpis-widget/customer-behavior-insights-kpis-widget.component';
import { TrafficEngagementKpisWidgetComponent } from './app-default-dashboards/application-overview-dashboard/traffic-engagement-kpis-widget/traffic-engagement-kpis-widget.component';
import { PerformanceReliabilityKpisWidgetComponent } from './app-default-dashboards/application-overview-dashboard/performance-reliability-kpis-widget/performance-reliability-kpis-widget.component';
import { RevenueCustomerValueKpisWidgetComponent } from './app-default-dashboards/application-overview-dashboard/revenue-customer-value-kpis-widget/revenue-customer-value-kpis-widget.component';
import { OperationalAnomalyDetectionKpisWidgetComponent } from './app-default-dashboards/application-overview-dashboard/operational-anomaly-detection-kpis-widget/operational-anomaly-detection-kpis-widget.component';
import { ServicesOverviewWidgetComponent } from './app-default-dashboards/application-overview-dashboard/services-overview-widget/services-overview-widget.component';
import { ComponentsOverviewWidgetComponent } from './app-default-dashboards/application-overview-dashboard/components-overview-widget/components-overview-widget.component';
import { ProcessOverviewWidgetComponent } from './app-default-dashboards/application-overview-dashboard/process-overview-widget/process-overview-widget.component';
import { DataMessagingServicesOverviewWidgetComponent } from './app-default-dashboards/application-overview-dashboard/data-messaging-services-overview-widget/data-messaging-services-overview-widget.component';
import { HostOverviewWidgetComponent } from './app-default-dashboards/application-overview-dashboard/host-overview-widget/host-overview-widget.component';
import { PhysicalCloudInfrstructureOverviewWidgetComponent } from './app-default-dashboards/application-overview-dashboard/physical-cloud-infrstructure-overview-widget/physical-cloud-infrstructure-overview-widget.component';
import { CriticalAlertsWidgetComponent } from './app-default-dashboards/application-overview-dashboard/critical-alerts-widget/critical-alerts-widget.component';
import { PrivateCloudWidgetClustersComponent } from '../app-home/infra-as-a-service/private-cloud/private-cloud-widget-clusters/private-cloud-widget-clusters.component';
import { PrivateCloudWidgetComponent } from '../app-home/infra-as-a-service/private-cloud/private-cloud-widget/private-cloud-widget.component';
import { PrivateCloudComponent } from '../app-home/infra-as-a-service/private-cloud/private-cloud.component';
import { AppHomeModule } from '../app-home/app-home.module';
import { AdcPreviewComponent } from './app-dashboard-crud/adc-preview/adc-preview.component';
import { EasyTradeApplicationDashboardComponent } from './app-default-dashboards/application-overview-dashboard/easy-trade-application-dashboard/easy-trade-application-dashboard.component';
import { ExecutiveAiBusinessSummaryComponent } from './app-default-dashboards/application-overview-dashboard/executive-ai-business-summary/executive-ai-business-summary.component';
// import { DashboardMapWidgetComponent } from '../app-home/dashboard-map-widget/dashboard-map-widget.component';

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
    AppDashboardComponent,
    AppGlobalDashboardComponent,
    AppPersonaDashboardComponent,
    AppDashboardListComponent,
    AppDashboardCrudComponent,
    AppDashboardViewComponent,
    AppDefaultDashboardsComponent,
    CloudCostOverviewDashboardComponent,
    OrchestrationOverviewDashboardComponent,
    ResourceLevelDashboardComponent,
    InfrastructureOverviewDashboardComponent,
    IotDevicesSummaryDashboardComponent,
    NetworkDevicesOverviewDashboardComponent,
    InterfaceDetailsDashboardComponent,
    ApplicationOverviewDashboardComponent,
    ConversionSalesFunnelKpisWidgetComponent,
    CustomerBehaviorInsightsKpisWidgetComponent,
    TrafficEngagementKpisWidgetComponent,
    PerformanceReliabilityKpisWidgetComponent,
    RevenueCustomerValueKpisWidgetComponent,
    OperationalAnomalyDetectionKpisWidgetComponent,
    ServicesOverviewWidgetComponent,
    ComponentsOverviewWidgetComponent,
    ProcessOverviewWidgetComponent,
    DataMessagingServicesOverviewWidgetComponent,
    HostOverviewWidgetComponent,
    PhysicalCloudInfrstructureOverviewWidgetComponent,
    CriticalAlertsWidgetComponent,
    AdcPreviewComponent,
    EasyTradeApplicationDashboardComponent,
    ExecutiveAiBusinessSummaryComponent
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    AppDashboardRoutingModule,
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
    MarkdownModule,
    AppHomeModule
    // PrivateCloudComponent,
    // PrivateCloudWidgetClustersComponent,
    // PrivateCloudWidgetComponent
  ],
  exports: [
    // PrivateCloudComponent,
    // PrivateCloudWidgetClustersComponent,
    // PrivateCloudWidgetComponent
  ],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
    CurrencyPipe
  ]
})
export class AppDashboardModule { }
