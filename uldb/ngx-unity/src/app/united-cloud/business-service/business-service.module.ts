import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessServicesComponent } from './business-services/business-services.component';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { BusinessServicesCrudComponent } from './business-services/business-services-crud/business-services-crud.component';
import { BusinessServiceRoutingModule } from './business-service-routing.module';
import { BusinessServiceTabsComponent } from './business-services/business-service-tabs/business-service-tabs.component';
import { ServiceTopologyComponent } from './business-services/business-service-tabs/service-topology/service-topology.component';
import { AppCommonTopologyComponent } from './business-services/business-service-tabs/service-topology/app-common-topology/app-common-topology.component';
import { BusinessServiceSummaryComponent } from './business-services/business-service-tabs/business-service-summary/business-service-summary.component';
import { BusinessServiceCostInsightsComponent } from './business-services/business-service-tabs/business-service-cost-insights/business-service-cost-insights.component';
import { EchartsxModule } from 'echarts-for-angular';
import { ChartsModule } from 'ng2-charts';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { UnitedCloudSharedModule } from '../shared/united-cloud-shared.module';
import { UnitedViewModule } from 'src/app/united-view/united-view.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AppHomeModule } from 'src/app/app-home/app-home.module';



@NgModule({
  declarations: [
    BusinessServicesComponent,
    BusinessServicesCrudComponent,
    ServiceTopologyComponent,
    AppCommonTopologyComponent,
    BusinessServiceTabsComponent,
    BusinessServiceSummaryComponent,
    BusinessServiceCostInsightsComponent
  ],
  imports: [
    CommonModule,
    BusinessServiceRoutingModule,
    AppCoreModule,
    SharedModule,
    EchartsxModule,
    ChartsModule,
    NgxGraphModule,
    PerfectScrollbarModule,
    UnitedCloudSharedModule,
    AppHomeModule,
    PerfectScrollbarModule,
    NgSelectModule
  ]
})
export class BusinessServiceModule { }
