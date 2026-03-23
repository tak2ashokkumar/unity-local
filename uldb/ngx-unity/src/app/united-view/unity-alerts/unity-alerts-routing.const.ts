import { Routes } from "@angular/router";
import { UnityAlertsComponent } from "./unity-alerts.component";
import { UnityAlertsResolverService } from "./unity-alerts-resolver.service";
import { DeviceAlertsComponent } from "./device-alerts/device-alerts.component";
import { AllAlertsComponent } from "./all-alerts/all-alerts.component";
import { UnityAlertsViewComponent } from "./unity-alerts-view/unity-alerts-view.component";
import { UnityAlertsHistoryComponent } from "./unity-alerts-history/unity-alerts-history.component";
import { UnityAlertGraphsComponent } from "./unity-alerts-graph/unity-alerts-graph.component";

export const UNITY_ALERTS_ROUTES: Routes = [
    {
        path: 'alerts',
        component: UnityAlertsComponent,
        runGuardsAndResolvers: "always",
        resolve: {
            tabItems: UnityAlertsResolverService
        },
        data: {
            breadcrumb: {
                title: 'Alerts'
            }
        },
        children: [
            {
                path: 'switches',
                component: DeviceAlertsComponent,
                data: {
                    breadcrumb: {
                        title: 'Switch'
                    }
                }
            },
            {
                path: 'firewalls',
                component: DeviceAlertsComponent,
                data: {
                    breadcrumb: {
                        title: 'Firewall'
                    }
                }
            },
            {
                path: 'loadbalancers',
                component: DeviceAlertsComponent,
                data: {
                    breadcrumb: {
                        title: 'Loadbalancer'
                    }
                }
            },
            {
                path: 'hypervisors',
                component: DeviceAlertsComponent,
                data: {
                    breadcrumb: {
                        title: 'Hypervisor'
                    }
                }
            },
            {
                path: 'baremetalservers',
                component: DeviceAlertsComponent,
                data: {
                    breadcrumb: {
                        title: 'Bare Metal'
                    }
                }
            },
            {
                path: 'pdus',
                component: DeviceAlertsComponent,
                data: {
                    breadcrumb: {
                        title: 'PDU'
                    }
                }
            },
            {
                path: 'vms',
                component: DeviceAlertsComponent,
                data: {
                    breadcrumb: {
                        title: 'VM'
                    }
                }
            },
            {
                path: 'storage',
                component: DeviceAlertsComponent,
                data: {
                    breadcrumb: {
                        title: 'Storage'
                    }
                }
            },
            {
                path: 'macdevices',
                component: DeviceAlertsComponent,
                data: {
                    breadcrumb: {
                        title: 'Mac Minis'
                    }
                }
            },
            {
                path: 'all',
                component: AllAlertsComponent,
                data: {
                    breadcrumb: {
                        title: 'All'
                    }
                }
            },
            {
                path: 'allalerts',
                component: UnityAlertsViewComponent,
                data: {
                    breadcrumb: {
                        title: 'All'
                    }
                }
            },
            {
                path: 'history',
                component: UnityAlertsHistoryComponent,
                data: {
                    breadcrumb: {
                        title: 'History'
                    }
                }
            },
            {
                path: 'graphs',
                component: UnityAlertGraphsComponent,
                data: {
                    breadcrumb: {
                        title: 'Graphs'
                    }
                }
            }
        ]
    },
];