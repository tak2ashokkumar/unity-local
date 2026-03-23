import { Routes } from "@angular/router";
import { AppDashboardListComponent } from "./app-dashboard-list/app-dashboard-list.component";
import { AppDashboardCrudComponent } from "./app-dashboard-crud/app-dashboard-crud.component";
import { AppDashboardComponent } from "./app-dashboard.component";

export const APP_DASHBOARD_ROUTES: Routes = [
    {
        path: 'app-dashboard',
        component: AppDashboardComponent,
    },
    {
        path: 'app-dashboard/create',
        component: AppDashboardCrudComponent,
        data: {
            breadcrumb: {
                title: 'Create',
                stepbackCount: 1
            }
        },
    },
    {
        path: 'app-dashboard/:id/edit',
        component: AppDashboardCrudComponent,
        data: {
            breadcrumb: {
                title: 'Create',
                stepbackCount: 1
            }
        },
    },
    {
        path: 'app-dashboard/list',
        component: AppDashboardListComponent,
        data: {
            breadcrumb: {
                title: 'List',
                stepbackCount: 1
            }
        },
    },
    {
        path: 'app-dashboard/list/create',
        component: AppDashboardCrudComponent,
        data: {
            breadcrumb: {
                title: 'List',
                stepbackCount: 1
            }
        },
    },
    {
        path: 'app-dashboard/list/:id/edit',
        component: AppDashboardCrudComponent,
        data: {
            breadcrumb: {
                title: 'Edit',
                stepbackCount: 2
            }
        },
    },
]