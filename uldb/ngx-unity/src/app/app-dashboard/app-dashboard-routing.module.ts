import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AppDashboardCollectionsCrudComponent } from "./app-dashboard-collections/app-dashboard-collections-crud/app-dashboard-collections-crud.component";
import { AppCollectionDashboardViewComponent } from "./app-dashboard-collections/app-dashboard-collections-view/app-collection-dashboard-view/app-collection-dashboard-view.component";
import { AppDashboardCollectionsViewComponent } from "./app-dashboard-collections/app-dashboard-collections-view/app-dashboard-collections-view.component";
import { AppDashboardCollectionsComponent } from "./app-dashboard-collections/app-dashboard-collections.component";
import { AppDashboardComponent } from "./app-dashboard.component";
import { DEFAULT_DASHBOARD_ROUTES } from "./app-default-dashboards/app-default-dashboards-routing.const";
import { AppDefaultDashboardsComponent } from "./app-default-dashboards/app-default-dashboards.component";
import { AppPersonaDashboardCrudComponent } from "./app-persona-dashboards/app-persona-dashboard-crud/app-persona-dashboard-crud.component";
import { AppPersonaDashboardViewComponent } from "./app-persona-dashboards/app-persona-dashboard-view/app-persona-dashboard-view.component";
import { AppPersonaDashboardsComponent } from "./app-persona-dashboards/app-persona-dashboards.component";

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
                path: 'collections',
                data: {
                    breadcrumb: {
                        title: 'Curated Collection'
                    }
                },
                component: AppDashboardCollectionsComponent,
            },
            {
                path: 'collections/create',
                component: AppDashboardCollectionsCrudComponent,
                data: {
                    breadcrumb: {
                        title: 'Create Collection',
                        stepbackCount: 1
                    }
                }
            },
            {
                path: 'collections/:collectionId/update',
                component: AppDashboardCollectionsCrudComponent,
                data: {
                    breadcrumb: {
                        title: 'Edit Collection',
                        stepbackCount: 1
                    }
                }
            },
            {
                path: 'collections/:collectionId',
                component: AppDashboardCollectionsViewComponent,
                data: {
                    breadcrumb: {
                        title: 'View Collection',
                        stepbackCount: 1
                    }
                }
            },
            {
                path: 'collections/:collectionId/dashboard/:dashboardId',
                component: AppCollectionDashboardViewComponent,
                data: {
                    breadcrumb: {
                        title: 'Collection Dashboard',
                        stepbackCount: 1
                    }
                }
            },
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
                path: 'my-dashboards',
                component: AppPersonaDashboardsComponent,
                data: {
                    breadcrumb: {
                        title: 'My Dashboards'
                    }
                },
            },
            {
                path: 'my-dashboards/create',
                component: AppPersonaDashboardCrudComponent,
                data: {
                    breadcrumb: {
                        title: 'Create',
                        stepbackCount: 1
                    }
                },
            },
            {
                path: 'my-dashboards/:id/edit',
                component: AppPersonaDashboardCrudComponent,
                data: {
                    breadcrumb: {
                        title: 'Edit',
                        stepbackCount: 1
                    }
                },
            },
            {
                path: 'my-dashboards/:id',
                component: AppPersonaDashboardViewComponent,
                data: {
                    breadcrumb: {
                        title: 'My Dashboard',
                        stepbackCount: 1
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
