import { Routes } from "@angular/router";
import { DatabaseComponent } from "./database/database.component";
import { DevicesComponent } from "./devices/devices.component";
import { MonitoringConfigurationComponent } from "./monitoring-configuration/monitoring-configuration.component";
import { MonitoringDatacenterComponent } from "./monitoring-datacenter/monitoring-datacenter.component";
import { MonitoringComponent } from "./monitoring.component";
import { NetworkComponent } from "./network/network.component";
import { PerformanceComponent } from "./performance/performance.component";
import { StorageComponent } from "./storage/storage.component";
import { SystemComponent } from "./system/system.component";

export const UNITY_VIEW_MONITORING_ROUTES: Routes = [
    {
        path: 'monitoring',
        component: MonitoringComponent,
        data: {
            breadcrumb: {
                title: 'Monitoring'
            }
        },
        children: [
            {
                path: 'noc-view',
                component: DevicesComponent,
                data: {
                    breadcrumb: {
                        title: 'NOC View'
                    }
                }
            },
            {
                path: 'system',
                component: SystemComponent,
                data: {
                    breadcrumb: {
                        title: 'System'
                    }
                }
            },
            {
                path: 'configuration',
                component: MonitoringConfigurationComponent,
                data: {
                    breadcrumb: {
                        title: 'Configuration'
                    }
                }
            },
            {
                path: 'storage',
                component: StorageComponent,
                data: {
                    breadcrumb: {
                        title: 'Storage'
                    }
                }
            },
            {
                path: 'database',
                component: DatabaseComponent,
                data: {
                    breadcrumb: {
                        title: 'Database'
                    }
                }
            },
            {
                path: 'performance',
                component: PerformanceComponent,
                data: {
                    breadcrumb: {
                        title: 'System'
                    }
                }
            },
            {
                path: 'network',
                component: NetworkComponent,
                data: {
                    breadcrumb: {
                        title: 'Network'
                    }
                }
            },
            {
                path: 'datacenter',
                component: MonitoringDatacenterComponent,
                data: {
                    breadcrumb: {
                        title: 'Datacenter'
                    }
                }
            }
        ],
    },
];