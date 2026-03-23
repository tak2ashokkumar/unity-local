import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PublicCloudCostAnalysisComponent } from './public-cloud-cost-analysis.component';
import { PublicCloudCostAnalysisSummaryComponent } from './public-cloud-cost-analysis-summary/public-cloud-cost-analysis-summary.component';
import { AwsCostAnalysisComponent } from './aws-cost-analysis/aws-cost-analysis.component';
import { AzureCostAnalysisComponent } from './azure-cost-analysis/azure-cost-analysis.component';
import { GcpCostAnalysisComponent } from './gcp-cost-analysis/gcp-cost-analysis.component';
import { OciCostAnalysisComponent } from './oci-cost-analysis/oci-cost-analysis.component';

const routes: Routes = [
    {
        path: 'public-cloud',
        component: PublicCloudCostAnalysisComponent,
        data: {
            breadcrumb: {
                title: 'Public Cloud',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'summary',
                component: PublicCloudCostAnalysisSummaryComponent,
                data: {
                    breadcrumb: {
                        title: 'Summary',
                        stepbackCount: 1
                    }
                },
            },
            {
                path: 'aws',
                component: AwsCostAnalysisComponent,
                data: {
                    breadcrumb: {
                        title: 'AWS',
                        stepbackCount: 1
                    }
                },
            },
            {
                path: 'azure',
                component: AzureCostAnalysisComponent,
                data: {
                    breadcrumb: {
                        title: 'Azure',
                        stepbackCount: 1
                    }
                },
            },
            {
                path: 'gcp',
                component: GcpCostAnalysisComponent,
                data: {
                    breadcrumb: {
                        title: 'GCP',
                        stepbackCount: 1
                    }
                },
            },
            {
                path: 'oci',
                component: OciCostAnalysisComponent,
                data: {
                    breadcrumb: {
                        title: 'Oracle',
                        stepbackCount: 1
                    }
                },
            }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PublicCloudCostAnalysisRoutingModule { }
