import { Routes } from '@angular/router';
import { AdvancedDeviceDiscoveryComponent } from './advanced-device-discovery.component';
import { AdvancedDiscoveryCabinetsComponent } from './advanced-discovery-cabinets/advanced-discovery-cabinets.component';
import { AdvancedDiscoveryConnectivityComponent } from '../advanced-discovery-connectivity/advanced-discovery-connectivity.component';
import { AdvancedDiscoveryDatacenterComponent } from './advanced-discovery-datacenter/advanced-discovery-datacenter.component';
import { AdvancedDiscoveryFirewallsComponent } from './advanced-discovery-firewalls/advanced-discovery-firewalls.component';
import { AdvancedDiscoveryHypervisorsComponent } from './advanced-discovery-hypervisors/advanced-discovery-hypervisors.component';
import { AdvancedDiscoveryLoadbalancersComponent } from './advanced-discovery-loadbalancers/advanced-discovery-loadbalancers.component';
import { AdvancedDiscoveryMacdevicesComponent } from './advanced-discovery-macdevices/advanced-discovery-macdevices.component';
import { AdvancedDiscoveryNetworkScanComponent } from './advanced-discovery-network-scan/advanced-discovery-network-scan.component';
import { AdvancedDiscoveryNetworkTopologyComponent } from './advanced-discovery-network-topology/advanced-discovery-network-topology.component';
import { AdvancedDiscoveryPdusComponent } from './advanced-discovery-pdus/advanced-discovery-pdus.component';
import { AdvancedDiscoveryScanOpComponent } from './advanced-discovery-scan-op/advanced-discovery-scan-op.component';
import { AdvancedDiscoveryServersComponent } from './advanced-discovery-servers/advanced-discovery-servers.component';
import { AdvancedDiscoveryStorageComponent } from './advanced-discovery-storage/advanced-discovery-storage.component';
import { AdvancedDiscoverySummaryNetworkViewComponent } from './advanced-discovery-summary/advanced-discovery-summary-network-view/advanced-discovery-summary-network-view.component';
import { AdvancedDiscoverySummaryViewComponent } from './advanced-discovery-summary/advanced-discovery-summary-view/advanced-discovery-summary-view.component';
import { AdvancedDiscoverySummaryComponent } from './advanced-discovery-summary/advanced-discovery-summary.component';
import { AdvancedDiscoverySwitchesComponent } from './advanced-discovery-switches/advanced-discovery-switches.component';

export const ADVANCE_DICOVERY_ON_BOARDING_ROUTES: Routes = [
  {
    path: 'advanced-discovery',
    component: AdvancedDeviceDiscoveryComponent,
    data: {
      breadcrumb: {
        title: 'Advanced Discovery'
      }
    },
    children: [
      {
        path: 'connectivity',
        component: AdvancedDiscoveryConnectivityComponent,
        data: {
          breadcrumb: {
            title: 'Connectivity'
          }
        }
      },
      // {
      //   path: 'credentials',
      //   component: AdvancedDiscoveryCredentialsComponent,
      //   data: {
      //     breadcrumb: {
      //       title: 'Credentails'
      //     }
      //   }
      // },
      {
        path: 'nwscan',
        component: AdvancedDiscoveryNetworkScanComponent,
        data: {
          breadcrumb: {
            title: 'Network Scan'
          }
        }
      },
      {
        path: 'nwscan/:discoveryId',
        data: {
          breadcrumb: {
            title: 'Discovery',
            stepbackCount: 1
          }
        },
        children: [
          {
            path: 'network',
            component: AdvancedDiscoveryNetworkTopologyComponent,
            data: {
              breadcrumb: {
                title: 'Network Topology',
                stepbackCount: 0
              }
            }
          }
        ]
      },
      {
        path: 'scanop',
        component: AdvancedDiscoveryScanOpComponent,
        data: {
          breadcrumb: {
            title: 'Scan O/P'
          }
        }
      },
      {
        path: 'datacenters',
        component: AdvancedDiscoveryDatacenterComponent,
        data: {
          breadcrumb: {
            title: 'Data Center'
          }
        }
      },
      {
        path: 'cabinets',
        component: AdvancedDiscoveryCabinetsComponent,
        data: {
          breadcrumb: {
            title: 'Cabinet'
          }
        }
      },
      {
        path: 'pdus',
        component: AdvancedDiscoveryPdusComponent,
        data: {
          breadcrumb: {
            title: 'Cabinet'
          }
        }
      },
      {
        path: 'switches',
        component: AdvancedDiscoverySwitchesComponent,
        data: {
          breadcrumb: {
            title: 'Switches'
          }
        }
      },
      {
        path: 'firewalls',
        component: AdvancedDiscoveryFirewallsComponent,
        data: {
          breadcrumb: {
            title: 'Firewalls'
          }
        }
      },
      {
        path: 'loadbalancers',
        component: AdvancedDiscoveryLoadbalancersComponent,
        data: {
          breadcrumb: {
            title: 'Loadbalancers'
          }
        }
      },
      {
        path: 'servers',
        component: AdvancedDiscoveryServersComponent,
        data: {
          breadcrumb: {
            title: 'Servers'
          }
        }
      },
      {
        path: 'hypervisors',
        component: AdvancedDiscoveryHypervisorsComponent,
        data: {
          breadcrumb: {
            title: 'Hypervisors'
          }
        }
      },
      {
        path: 'macdevices',
        component: AdvancedDiscoveryMacdevicesComponent,
        data: {
          breadcrumb: {
            title: 'Mac Mini'
          }
        }
      },
      {
        path: 'storage',
        component: AdvancedDiscoveryStorageComponent,
        data: {
          breadcrumb: {
            title: 'Storage'
          }
        }
      },
      {
        path: 'summary',
        component: AdvancedDiscoverySummaryComponent,
        data: {
          breadcrumb: {
            title: 'Summary'
          }
        },
        children: [
          {
            path: 'view',
            component: AdvancedDiscoverySummaryViewComponent,
            data: {
              breadcrumb: {
                title: 'View',
                stepbackCount: 0
              }
            }
          },
          {
            path: 'network',
            component: AdvancedDiscoveryNetworkTopologyComponent,
            data: {
              breadcrumb: {
                title: 'Network Topology',
                stepbackCount: 0
              }
            }
          },
        ]
      },
    ]
  },
];
