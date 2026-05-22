import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { UnityBusinessServicesComponent } from "./unity-business-services.component";
import { UnityBusinessServicesCrudComponent } from "./unity-business-services-crud/unity-business-services-crud.component";
import { ServiceTopologyComponent } from "./unity-business-services-tabs/service-topology/service-topology.component";
import { UnityBusinessServicesTabsComponent } from "./unity-business-services-tabs/unity-business-services-tabs.component";
import { BusinessServiceSummaryComponent } from "./unity-business-services-tabs/business-service-summary/business-service-summary.component";
import { BusinessServiceCostInsightsComponent } from "./unity-business-services-tabs/business-service-cost-insights/business-service-cost-insights.component";
import { UnityBusinessServicesManageGuard } from "./unity-business-services-manage.guard";

const routes: Routes = [
    {
        path: 'business-service',
        component: UnityBusinessServicesComponent,
        data: {
            breadcrumb: {
                title: 'Business Services',
                stepbackCount: 0
            }
        },
    },
    {
        path: 'business-service/create',
        component: UnityBusinessServicesCrudComponent,
        canActivate: [UnityBusinessServicesManageGuard],
        data: {
            breadcrumb: {
                title: 'Create Business Service',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'business-service/:serviceId/edit',
        component: UnityBusinessServicesCrudComponent,
        canActivate: [UnityBusinessServicesManageGuard],
        data: {
            breadcrumb: {
                title: 'Update Business Service',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'business-service/:businessId',
        component: UnityBusinessServicesTabsComponent,
        data: {
            breadcrumb: {
                title: 'Business Service',
                stepbackCount: 0
            }
        },
        children:[
            {
                path: 'summary',
                component: BusinessServiceSummaryComponent,
                data: {
                    breadcrumb: {
                        title: 'Summary',
                        stepbackCount: 0
                    }
                },
            },
            {
                path: 'topology',
                component: ServiceTopologyComponent,
                data: {
                    breadcrumb: {
                        title: 'Topology',
                        stepbackCount: 0
                    }
                },
            },
            {
                path: 'cost-insights',
                component: BusinessServiceCostInsightsComponent,
                data: {
                    breadcrumb: {
                        title: 'Cost Insights',
                        stepbackCount: 0
                    }
                },
            },
        ]
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UnityBusinessServicesRoutingModule { }
