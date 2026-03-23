import { Routes } from '@angular/router';
import { DeviceDiscoveryCabinetsComponent } from './device-discovery-cabinets/device-discovery-cabinets.component';
import { DeviceDiscoveryConnectivityComponent } from './device-discovery-connectivity/device-discovery-connectivity.component';
import { DeviceDiscoveryDataCenterComponent } from './device-discovery-data-center/device-discovery-data-center.component';
import { DeviceDiscoveryFirewallsComponent } from './device-discovery-firewalls/device-discovery-firewalls.component';
import { DeviceDiscoveryHypervisorComponent } from './device-discovery-hypervisor/device-discovery-hypervisor.component';
import { DeviceDiscoveryLoadbalancersComponent } from './device-discovery-loadbalancers/device-discovery-loadbalancers.component';
import { DeviceDiscoveryMacComponent } from './device-discovery-mac/device-discovery-mac.component';
import { DeviceDiscoveryNetworkScanComponent } from './device-discovery-network-scan/device-discovery-network-scan.component';
import { DeviceDiscoveryPdusComponent } from './device-discovery-pdus/device-discovery-pdus.component';
import { DeviceDiscoveryScanOpComponent } from './device-discovery-scan-op/device-discovery-scan-op.component';
import { DeviceDiscoveryServersComponent } from './device-discovery-servers/device-discovery-servers.component';
import { DeviceDiscoveryStorageComponent } from './device-discovery-storage/device-discovery-storage.component';
import { DeviceDiscoverySummaryComponent } from './device-discovery-summary/device-discovery-summary.component';
import { DeviceDiscoverySwitchesComponent } from './device-discovery-switches/device-discovery-switches.component';
import { UnitySetupDeviceDiscoveryComponent } from './unity-setup-device-discovery.component';

export const DEVICE_DISCOVERY_ON_BOARDING_ROUTES: Routes = [
  {
    path: 'discovery',
    component: UnitySetupDeviceDiscoveryComponent,
    data: {
      breadcrumb: {
        title: 'Discovery'
      }
    },
    children: [
      {
        path: 'connectivity',
        component: DeviceDiscoveryConnectivityComponent,
        data: {
          breadcrumb: {
            title: 'Connectivity'
          }
        }
      },
      {
        path: 'nwscan',
        component: DeviceDiscoveryNetworkScanComponent,
        data: {
          breadcrumb: {
            title: 'Network Scan'
          }
        }
      },
      {
        path: 'scanop',
        component: DeviceDiscoveryScanOpComponent,
        data: {
          breadcrumb: {
            title: 'Scan O/P'
          }
        }
      },
      {
        path: 'datacenters',
        component: DeviceDiscoveryDataCenterComponent,
        data: {
          breadcrumb: {
            title: 'Data Center'
          }
        }
      },
      {
        path: 'cabinets',
        component: DeviceDiscoveryCabinetsComponent,
        data: {
          breadcrumb: {
            title: 'Cabinet'
          }
        }
      },
      {
        path: 'pdus',
        component: DeviceDiscoveryPdusComponent,
        data: {
          breadcrumb: {
            title: 'Cabinet'
          }
        }
      },
      {
        path: 'switches',
        component: DeviceDiscoverySwitchesComponent,
        data: {
          breadcrumb: {
            title: 'Switches'
          }
        }
      },
      {
        path: 'firewalls',
        component: DeviceDiscoveryFirewallsComponent,
        data: {
          breadcrumb: {
            title: 'Firewalls'
          }
        }
      },
      {
        path: 'loadbalancers',
        component: DeviceDiscoveryLoadbalancersComponent,
        data: {
          breadcrumb: {
            title: 'Loadbalancers'
          }
        }
      },
      {
        path: 'servers',
        component: DeviceDiscoveryServersComponent,
        data: {
          breadcrumb: {
            title: 'Servers'
          }
        }
      },
      {
        path: 'hypervisors',
        component: DeviceDiscoveryHypervisorComponent,
        data: {
          breadcrumb: {
            title: 'Hypervisors'
          }
        }
      },
      {
        path: 'mac',
        component: DeviceDiscoveryMacComponent,
        data: {
          breadcrumb: {
            title: 'Mac Mini'
          }
        }
      },
      {
        path: 'storage',
        component: DeviceDiscoveryStorageComponent,
        data: {
          breadcrumb: {
            title: 'Storage'
          }
        }
      },
      {
        path: 'summary',
        component: DeviceDiscoverySummaryComponent,
        data: {
          breadcrumb: {
            title: 'Summary'
          }
        }
      }
    ]
  }
];
