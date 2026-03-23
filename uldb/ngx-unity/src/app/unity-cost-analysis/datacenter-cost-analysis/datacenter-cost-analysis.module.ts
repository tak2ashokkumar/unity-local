import { NgModule } from '@angular/core';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { SharedModule } from 'src/app/shared/shared.module';

import { DatacenterCostAnalysisRoutingModule } from './datacenter-cost-analysis-routing.module';
import { DatacenterCostAnalysisComponent } from './datacenter-cost-analysis.component';
import { ChartsModule } from 'ng2-charts';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { DatacenterCostSummaryComponent } from './datacenter-cost-summary/datacenter-cost-summary.component';
import { DatacenterBillDetailsComponent } from './datacenter-bill-details/datacenter-bill-details.component';
import { DatacenterBillCrudComponent } from './datacenter-bill-crud/datacenter-bill-crud.component';
import { DatacenterBillCrudService } from './datacenter-bill-crud/datacenter-bill-crud.service';
import { DatacenterBillDetailsService } from './datacenter-bill-details/datacenter-bill-details.service';

@NgModule({
  declarations: [DatacenterCostAnalysisComponent, DatacenterCostSummaryComponent, DatacenterBillDetailsComponent, DatacenterBillCrudComponent],
  imports: [
    AppCoreModule,
    SharedModule,
    DatacenterCostAnalysisRoutingModule,
    ChartsModule
  ],
  providers: [DatacenterBillCrudService, DatacenterBillDetailsService, CurrencyPipe, DatePipe]
})
export class DatacenterCostAnalysisModule { }
