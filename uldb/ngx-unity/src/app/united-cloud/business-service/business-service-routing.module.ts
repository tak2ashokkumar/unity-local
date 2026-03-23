import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BusinessServicesComponent } from "./business-services/business-services.component";
import { BusinessServicesCrudComponent } from "./business-services/business-services-crud/business-services-crud.component";
import { ServiceTopologyComponent } from "./business-services/business-service-tabs/service-topology/service-topology.component";
import { BusinessServiceTabsComponent } from "./business-services/business-service-tabs/business-service-tabs.component";
import { BusinessServiceSummaryComponent } from "./business-services/business-service-tabs/business-service-summary/business-service-summary.component";
import { BusinessServiceCostInsightsComponent } from "./business-services/business-service-tabs/business-service-cost-insights/business-service-cost-insights.component";
// import { ServiceTopologyComponent } from "./business-services/service-topology/service-topology.component";

const routes: Routes = [
    {
        path: 'business-service',
        component: BusinessServicesComponent,
        data: {
            breadcrumb: {
                title: 'Business Services',
                stepbackCount: 0
            }
        },
    },
    {
        path: 'business-service/create',
        component: BusinessServicesCrudComponent,
        data: {
            breadcrumb: {
                title: 'Create Business Service',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'business-service/:serviceId/edit',
        component: BusinessServicesCrudComponent,
        data: {
            breadcrumb: {
                title: 'Update Business Service',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'business-service/:businessId',
        component: BusinessServiceTabsComponent,
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
export class BusinessServiceRoutingModule { }