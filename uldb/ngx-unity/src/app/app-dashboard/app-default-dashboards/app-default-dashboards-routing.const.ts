import { Routes } from "@angular/router";
import { ZABBIX_BMS_ROUTES } from "src/app/united-cloud/shared/bm-servers/bm-servers-zabbix/bm-servers-zabbix-routing.const";
import { BmServersZabbixComponent } from "src/app/united-cloud/shared/bm-servers/bm-servers-zabbix/bm-servers-zabbix.component";
import { ZABBIX_FIREWALLS_ROUTES } from "src/app/united-cloud/shared/firewalls/firewalls-zabbix/firewalls-zabbix-routing.const";
import { FirewallsZabbixComponent } from "src/app/united-cloud/shared/firewalls/firewalls-zabbix/firewalls-zabbix.component";
import { ZABBIX_HYPERVISOR_ROUTES } from "src/app/united-cloud/shared/hypervisors/hypervisors-zabbix/hypervisors-zabbix-routing.const";
import { HypervisorsZabbixComponent } from "src/app/united-cloud/shared/hypervisors/hypervisors-zabbix/hypervisors-zabbix.component";
import { ZABBIX_LOADBALANCERS_ROUTES } from "src/app/united-cloud/shared/loadbalancers/loadbalancers-zabbix/loadbalancers-zabbix-routing.const";
import { LoadbalancersZabbixComponent } from "src/app/united-cloud/shared/loadbalancers/loadbalancers-zabbix/loadbalancers-zabbix.component";
import { ZABBIX_MACMINI_ROUTES } from "src/app/united-cloud/shared/mac-mini/macmini-zabbix/macmini-zabbix-routing.const";
import { MacminiZabbixComponent } from "src/app/united-cloud/shared/mac-mini/macmini-zabbix/macmini-zabbix.component";
import { ZABBIX_STORAGE_ROUTES } from "src/app/united-cloud/shared/storage-devices/storage-zabbix/storage-zabbix-routing.const";
import { StorageZabbixComponent } from "src/app/united-cloud/shared/storage-devices/storage-zabbix/storage-zabbix.component";
import { ZABBIX_SWITCH_ROUTES } from "src/app/united-cloud/shared/switches/switches-zabbix/switches-zabbix-routing.const";
import { SwitchesZabbixComponent } from "src/app/united-cloud/shared/switches/switches-zabbix/switches-zabbix.component";
import { ZABBIX_VMS_ROUTES } from "src/app/united-cloud/shared/vms/vms-zabbix/vms-zabbix-routing.const";
import { VmsZabbixComponent } from "src/app/united-cloud/shared/vms/vms-zabbix/vms-zabbix.component";
import { CloudCostOverviewDashboardComponent } from "./cloud-cost-overview-dashboard/cloud-cost-overview-dashboard.component";
import { ResourceLevelDashboardComponent } from "./cloud-cost-overview-dashboard/resource-level-dashboard/resource-level-dashboard.component";
import { OrchestrationOverviewDashboardComponent } from "./orchestration-overview-dashboard/orchestration-overview-dashboard.component";
import { InfrastructureOverviewDashboardComponent } from "./infrastructure-overview-dashboard/infrastructure-overview-dashboard.component";
import { IotDevicesSummaryDashboardComponent } from "./iot-devices-summary-dashboard/iot-devices-summary-dashboard.component";
import { NetworkDevicesOverviewDashboardComponent } from "./network-devices-overview-dashboard/network-devices-overview-dashboard.component";
import { InterfaceDetailsDashboardComponent } from "./interface-details-dashboard/interface-details-dashboard.component";
import { IotDevicesZabbixComponent } from "src/app/united-cloud/shared/iot-devices/iot-devices-zabbix/iot-devices-zabbix.component";
import { ZABBIX_IOT_DEVICE_ROUTES } from "src/app/united-cloud/shared/iot-devices/iot-devices-zabbix/iot-devices-zabbix-routing.const";
import { ApplicationOverviewDashboardComponent } from "./application-overview-dashboard/application-overview-dashboard.component";
import { ExecutiveAiBusinessSummaryComponent } from "./application-overview-dashboard/executive-ai-business-summary/executive-ai-business-summary.component";

