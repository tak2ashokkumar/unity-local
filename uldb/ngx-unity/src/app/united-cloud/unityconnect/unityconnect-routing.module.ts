import { NgModule } from '@angular/core';
import { Routes, RouterModule, UrlSegment } from '@angular/router';
import { UnityConnectComponent } from './unity-connect.component';
import { UnityconnectBandwidthComponent } from './unityconnect-bandwidth/unityconnect-bandwidth.component';
import { UnityconnectVxcComponent } from './unityconnect-vxc/unityconnect-vxc.component';
import { UnityconnectBandwidthGraphComponent } from './unityconnect-bandwidth/unityconnect-bandwidth-graph/unityconnect-bandwidth-graph.component';
import { UnityconnectBandwidthGraphUsageComponent } from './unityconnect-bandwidth/unityconnect-bandwidth-graph/unityconnect-bandwidth-graph-usage/unityconnect-bandwidth-graph-usage.component';
import { GraphDetailsComponent } from '../shared/graph-details/graph-details.component';
import { TicketDetailsComponent } from 'src/app/shared/shared-tckt-mgmt/ticket-details/ticket-details.component';
import { UnityconnectBandwidthBillingComponent } from './unityconnect-bandwidth-billing/unityconnect-bandwidth-billing.component';
import { UnityconnectResolverService } from './unityconnect-resolver.service';
import { UnityconnectNetworkConnectionComponent } from './unityconnect-network-connection/unityconnect-network-connection.component';
import { UnityconnectNetworkBillingComponent } from './unityconnect-network-billing/unityconnect-network-billing.component';
import { GraphPortComponent } from './graph-port/graph-port.component';

export function MyAwesomeBandwidthMatcher(url: UrlSegment[]) {
  if (url.length === 0) {
    return null;
  }
  const reg = /^(bandwidth)$/;
  const param = url[0].toString();
  if (param.match(reg)) {
    return ({ consumed: url });
  }
  return null;
}

const routes: Routes = [
  {
    path: 'connect',
    component: UnityConnectComponent,
    runGuardsAndResolvers: "always",
    resolve: {
      tabItems: UnityconnectResolverService
    },
    data: {
      breadcrumb: {
        title: 'Unity Connect',
        stepbackCount: 0
      }
    },
    children: [
      {
        path: 'bandwidth',
        component: UnityconnectBandwidthComponent,
        data: {
          breadcrumb: {
            title: 'Bandwidth',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'bandwidth/:deviceId/:portId',
        component: UnityconnectBandwidthGraphComponent,
        data: {
          breadcrumb: {
            title: 'Bandwidth',
            stepbackCount: 0
          }
        },
        children: [
          {
            path: 'usage',
            component: UnityconnectBandwidthGraphUsageComponent
          },
          {
            path: 'usage/details',
            component: GraphDetailsComponent
          }
        ]
      },
      {
        path: 'network',
        component: UnityconnectNetworkConnectionComponent,
        data: {
          breadcrumb: {
            title: 'Network',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'network/ports/:portId',
        component: GraphPortComponent,
        data: {
          breadcrumb: {
            title: 'Port Graphs',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'network/:deviceId/:portId',
        component: UnityconnectBandwidthGraphComponent,
        data: {
          breadcrumb: {
            title: 'Network',
            stepbackCount: 0
          }
        },
        children: [
          {
            path: 'usage',
            component: UnityconnectBandwidthGraphUsageComponent
          },
          {
            path: 'usage/details',
            component: GraphDetailsComponent
          },
        ]
      },
      {
        path: 'billinginfo',
        component: UnityconnectBandwidthBillingComponent,
        data: {
          breadcrumb: {
            title: 'Bandwidth Billing',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'billing',
        component: UnityconnectNetworkBillingComponent,
        data: {
          breadcrumb: {
            title: 'Bandwidth Billing',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'vxc',
        component: UnityconnectVxcComponent,
        data: {
          breadcrumb: {
            title: 'Connection',
            stepbackCount: 0
          }
        }
      },
      {
        matcher: MyAwesomeBandwidthMatcher,
        redirectTo: 'bandwidth',
      },
    ]
  },
  {
    path: 'connect',
    data: {
      breadcrumb: {
        title: 'Unity Connect',
        stepbackCount: 0
      }
    },
    children: [
      {
        path: 'vxc/:ticketId',
        data: {
          breadcrumb: {
            title: 'VXC',
            stepbackCount: 1
          }
        },
        children: [
          {
            path: 'details',
            component: TicketDetailsComponent,
            data: {
              breadcrumb: {
                title: 'Details',
                stepbackCount: 0
              }
            }
          }
        ]
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnityconnectRoutingModule { }
