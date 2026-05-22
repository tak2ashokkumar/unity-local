import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnityBusinessServicesComponent } from './unity-business-services.component';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { UnityBusinessServicesCrudComponent } from './unity-business-services-crud/unity-business-services-crud.component';
import { UnityBusinessServicesRoutingModule } from './unity-business-services-routing.module';
import { UnityBusinessServicesTabsComponent } from './unity-business-services-tabs/unity-business-services-tabs.component';
import { ServiceTopologyComponent } from './unity-business-services-tabs/service-topology/service-topology.component';
import { AppCommonTopologyComponent } from './unity-business-services-tabs/service-topology/app-common-topology/app-common-topology.component';
import { BusinessServiceSummaryComponent } from './unity-business-services-tabs/business-service-summary/business-service-summary.component';
import { BusinessServiceCostInsightsComponent } from './unity-business-services-tabs/business-service-cost-insights/business-service-cost-insights.component';
import { EchartsxModule } from 'echarts-for-angular';
import { ChartsModule } from 'ng2-charts';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { UnitedCloudSharedModule } from '../shared/united-cloud-shared.module';
import { UnitedViewModule } from 'src/app/united-view/united-view.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AppHomeModule } from 'src/app/app-home/app-home.module';



@NgModule({
  declarations: [
    UnityBusinessServicesComponent,
    UnityBusinessServicesCrudComponent,
    ServiceTopologyComponent,
    AppCommonTopologyComponent,
    UnityBusinessServicesTabsComponent,
    BusinessServiceSummaryComponent,
    BusinessServiceCostInsightsComponent
  ],
  imports: [
    CommonModule,
    UnityBusinessServicesRoutingModule,
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
export class UnityBusinessServicesModule { }
