import { Routes } from "@angular/router";
import { ServiceCatalogProvisioningComponent } from "./service-catalog-provisioning.component";
import { ServiceCatalogProvisioningCrudComponent } from "./service-catalog-provisioning-crud/service-catalog-provisioning-crud.component";
import { ServiceCatalogProvisioningOrdersCrudComponent } from "./service-catalog-provisioning-orders-crud/service-catalog-provisioning-orders-crud.component";

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
]