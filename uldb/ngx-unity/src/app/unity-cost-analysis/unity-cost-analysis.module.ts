import { NgModule } from '@angular/core';
import { AppCoreModule } from '../app-core/app-core.module';

import { UnityCostAnalysisRoutingModule } from './unity-cost-analysis-routing.module';
import { CostCalculatorModule } from './cost-calculator/cost-calculator.module';
import { SharedModule } from '../shared/shared.module';
import { PublicCloudCostAnalysisModule } from './public-cloud-cost-analysis/public-cloud-cost-analysis.module';
import { DatacenterCostAnalysisModule } from './datacenter-cost-analysis/datacenter-cost-analysis.module';
import { DcCostAnalysisSummaryComponent } from './dc-cost-analysis/dc-cost-analysis-summary/dc-cost-analysis-summary.component';
import { DcCostAnalysisCostPlannerComponent } from './dc-cost-analysis/dc-cost-analysis-cost-planner/dc-cost-analysis-cost-planner.component';
import { DcCostAnalysisCostPlannerCrudComponent } from './dc-cost-analysis/dc-cost-analysis-cost-planner/dc-cost-analysis-cost-planner-crud/dc-cost-analysis-cost-planner-crud.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ChartsModule } from 'ng2-charts';
import { CostSummaryComponent } from './cost-summary/cost-summary.component';
import { CommonModule } from '@angular/common';
import { EchartsxModule } from 'echarts-for-angular';
import { CostSummaryResourceLevelComponent } from './cost-summary/cost-summary-resource-level/cost-summary-resource-level.component';
import { CostIntelligenceModule } from './cost-intelligence/cost-intelligence.module';

@NgModule({
  declarations: [
    DcCostAnalysisSummaryComponent,
    DcCostAnalysisCostPlannerComponent,
    DcCostAnalysisCostPlannerCrudComponent,
    CostSummaryComponent,
    CostSummaryResourceLevelComponent
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    UnityCostAnalysisRoutingModule,
    CostCalculatorModule,
    PublicCloudCostAnalysisModule,
    DatacenterCostAnalysisModule,
    CommonModule,
    CollapseModule.forRoot(),
    ChartsModule,
    EchartsxModule,
    CostIntelligenceModule
  ]
})
export class UnityCostAnalysisModule { }