export const DEFAULT_DASHBOARD_ROUTES: Routes = [
    {
        path: 'default/cloud-cost',
        component: CloudCostOverviewDashboardComponent,
        data: {
            breadcrumb: {
                title: 'Cloud Cost Overview',
                stepbackCount: 1
            }
        },
    },
    {
        path: 'default/cloud-cost/resource-level',
        component: ResourceLevelDashboardComponent,
        data: {
            breadcrumb: {
                title: 'Resource Level',
                stepbackCount: 1
            }
        },
    },
    {
        path: 'default/infrastructure',
        component: InfrastructureOverviewDashboardComponent,
        data: {
            breadcrumb: {
                title: 'Infrastructure Overview',
                stepbackCount: 1
            }
        },
    },
    {
        path: 'default/infrastructure/switch/:deviceid/zbx',
        component: SwitchesZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Switches',
                stepbackCount: 3
            }
        },
        children: ZABBIX_SWITCH_ROUTES
    },
    {
        path: 'default/infrastructure/firewalls/:deviceid/zbx',
        component: FirewallsZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Firewalls',
                stepbackCount: 3
            }
        },
        children: ZABBIX_FIREWALLS_ROUTES
    },
    {
        path: 'default/infrastructure/load-balancers/:deviceid/zbx',
        component: LoadbalancersZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Load Balancers',
                stepbackCount: 3
            }
        },
        children: ZABBIX_LOADBALANCERS_ROUTES
    },
    {
        path: 'default/infrastructure/hypervisors/:deviceid/zbx',
        component: HypervisorsZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Hypervisors',
                stepbackCount: 3
            }
        },
        children: ZABBIX_HYPERVISOR_ROUTES
    },
    {
        path: 'default/infrastructure/bmservers/:deviceid/zbx',
        component: BmServersZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Bare Metal Servers',
                stepbackCount: 3
            }
        },
        children: ZABBIX_BMS_ROUTES
    },
    {
        path: 'default/infrastructure/macdevices/:deviceid/zbx',
        component: MacminiZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Mac Mini',
                stepbackCount: 3
            }
        },
        children: ZABBIX_MACMINI_ROUTES
    },
    {
        path: 'default/infrastructure/storagedevices/:deviceid/zbx',
        component: StorageZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Storage',
                stepbackCount: 3
            }
        },
        children: ZABBIX_STORAGE_ROUTES
    },
    {
        path: 'default/infrastructure/vms/vmware/:deviceid/zbx',
        component: VmsZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Virtual Machines',
                stepbackCount: 4
            }
        },
        children: ZABBIX_VMS_ROUTES
    },
    {
        path: 'default/infrastructure/vms/esxi/:deviceid/zbx',
        component: VmsZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Virtual Machines',
                stepbackCount: 4
            }
        },
        children: ZABBIX_VMS_ROUTES
    },
    {
        path: 'default/infrastructure/vms/hyperv/:deviceid/zbx',
        component: VmsZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Virtual Machines',
                stepbackCount: 4
            }
        },
        children: ZABBIX_VMS_ROUTES
    },
    {
        path: 'default/infrastructure/vms/custom/:deviceid/zbx',
        component: VmsZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Virtual Machines',
                stepbackCount: 4
            }
        },
        children: ZABBIX_VMS_ROUTES
    },
    {
        path: 'default/infrastructure/network-devices',
        component: NetworkDevicesOverviewDashboardComponent,
        data: {
            breadcrumb: {
                title: 'Network Infrastructure',
                stepbackCount: 0
            }
        },
    },
    {
        path: 'default/infrastructure/network-devices/switch/:deviceid/zbx',
        component: SwitchesZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Switches',
                stepbackCount: 1
            }
        },
        children: ZABBIX_SWITCH_ROUTES
    },
    {
        path: 'default/infrastructure/network-devices/firewalls/:deviceid/zbx',
        component: FirewallsZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Firewalls',
                stepbackCount: 1
            }
        },
        children: ZABBIX_FIREWALLS_ROUTES
    },
    {
        path: 'default/infrastructure/network-devices/load-balancers/:deviceid/zbx',
        component: LoadbalancersZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Load Balancers',
                stepbackCount: 1
            }
        },
        children: ZABBIX_LOADBALANCERS_ROUTES
    },
    {
        path: 'default/infrastructure/network-devices/:deviceType/:deviceid/interface/:interfaceId',
        component: InterfaceDetailsDashboardComponent,
        data: {
            breadcrumb: {
                title: 'Interface Details',
                stepbackCount: 0
            }
        },
    },
    {
        path: 'default/network-devices',
        component: NetworkDevicesOverviewDashboardComponent,
        data: {
            breadcrumb: {
                title: 'Network Overview',
                stepbackCount: 1
            }
        },
    },
    {
        path: 'default/network-devices/switch/:deviceid/zbx',
        component: SwitchesZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Switches',
                stepbackCount: 1
            }
        },
        children: ZABBIX_SWITCH_ROUTES
    },
    {
        path: 'default/network-devices/firewalls/:deviceid/zbx',
        component: FirewallsZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Firewalls',
                stepbackCount: 1
            }
        },
        children: ZABBIX_FIREWALLS_ROUTES
    },
    {
        path: 'default/network-devices/load-balancers/:deviceid/zbx',
        component: LoadbalancersZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Load Balancers',
                stepbackCount: 1
            }
        },
        children: ZABBIX_LOADBALANCERS_ROUTES
    },
    {
        path: 'default/network-devices/:deviceType/:deviceid/interface/:interfaceId',
        component: InterfaceDetailsDashboardComponent,
        data: {
            breadcrumb: {
                title: 'Interface Details',
                stepbackCount: 0
            }
        },
    },
    {
        path: 'default/infrastructure/iot-devices',
        component: IotDevicesSummaryDashboardComponent,
        data: {
            breadcrumb: {
                title: 'IoT Infrastructure',
                stepbackCount: 0
            }
        },
    },
    {
        path: 'default/iot-devices',
        component: IotDevicesSummaryDashboardComponent,
        data: {
            breadcrumb: {
                title: 'IoT Device Overview',
                stepbackCount: 1
            }
        },
    },
    {
        path: 'default/iot-devices/:deviceid/zbx',
        component: IotDevicesZabbixComponent,
        data: {
            breadcrumb: {
                title: 'IoT Device Overview',
                stepbackCount: 2
            }
        },
        children: ZABBIX_IOT_DEVICE_ROUTES
    },
    {
        path: 'default/infrastructure/iot-devices/:deviceid/zbx',
        component: IotDevicesZabbixComponent,
        data: {
            breadcrumb: {
                title: 'IOT Infrastructure',
                stepbackCount: 2
            }
        },
        children: ZABBIX_IOT_DEVICE_ROUTES
    },
    {
        path: 'default/orchestration',
        component: OrchestrationOverviewDashboardComponent,
        data: {
            breadcrumb: {
                title: 'Task and Workflow Overview',
                stepbackCount: 1
            }
        },
    },
    {
        path: 'default/application',
        component: ApplicationOverviewDashboardComponent,
        data: {
            breadcrumb: {
                title: 'Application Dashboard',
                stepbackCount: 1
            }
        },
    },
    {
        path: 'default/application/:appId/executive-ai-business-summary',
        component: ExecutiveAiBusinessSummaryComponent,
        data: {
            breadcrumb: {
                title: 'Executive AI Business Summary',
                stepbackCount: 1
            }
        },
    },

]