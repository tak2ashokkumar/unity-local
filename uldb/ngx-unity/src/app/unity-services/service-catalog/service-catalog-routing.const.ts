import { Routes } from "@angular/router";
import { ServiceCatalogComponent } from "./service-catalog.component";
import { SERVICE_CATALOG_PROVISIONING_ROUTES } from "./service-catalog-provisioning/service-catalog-provisioning-routing.const";
import { SERVICE_CATALOG_ORDERS_ROUTES } from "./service-catalog-orders/service-catalog-orders-routing.const";

export const CATALOG_ROUTES: Routes = [
    {
        path: 'service-catalog',
        component: ServiceCatalogComponent,
        data: {
            breadcrumb: {
                title: 'ServiceCatalog',
            },
        },
        children: [
            ...SERVICE_CATALOG_PROVISIONING_ROUTES,
            ...SERVICE_CATALOG_ORDERS_ROUTES
        ]
    },
]