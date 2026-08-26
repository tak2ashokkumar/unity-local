import { Routes } from "@angular/router";
import { ServiceCatalogComponent } from "./service-catalog.component";
import { SERVICE_CATALOG_PROVISIONING_ROUTES } from "./service-catalog-provisioning/service-catalog-provisioning-routing.const";
import { SERVICE_CATALOG_ORDERS_ROUTES } from "./service-catalog-orders/service-catalog-orders-routing.const";
import { OrdersComponent } from "../service-catalog-redesign/orders/orders.component";

export const CATALOG_ROUTES: Routes = [
    {
        path: 'service-catalog',
        component: ServiceCatalogComponent,
        data: {
            breadcrumb: {
                title: 'Service Catalog',
            },
        },
        children: [
            ...SERVICE_CATALOG_PROVISIONING_ROUTES,
            ...SERVICE_CATALOG_ORDERS_ROUTES
        ]
    },
    // {
    //     path: 'service-catalog/home',
    //     // component: ServiceCatalogComponent, // ad new home comp
    //     data: {
    //         breadcrumb: {
    //             title: 'ServiceCatalog',
    //         },
    //     },
    // },
    // {
    //     path: 'service-catalog/dashboard',
    //     // component: ServiceCatalogComponent, // ad new dashboard comp
    //     data: {
    //         breadcrumb: {
    //             title: 'ServiceCatalog',
    //         },
    //     },
    // },
    // {
    //     path: 'service-catalog/quick-catalog',
    //     // component: ServiceCatalogComponent, // ad new  comp
    //     data: {
    //         breadcrumb: {
    //             title: 'ServiceCatalog',
    //         },
    //     },
    // },
    // {
    //     path: 'service-catalog/redesign/orders',
    //     component: OrdersComponent, // ad new  comp
    //     data: {
    //         breadcrumb: {
    //             title: 'ServiceCatalog',
    //         },
    //     },
    // },
]
