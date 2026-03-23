import { Routes } from "@angular/router";
import { ServiceCatalogOrdersComponent } from "./service-catalog-orders.component";

export const SERVICE_CATALOG_ORDERS_ROUTES: Routes = [
    {
        path: 'orders',
        component: ServiceCatalogOrdersComponent,
        data: {
            breadcrumb: {
                title: 'Orders',
                stepbackCount: 0
            }
        },
    },
    {
        path: ':catalogId/:catalogType',
        component: ServiceCatalogOrdersComponent,
        data: {
            breadcrumb: {
                title: 'Orders',
                stepbackCount: 0
            }
        },
    },
    {
        path: ':catalogId/:catalogType',
        component: ServiceCatalogOrdersComponent,
        data: {
            breadcrumb: {
                title: 'Orders',
                stepbackCount: 0
            }
        },
    },
]