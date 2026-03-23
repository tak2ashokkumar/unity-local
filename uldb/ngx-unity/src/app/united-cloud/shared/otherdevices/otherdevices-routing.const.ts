import { Routes } from "@angular/router"
import { ZABBIX_OTHER_DEVICE_ROUTES } from "./otherdevices-zabbix/otherdevices-zabbix-routing.const"
import { OtherdevicesZabbixComponent } from "./otherdevices-zabbix/otherdevices-zabbix.component"
import { OtherdevicesComponent } from "./otherdevices.component"
import { OtherdevicesCrudComponent } from "./otherdevices-crud/otherdevices-crud.component"

/**
 * THIS SECTION IS RELATED TO PRIVATE CLOUD ROUTES
 */
export const OTHER_DEVICE_ROUTES: Routes = [
    {
        path: 'otherdevices',
        component: OtherdevicesComponent,
        data: {
            breadcrumb: {
                title: 'Other Devices',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'otherdevices/create',
        component: OtherdevicesCrudComponent,
        data: {
            breadcrumb: {
                title: 'Add',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'otherdevices/:deviceid/edit',
        component: OtherdevicesCrudComponent,
        data: {
            breadcrumb: {
                title: 'Edit',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'otherdevices/:deviceid/zbx',
        component: OtherdevicesZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Other Devices',
                stepbackCount: 2
            }
        },
        children: ZABBIX_OTHER_DEVICE_ROUTES
    }
]