import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ZABBIX_FIREWALLS_ROUTES } from '../shared/firewalls/firewalls-zabbix/firewalls-zabbix-routing.const';
import { FirewallsZabbixComponent } from '../shared/firewalls/firewalls-zabbix/firewalls-zabbix.component';
import { ZABBIX_LOADBALANCERS_ROUTES } from '../shared/loadbalancers/loadbalancers-zabbix/loadbalancers-zabbix-routing.const';
import { LoadbalancersZabbixComponent } from '../shared/loadbalancers/loadbalancers-zabbix/loadbalancers-zabbix.component';
import { ZABBIX_SWITCH_ROUTES } from '../shared/switches/switches-zabbix/switches-zabbix-routing.const';
import { SwitchesZabbixComponent } from '../shared/switches/switches-zabbix/switches-zabbix.component';
import { InfrastructureInterfaceDetailsComponent } from './infrastructure-interface-details/infrastructure-interface-details.component';
import { InfrastructureNetworkDevicesComponent } from './infrastructure-network-devices/infrastructure-network-devices.component';
import { InfrastructureComponent } from './infrastructure.component';
import { HypervisorsZabbixComponent } from '../shared/hypervisors/hypervisors-zabbix/hypervisors-zabbix.component';
import { ZABBIX_HYPERVISOR_ROUTES } from '../shared/hypervisors/hypervisors-zabbix/hypervisors-zabbix-routing.const';
import { StorageZabbixComponent } from '../shared/storage-devices/storage-zabbix/storage-zabbix.component';
import { ZABBIX_STORAGE_ROUTES } from '../shared/storage-devices/storage-zabbix/storage-zabbix-routing.const';
import { MacminiZabbixComponent } from '../shared/mac-mini/macmini-zabbix/macmini-zabbix.component';
import { ZABBIX_MACMINI_ROUTES } from '../shared/mac-mini/macmini-zabbix/macmini-zabbix-routing.const';
import { ZABBIX_BMS_ROUTES } from '../shared/bm-servers/bm-servers-zabbix/bm-servers-zabbix-routing.const';
import { BmServersZabbixComponent } from '../shared/bm-servers/bm-servers-zabbix/bm-servers-zabbix.component';
import { ZABBIX_VMS_ROUTES } from '../shared/vms/vms-zabbix/vms-zabbix-routing.const';
import { VmsZabbixComponent } from '../shared/vms/vms-zabbix/vms-zabbix.component';
import { InfrastructureIotDevicesComponent } from './infrastructure-iot-devices/infrastructure-iot-devices.component';
import { IotDevicesZabbixComponent } from '../shared/iot-devices/iot-devices-zabbix/iot-devices-zabbix.component';
import { ZABBIX_IOT_DEVICE_ROUTES } from '../shared/iot-devices/iot-devices-zabbix/iot-devices-zabbix-routing.const';

const routes: Routes = [
  {
    path: 'infrastructure',
    component: InfrastructureComponent,
    data: {
      breadcrumb: {
        title: 'Infrastructure',
        stepbackCount: 0
      }
    },
  },
  {
    path: 'infrastructure/switch/:deviceid/zbx',
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
    path: 'infrastructure/firewalls/:deviceid/zbx',
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
    path: 'infrastructure/load-balancers/:deviceid/zbx',
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
    path: 'infrastructure/hypervisors/:deviceid/zbx',
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
    path: 'infrastructure/bmservers/:deviceid/zbx',
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
    path: 'infrastructure/macdevices/:deviceid/zbx',
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
    path: 'infrastructure/storagedevices/:deviceid/zbx',
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
    path: 'infrastructure/vms/vmware/:deviceid/zbx',
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
    path: 'infrastructure/vms/esxi/:deviceid/zbx',
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
    path: 'infrastructure/vms/hyperv/:deviceid/zbx',
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
    path: 'infrastructure/vms/custom/:deviceid/zbx',
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
    path: 'infrastructure/network-devices',
    component: InfrastructureNetworkDevicesComponent,
    data: {
      breadcrumb: {
        title: 'Network Infrastructure',
        stepbackCount: 0
      }
    },
  },
  {
    path: 'infrastructure/network-devices/:deviceType/:deviceid/interface/:interfaceId',
    component: InfrastructureInterfaceDetailsComponent,
    data: {
      breadcrumb: {
        title: 'Interface Details',
        stepbackCount: 0
      }
    },
  },
  {
    path: 'infrastructure/network-devices/switch/:deviceid/zbx',
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
    path: 'infrastructure/network-devices/firewalls/:deviceid/zbx',
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
    path: 'infrastructure/network-devices/load-balancers/:deviceid/zbx',
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
    path: 'infrastructure/iot-devices',
    component: InfrastructureIotDevicesComponent,
    data: {
      breadcrumb: {
        title: 'IOT Infrastructure',
        stepbackCount: 0
      }
    },
  },
  {
    path: 'infrastructure/iot-devices/:deviceid/zbx',
    component: IotDevicesZabbixComponent,
    data: {
      breadcrumb: {
        title: 'IOT Infrastructure',
        stepbackCount: 2
      }
    },
    children: ZABBIX_IOT_DEVICE_ROUTES
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InfrastructureRoutingModule { }
