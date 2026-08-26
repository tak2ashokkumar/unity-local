import { Routes } from "@angular/router";
import { ServiceCatalogProvisioningComponent } from "./service-catalog-provisioning.component";
import { ServiceCatalogProvisioningCrudComponent } from "./service-catalog-provisioning-crud/service-catalog-provisioning-crud.component";
import { ServiceCatalogProvisioningOrdersCrudComponent } from "./service-catalog-provisioning-orders-crud/service-catalog-provisioning-orders-crud.component";
import { CatalogComponent } from "../../service-catalog-redesign/catalog/catalog.component";
import { CatalogCrudComponent } from "../../service-catalog-redesign/catalog/catalog-crud/catalog-crud.component";
import { CatalogCheckoutComponent } from "../../service-catalog-redesign/catalog/catalog-checkout/catalog-checkout.component";
import { OrdersComponent } from "../../service-catalog-redesign/orders/orders.component";

export const SERVICE_CATALOG_PROVISIONING_ROUTES: Routes = [
    {
        path: 'catalog',
        component: ServiceCatalogProvisioningComponent,
        data: {
            breadcrumb: {
                title: 'Catalog',
                stepbackCount: 0
            }
        },
    },
    {
        path: 'catalog/crud',
        component: ServiceCatalogProvisioningCrudComponent,
        data: {
            breadcrumb: {
                title: 'Catalog create',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'catalog/:catalogId/crud',
        component: ServiceCatalogProvisioningCrudComponent,
        data: {
            breadcrumb: {
                title: 'Catalog update',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'catalog/orders/:catalogId/crud',
        component: ServiceCatalogProvisioningOrdersCrudComponent,
        data: {
            breadcrumb: {
                title: 'New order',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'catalog/:catalogId/orders/:orderId/edit',
        component: ServiceCatalogProvisioningOrdersCrudComponent,
        data: {
            breadcrumb: {
                title: 'New order',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'redesign',
        redirectTo: 'redesign/catalog',
        pathMatch: 'full'
    },
    {
        path: 'redesign/catalog',
        component: CatalogComponent,
        data: {
            breadcrumb: {
                title: 'Catalogs',
            },
        },
    },
    {
        path: 'redesign/catalog/create',
        component: CatalogCrudComponent,
        data: {
            breadcrumb: {
                title: 'Catalog Create',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'redesign/orders',
        component: OrdersComponent,
        data: {
            breadcrumb: {
                title: 'Orders'
            }
        }
    },
    {
        path: 'redesign/catalog/:catalogId/update',
        component: CatalogCrudComponent,
        data: {
            breadcrumb: {
                title: 'Catalog Update',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'redesign/catalog/checkout',
        component: CatalogCheckoutComponent,
        data: {
            breadcrumb: {
                title: 'Checkout',
                stepbackCount: 0
            }
        }
    },
]

