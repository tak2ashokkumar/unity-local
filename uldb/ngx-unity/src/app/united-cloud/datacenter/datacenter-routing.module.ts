import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DevicesRoutes } from 'src/app/united-cloud/shared/shared-route';
import { OBSERVIUM_BMS_ROUTES } from '../shared/bm-servers/bm-servers-observium/bm-servers-obs-routing.const';
import { ZABBIX_BMS_ROUTES } from '../shared/bm-servers/bm-servers-zabbix/bm-servers-zabbix-routing.const';
import { BmServersZabbixComponent } from '../shared/bm-servers/bm-servers-zabbix/bm-servers-zabbix.component';
import { DeviceTabComponent } from '../shared/device-tab/device-tab.component';
import { OBSERVIUM_FIREWALL_ROUTES } from '../shared/firewalls/firewalls-observium/firewalls-obs-routing.const';
import { FirewallsZabbixComponent } from '../shared/firewalls/firewalls-zabbix/firewalls-zabbix.component';
import { OBSERVIUM_HYPERVISOR_ROUTES } from '../shared/hypervisors/hypervisors-observium/hypervisors-obs-routing.const';
import { ZABBIX_HYPERVISOR_ROUTES } from '../shared/hypervisors/hypervisors-zabbix/hypervisors-zabbix-routing.const';
import { HypervisorsZabbixComponent } from '../shared/hypervisors/hypervisors-zabbix/hypervisors-zabbix.component';
import { OBSERVIUM_LOADBALANCER_ROUTES } from '../shared/loadbalancers/loadbalancers-observium/loadbalancers-obs-routing.const';
import { LoadbalancersZabbixComponent } from '../shared/loadbalancers/loadbalancers-zabbix/loadbalancers-zabbix.component';
import { OBSERVIUM_STORAGE_ROUTES } from '../shared/storage-devices/storage-observium/storage-obs-routing.const';
import { ZABBIX_STORAGE_ROUTES } from '../shared/storage-devices/storage-zabbix/storage-zabbix-routing.const';
import { StorageZabbixComponent } from '../shared/storage-devices/storage-zabbix/storage-zabbix.component';
import { OBSERVIUM_SWITCH_ROUTES } from '../shared/switches/switches-observium/switches-obs-routing.const';
import { ZABBIX_SWITCH_ROUTES } from '../shared/switches/switches-zabbix/switches-zabbix-routing.const';
import { SwitchesZabbixComponent } from '../shared/switches/switches-zabbix/switches-zabbix.component';
import { CabinetViewGuard } from './cabinet-view.guard';
import { DatacenterCabinetViewComponent } from './datacenter-cabinet-view/datacenter-cabinet-view.component';
import { DatacenterCabinetsComponent } from './datacenter-cabinets/datacenter-cabinets.component';
import { OBSERVIUM_PDU_ROUTES } from './datacenter-pdus/datacenter-pdus-observium/datacenter-pdus-obs-routing.const';
import { DC_PDU_ROUTES } from './datacenter-pdus/datacenter-pdus-routing.const';
import { DatacenterPdusZabbixComponent } from './datacenter-pdus/datacenter-pdus-zabbix/datacenter-pdus-zabbix.component';
import { ZABBIX_DC_PDU_ROUTES } from './datacenter-pdus/datacenter-pdus-zabbix/zabbix-dc-pdu-routing.const';
import { DatacenterPrivateCloudResolverService } from './datacenter-private-clouds/datacenter-private-cloud-resolver.service';
import { DatacenterPrivateCloudsComponent } from './datacenter-private-clouds/datacenter-private-clouds.component';
import { DatacenterResolverService } from './datacenter-resolver.service';
import { DatacenterComponent } from './datacenter.component';
import { ZABBIX_FIREWALLS_ROUTES } from '../shared/firewalls/firewalls-zabbix/firewalls-zabbix-routing.const';
import { ZABBIX_LOADBALANCERS_ROUTES } from '../shared/loadbalancers/loadbalancers-zabbix/loadbalancers-zabbix-routing.const';


