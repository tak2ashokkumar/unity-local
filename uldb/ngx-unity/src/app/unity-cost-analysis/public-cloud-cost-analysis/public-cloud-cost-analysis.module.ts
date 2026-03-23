import { NgModule } from '@angular/core';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { SharedModule } from 'src/app/shared/shared.module';

import { PublicCloudCostAnalysisRoutingModule } from './public-cloud-cost-analysis-routing.module';
import { PublicCloudCostAnalysisComponent } from './public-cloud-cost-analysis.component';
import { ChartsModule } from 'ng2-charts';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AwsCostAnalysisComponent } from './aws-cost-analysis/aws-cost-analysis.component';
import { AzureCostAnalysisComponent } from './azure-cost-analysis/azure-cost-analysis.component';
import { GcpCostAnalysisComponent } from './gcp-cost-analysis/gcp-cost-analysis.component';
import { PublicCloudCostAnalysisSummaryComponent } from './public-cloud-cost-analysis-summary/public-cloud-cost-analysis-summary.component';
import { PublicCloudCostAnalysisChartsComponent } from './public-cloud-cost-analysis-charts/public-cloud-cost-analysis-charts.component';
import { OciCostAnalysisComponent } from './oci-cost-analysis/oci-cost-analysis.component';

@NgModule({
  declarations: [PublicCloudCostAnalysisComponent, AwsCostAnalysisComponent, AzureCostAnalysisComponent, GcpCostAnalysisComponent, PublicCloudCostAnalysisSummaryComponent, PublicCloudCostAnalysisChartsComponent, OciCostAnalysisComponent,],
  imports: [
    AppCoreModule,
    SharedModule,
    PublicCloudCostAnalysisRoutingModule,
    ChartsModule
  ],
  providers: [CurrencyPipe, DatePipe]
})
export class PublicCloudCostAnalysisModule { }
