import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DcCostAnalysisSummaryComponent } from './dc-cost-analysis/dc-cost-analysis-summary/dc-cost-analysis-summary.component';
import { DcCostAnalysisCostPlannerComponent } from './dc-cost-analysis/dc-cost-analysis-cost-planner/dc-cost-analysis-cost-planner.component';
import { DcCostAnalysisCostPlannerCrudComponent } from './dc-cost-analysis/dc-cost-analysis-cost-planner/dc-cost-analysis-cost-planner-crud/dc-cost-analysis-cost-planner-crud.component';
import { CostSummaryComponent } from './cost-summary/cost-summary.component';
import { CostSummaryResourceLevelComponent } from './cost-summary/cost-summary-resource-level/cost-summary-resource-level.component';
import { CostIntelligenceComponent } from './cost-intelligence/cost-intelligence.component';

const routes: Routes = [
  {
    path: 'datacenter/summary',
    component: DcCostAnalysisSummaryComponent,
    data: {
      breadcrumb: {
        title: 'Datacenter Summary',
        stepbackCount: 0
      }
    },
  },
  {
    path: 'datacenter/cost-planners',
    component: DcCostAnalysisCostPlannerComponent,
    data: {
      breadcrumb: {
        title: 'Datacenter Cost Planners',
        stepbackCount: 0
      }
    },
  },
  {
    path: 'datacenter/cost-planner',
    component: DcCostAnalysisCostPlannerCrudComponent,
    data: {
      breadcrumb: {
        title: 'Add Cost Planner',
        stepbackCount: 0
      }
    },
  },
  {
    path: 'datacenter/cost-planner/:pId',
    component: DcCostAnalysisCostPlannerCrudComponent,
    data: {
      breadcrumb: {
        title: 'Edit Cost Planner',
        stepbackCount: 0
      }
    },
  },
  {
    path: 'cost-summary',
    component: CostSummaryComponent,
    data: {
      breadcrumb: {
        title: 'Cloud Overview',
        stepbackCount: 0
      }
    },
  },
  {
    path: 'cost-summary/resource-level',
    component: CostSummaryResourceLevelComponent,
    data: {
      breadcrumb: {
        title: 'Resource Level',
        stepbackCount: 0
      }
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnityCostAnalysisRoutingModule { }
