import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AppDashboardComponent } from "./app-dashboard.component";
import { AppGlobalDashboardComponent } from "./app-global-dashboard/app-global-dashboard.component";
import { AppPersonaDashboardComponent } from "./app-persona-dashboard/app-persona-dashboard.component";
import { AppDashboardCrudComponent } from "./app-dashboard-crud/app-dashboard-crud.component";
import { AppDashboardListComponent } from "./app-dashboard-list/app-dashboard-list.component";
import { AppDefaultDashboardsComponent } from "./app-default-dashboards/app-default-dashboards.component";
import { DEFAULT_DASHBOARD_ROUTES } from "./app-default-dashboards/app-default-dashboards-routing.const";

const routes: Routes = [
    {
        path: '',
        component: AppDashboardComponent,
        data: {
            breadcrumb: {
                title: ''
            }
        },
        children: [
            {
                path: 'default',
                data: {
                    breadcrumb: {
                        title: 'Default'
                    }
                },
                component: AppDefaultDashboardsComponent,
            },
            ...DEFAULT_DASHBOARD_ROUTES,
            {
                path: 'global',
                data: {
                    breadcrumb: {
                        title: 'Global Dashboard'
                    }
                },
                component: AppGlobalDashboardComponent
            },
            {
                path: 'my-dashboard',
                data: {
                    breadcrumb: {
                        title: 'My Dashboard'
                    }
                },
                component: AppPersonaDashboardComponent
            },
            {
                path: 'my-dashboard/create',
                component: AppDashboardCrudComponent,
                data: {
                    breadcrumb: {
                        title: 'Create',
                        stepbackCount: 1
                    }
                },
            },
            {
                path: 'my-dashboard/:id/edit',
                component: AppDashboardCrudComponent,
                data: {
                    breadcrumb: {
                        title: 'Create',
                        stepbackCount: 1
                    }
                },
            },
            {
                path: 'my-dashboard/list',
                component: AppDashboardListComponent,
                data: {
                    breadcrumb: {
                        title: 'List',
                        stepbackCount: 1
                    }
                },
            },
            {
                path: 'my-dashboard/list/create',
                component: AppDashboardCrudComponent,
                data: {
                    breadcrumb: {
                        title: 'List',
                        stepbackCount: 1
                    }
                },
            },
            {
                path: 'my-dashboard/list/:id/edit',
                component: AppDashboardCrudComponent,
                data: {
                    breadcrumb: {
                        title: 'Edit',
                        stepbackCount: 2
                    }
                },
            },
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AppDashboardRoutingModule { }