const routes: Routes = [
  {
    path: 'datacenter',
    component: DatacenterComponent,
    resolve: {
      tabItems: DatacenterResolverService
    },
    data: {
      breadcrumb: {
        title: 'Datacenter'
      }
    }
  },
  {
    path: 'datacenter/:dcId',
    component: DatacenterComponent,
    resolve: {
      tabItems: DatacenterResolverService
    },
    data: {
      breadcrumb: {
        title: 'Datacenter'
      }
    },
    children: [
      {
        path: 'cabinets',
        component: DatacenterCabinetsComponent,
        data: {
          breadcrumb: {
            title: 'Cabinets'
          }
        }
      },
      ...DC_PDU_ROUTES,
      {
        path: 'pccloud',
        component: DatacenterPrivateCloudsComponent,
        data: {
          breadcrumb: {
            title: 'Private Cloud',
            stepbackCount: 0
          }
        },
        resolve: {
          tabItems: DatacenterPrivateCloudResolverService
        }
      },
      {
        path: 'pccloud/:pcId',
        component: DatacenterPrivateCloudsComponent,
        data: {
          breadcrumb: {
            title: 'Private Cloud',
            stepbackCount: 1
          }
        },
        resolve: {
          tabItems: DatacenterPrivateCloudResolverService
        },
        children: DevicesRoutes
      }
    ]
  },
  {
    path: 'datacenter/:dcId/cabinets/:cabinetId/view',
    component: DatacenterCabinetViewComponent,
    runGuardsAndResolvers: "always",
    resolve: { cabinetData: CabinetViewGuard },
    data: {
      breadcrumb: {
        title: 'Cabinet View',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'datacenter/:dcId/cabinets/:cabinetId/view/switch/:deviceid/obs',
    component: DeviceTabComponent,
    data: {
      breadcrumb: {
        title: 'Switches',
        stepbackCount: 1
      }
    },
    children: OBSERVIUM_SWITCH_ROUTES
  },
  {
    path: 'datacenter/:dcId/cabinets/:cabinetId/view/switch/:deviceid/zbx',
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
    path: 'datacenter/:dcId/cabinets/:cabinetId/view/firewall/:deviceid/obs',
    component: DeviceTabComponent,
    data: {
      breadcrumb: {
        title: 'Firewalls',
        stepbackCount: 1
      }
    },
    children: OBSERVIUM_FIREWALL_ROUTES
  },
  {
    path: 'datacenter/:dcId/cabinets/:cabinetId/view/firewall/:deviceid/zbx',
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
    path: 'datacenter/:dcId/cabinets/:cabinetId/view/loadbalancer/:deviceid/obs',
    component: DeviceTabComponent,
    data: {
      breadcrumb: {
        title: 'Load Balancers',
        stepbackCount: 1
      }
    },
    children: OBSERVIUM_LOADBALANCER_ROUTES
  },
  {
    path: 'datacenter/:dcId/cabinets/:cabinetId/view/loadbalancer/:deviceid/zbx',
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
    path: 'datacenter/:dcId/cabinets/:cabinetId/view/hypervisor/:deviceid/obs',
    component: DeviceTabComponent,
    data: {
      breadcrumb: {
        title: 'Hypervisors',
        stepbackCount: 1
      }
    },
    children: OBSERVIUM_HYPERVISOR_ROUTES
  },
  {
    path: 'datacenter/:dcId/cabinets/:cabinetId/view/hypervisor/:deviceid/zbx',
    component: HypervisorsZabbixComponent,
    data: {
      breadcrumb: {
        title: 'Hypervisors',
        stepbackCount: 1
      }
    },
    children: ZABBIX_HYPERVISOR_ROUTES
  },
  {
    path: 'datacenter/:dcId/cabinets/:cabinetId/view/bmserver/:deviceid/obs',
    component: DeviceTabComponent,
    data: {
      breadcrumb: {
        title: 'Bare Metal Servers',
        stepbackCount: 1
      }
    },
    children: OBSERVIUM_BMS_ROUTES
  },
  {
    path: 'datacenter/:dcId/cabinets/:cabinetId/view/bmserver/:deviceid/zbx',
    component: BmServersZabbixComponent,
    data: {
      breadcrumb: {
        title: 'Bare Metal Servers',
        stepbackCount: 1
      }
    },
    children: ZABBIX_BMS_ROUTES
  },
  {
    path: 'datacenter/:dcId/cabinets/:cabinetId/view/storage/:deviceid/obs',
    component: DeviceTabComponent,
    data: {
      breadcrumb: {
        title: 'Storage Devices',
        stepbackCount: 1
      }
    },
    children: OBSERVIUM_STORAGE_ROUTES
  },
  {
    path: 'datacenter/:dcId/cabinets/:cabinetId/view/storage/:deviceid/zbx',
    component: StorageZabbixComponent,
    data: {
      breadcrumb: {
        title: 'Storage Devices',
        stepbackCount: 1
      }
    },
    children: ZABBIX_STORAGE_ROUTES
  },
  {
    path: 'datacenter/:dcId/cabinets/:cabinetId/view/pdu/:deviceid/obs',
    component: DeviceTabComponent,
    data: {
      breadcrumb: {
        title: 'PDUs',
        stepbackCount: 1
      }
    },
    children: OBSERVIUM_PDU_ROUTES
  },
  {
    path: 'datacenter/:dcId/cabinets/:cabinetId/view/pdu/:deviceid/zbx',
    component: DatacenterPdusZabbixComponent,
    data: {
      breadcrumb: {
        title: 'PDUs',
        stepbackCount: 1
      }
    },
    children: ZABBIX_DC_PDU_ROUTES
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatacenterRoutingModule { }
