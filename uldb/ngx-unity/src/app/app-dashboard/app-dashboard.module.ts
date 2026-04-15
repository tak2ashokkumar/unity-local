import { DragDropModule } from '@angular/cdk/drag-drop';
import { CurrencyPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
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
import { AppHomeModule } from '../app-home/app-home.module';
import { SharedModule } from '../shared/shared.module';
import { AdcPreviewComponent } from './app-dashboard-crud/adc-preview/adc-preview.component';
import { AppDashboardCrudComponent } from './app-dashboard-crud/app-dashboard-crud.component';
import { AppDashboardListComponent } from './app-dashboard-list/app-dashboard-list.component';
import { AppDashboardRoutingModule } from './app-dashboard-routing.module';
import { AppDashboardViewComponent } from './app-dashboard-view/app-dashboard-view.component';
import { AppDashboardComponent } from './app-dashboard.component';
import { AppDefaultDashboardsComponent } from './app-default-dashboards/app-default-dashboards.component';
import { ApplicationOverviewDashboardComponent } from './app-default-dashboards/application-overview-dashboard/application-overview-dashboard.component';
import { AstronomyShopApplicationDashboardComponent } from './app-default-dashboards/application-overview-dashboard/astronomy-shop-application-dashboard/astronomy-shop-application-dashboard.component';
import { EasyTradeApplicationDashboardComponent } from './app-default-dashboards/application-overview-dashboard/easy-trade-application-dashboard/easy-trade-application-dashboard.component';
import { ExecutiveAiBusinessSummaryComponent } from './app-default-dashboards/application-overview-dashboard/executive-ai-business-summary/executive-ai-business-summary.component';
import { CloudCostOverviewDashboardComponent } from './app-default-dashboards/cloud-cost-overview-dashboard/cloud-cost-overview-dashboard.component';
import { ResourceLevelDashboardComponent } from './app-default-dashboards/cloud-cost-overview-dashboard/resource-level-dashboard/resource-level-dashboard.component';
import { InfrastructureOverviewDashboardComponent } from './app-default-dashboards/infrastructure-overview-dashboard/infrastructure-overview-dashboard.component';
import { InterfaceDetailsDashboardComponent } from './app-default-dashboards/interface-details-dashboard/interface-details-dashboard.component';
import { IotDevicesSummaryDashboardComponent } from './app-default-dashboards/iot-devices-summary-dashboard/iot-devices-summary-dashboard.component';
import { NetworkDevicesOverviewDashboardComponent } from './app-default-dashboards/network-devices-overview-dashboard/network-devices-overview-dashboard.component';
import { OrchestrationOverviewDashboardComponent } from './app-default-dashboards/orchestration-overview-dashboard/orchestration-overview-dashboard.component';
import { AppPersonaDashboardComponent } from './app-persona-dashboard/app-persona-dashboard.component';
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
    AdcPreviewComponent,
    AstronomyShopApplicationDashboardComponent,
    EasyTradeApplicationDashboardComponent,
    ExecutiveAiBusinessSummaryComponent,
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
  ],
  exports: [],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
    CurrencyPipe
  ]
})
export class AppDashboardModule { }
