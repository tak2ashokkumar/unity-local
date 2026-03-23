import { UsincViptelaCrudComponent } from "src/app/unity-setup/unity-setup-integration/usi-network-controllers/usinc-viptela/usinc-viptela-crud/usinc-viptela-crud.component";
import { NetworkControllersComponent } from "./network-controllers.component";
import { NetworkControllersZabbixComponent } from "./network-controllers-zabbix/network-controllers-zabbix.component";
import { ZABBIX_NETWORK_CONTROLLER_ROUTES } from "./network-controllers-zabbix/network-controllers-zabbix.routing";
import { NetworkControllersViptelaComponentsComponent } from "./network-controllers-viptela-components/network-controllers-viptela-components.component";
import { ZABBIX_VIPTELA_DEVICE_ROUTES } from "./network-controllers-viptela-components/network-controllers-viptela-component-zabbix/network-controllers-viptela-component-zabbix.routing";
import { NetworkControllersViptelaComponentZabbixComponent } from "./network-controllers-viptela-components/network-controllers-viptela-component-zabbix/network-controllers-viptela-component-zabbix.component";
import { UsincCiscoMerakiCrudComponent } from "src/app/unity-setup/unity-setup-integration/usi-network-controllers/usinc-cisco-meraki/usinc-cisco-meraki-crud/usinc-cisco-meraki-crud.component";
import { Routes } from "@angular/router";
import { NetworkControllersCiscoMerakiDevicesComponent } from "./network-controllers-cisco-meraki/network-controllers-cisco-meraki-devices/network-controllers-cisco-meraki-devices.component";
import { NetworkControllersCiscoMerakiOrganizationsComponent } from "./network-controllers-cisco-meraki/network-controllers-cisco-meraki-organizations/network-controllers-cisco-meraki-organizations.component";
import { ZABBIX_CISCO_MERAKI_ORGANIZATION_ROUTES } from "./network-controllers-cisco-meraki/network-controllers-cisco-meraki-organizations/network-controllers-cisco-meraki-organizations-zabbix/network-controllers-cisco-meraki-organizations-zabbix-routing.const";
import { NetworkControllersCiscoMerakiOrganizationsZabbixComponent } from "./network-controllers-cisco-meraki/network-controllers-cisco-meraki-organizations/network-controllers-cisco-meraki-organizations-zabbix/network-controllers-cisco-meraki-organizations-zabbix.component";
import { NetworkControllersCiscoMerakiDevicesZabbixComponent } from "./network-controllers-cisco-meraki/network-controllers-cisco-meraki-devices/network-controllers-cisco-meraki-devices-zabbix/network-controllers-cisco-meraki-devices-zabbix.component";
import { ZABBIX_CISCO_MERAKI_DEVICE_ROUTES } from "./network-controllers-cisco-meraki/network-controllers-cisco-meraki-devices/network-controllers-cisco-meraki-devices-zabbix/network-controllers-cisco-meraki-devices-zabbix.routing";

export const NETWORK_CONTROLLER_ROUTES: Routes = [
    {
        path: 'network-controllers',
        component: NetworkControllersComponent,
        data: {
            breadcrumb: {
                title: 'SD-WANs',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'network-controllers/:controllerId/viptela-components',
        component: NetworkControllersViptelaComponentsComponent,
        data: {
            breadcrumb: {
                title: 'Viptela Devices',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'network-controllers/:controllerId/viptela-components/:deviceid/zbx',
        component: NetworkControllersViptelaComponentZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Viptela Device',
                stepbackCount: 0
            }
        },
        children: ZABBIX_VIPTELA_DEVICE_ROUTES
    },
    {
        path: 'network-controllers/:viptelaId/viptela-edit',
        component: UsincViptelaCrudComponent,
        data: {
            breadcrumb: {
                title: 'Edit',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'network-controllers/:merakiId/meraki-edit',
        component: UsincCiscoMerakiCrudComponent,
        data: {
            breadcrumb: {
                title: 'Edit',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'network-controllers/:deviceid/zbx',
        component: NetworkControllersZabbixComponent,
        data: {
            breadcrumb: {
                title: 'SD-WAN',
                stepbackCount: 1
            }
        },
        children: ZABBIX_NETWORK_CONTROLLER_ROUTES
    },
    {
        path: 'network-controllers/cisco-meraki/:controllerId/organizations',
        component: NetworkControllersCiscoMerakiOrganizationsComponent,
        data: {
            breadcrumb: {
                title: 'Meraki Organizations',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'network-controllers/cisco-meraki/:controllerId/organizations/:deviceid/zbx',
        component: NetworkControllersCiscoMerakiOrganizationsZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Meraki Organization',
                stepbackCount: 0
            }
        },
        children: ZABBIX_CISCO_MERAKI_ORGANIZATION_ROUTES
    },
    {
        path: 'network-controllers/cisco-meraki/:controllerId/organizations/:organizationId/devices',
        component: NetworkControllersCiscoMerakiDevicesComponent,
        data: {
            breadcrumb: {
                title: 'Meraki Devices',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'network-controllers/cisco-meraki/:controllerId/organizations/:organizationId/devices/:deviceid/zbx',
        component: NetworkControllersCiscoMerakiDevicesZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Meraki Device',
                stepbackCount: 1
            }
        },
        children: ZABBIX_CISCO_MERAKI_DEVICE_ROUTES
    }
]