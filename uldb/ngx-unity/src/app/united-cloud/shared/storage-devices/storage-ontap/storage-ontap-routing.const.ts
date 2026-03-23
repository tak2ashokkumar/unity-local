import { Routes } from "@angular/router";
import { StorageOntapClusterPeersComponent } from "./storage-ontap-cluster-peers/storage-ontap-cluster-peers.component";
import { StorageOntapDisksComponent } from "./storage-ontap-disks/storage-ontap-disks.component";
import { StorageOntapEventsComponent } from "./storage-ontap-events/storage-ontap-events.component";
import { StorageOntapLunDetailsComponent } from "./storage-ontap-lun-details/storage-ontap-lun-details.component";
import { StorageOntapShelvesComponent } from "./storage-ontap-shelves/storage-ontap-shelves.component";
import { StorageOntapSnapMirrorsComponent } from "./storage-ontap-snap-mirrors/storage-ontap-snap-mirrors.component";
import { StorageOntapStatisticsComponent } from "./storage-ontap-statistics/storage-ontap-statistics.component";
import { StorageOntapTriggersComponent } from "./storage-ontap-triggers/storage-ontap-triggers.component";
import { StorageOntapComponent } from "./storage-ontap.component";
import { StorageOntapSummaryComponent } from "./storage-ontap-summary/storage-ontap-summary.component";
import { StorageOntapNodesComponent } from "./storage-ontap-nodes/storage-ontap-nodes.component";
import { StorageOntapDetailsComponent } from "./storage-ontap-details/storage-ontap-details.component";
import { StorageOntapDetailsTabComponent } from "./storage-ontap-details-tab/storage-ontap-details-tab.component";
import { StorageOntapNodeDetailsComponent } from "./storage-ontap-node-details/storage-ontap-node-details.component";
import { StorageOntapEthernetPortsComponent } from "./storage-ontap-ethernet-ports/storage-ontap-ethernet-ports.component";
import { StorageOntapFcPortsComponent } from "./storage-ontap-fc-ports/storage-ontap-fc-ports.component";
import { StorageOntapAggregatesComponent } from "./storage-ontap-aggregates/storage-ontap-aggregates.component";
import { StorageOntapAggregateDetailsComponent } from "./storage-ontap-aggregate-details/storage-ontap-aggregate-details.component";
import { StorageOntapSvmsComponent } from "./storage-ontap-svms/storage-ontap-svms.component";
import { StorageOntapSvmDetailsComponent } from "./storage-ontap-svm-details/storage-ontap-svm-details.component";
import { StorageOntapVolumesComponent } from "./storage-ontap-volumes/storage-ontap-volumes.component";
import { StorageOntapVolumeDetailsComponent } from "./storage-ontap-volume-details/storage-ontap-volume-details.component";
import { StorageOntapLunsComponent } from "./storage-ontap-luns/storage-ontap-luns.component";

export const ONTAP_ROUTES: Routes = [
    {
        path: 'storagedevices/:deviceid/ontap',
        component: StorageOntapComponent,
        data: {
            breadcrumb: {
                title: 'Storage',
                stepbackCount: 2
            }
        },
        children: [
            {
                path: 'summary',
                component: StorageOntapSummaryComponent,
                data: {
                    breadcrumb: {
                        title: 'Summary',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'nodes',
                component: StorageOntapNodesComponent,
                data: {
                    breadcrumb: {
                        title: 'Nodes',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'nodes/details',
                component: StorageOntapDetailsComponent,
                data: {
                    breadcrumb: {
                        title: 'Nodes',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'nodes/:id',
                component: StorageOntapDetailsTabComponent,
                data: {
                    breadcrumb: {
                        title: 'Nodes',
                        stepbackCount: 0
                    }
                },
                children: [
                    {
                        path: 'overview',
                        component: StorageOntapNodeDetailsComponent,
                        data: {
                            breadcrumb: {
                                title: 'Overview',
                                stepbackCount: 0
                            }
                        },
                    },
                    {
                        path: 'events',
                        component: StorageOntapEventsComponent,
                        data: {
                            breadcrumb: {
                                title: 'Events',
                                stepbackCount: 0
                            }
                        },
                    },
                    {
                        path: 'triggers',
                        component: StorageOntapTriggersComponent,
                        data: {
                            breadcrumb: {
                                title: 'Triggers',
                                stepbackCount: 0
                            }
                        },
                    },
                    {
                        path: 'statistics',
                        component: StorageOntapStatisticsComponent,
                        data: {
                            breadcrumb: {
                                title: 'Statistics',
                                stepbackCount: 0
                            }
                        },
                    },
                    {
                        path: 'ethernet-ports',
                        component: StorageOntapEthernetPortsComponent,
                        data: {
                            breadcrumb: {
                                title: 'Ethernet Ports',
                                stepbackCount: 0
                            }
                        }
                    },
                    {
                        path: 'fc-ports',
                        component: StorageOntapFcPortsComponent,
                        data: {
                            breadcrumb: {
                                title: 'FC Ports',
                                stepbackCount: 0
                            }
                        }
                    },
                ]
            },
            {
                path: 'aggregates',
                component: StorageOntapAggregatesComponent,
                data: {
                    breadcrumb: {
                        title: 'Aggregates',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'aggregates/details',
                component: StorageOntapDetailsComponent,
                data: {
                    breadcrumb: {
                        title: 'Nodes',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'aggregates/:id',
                component: StorageOntapDetailsTabComponent,
                data: {
                    breadcrumb: {
                        title: 'Aggregates',
                        stepbackCount: 0
                    }
                },
                children: [
                    {
                        path: 'overview',
                        component: StorageOntapAggregateDetailsComponent,
                        data: {
                            breadcrumb: {
                                title: 'Overview',
                                stepbackCount: 0
                            }
                        },
                    },
                    {
                        path: 'events',
                        component: StorageOntapEventsComponent,
                        data: {
                            breadcrumb: {
                                title: 'Events',
                                stepbackCount: 0
                            }
                        },
                    },
                    {
                        path: 'triggers',
                        component: StorageOntapTriggersComponent,
                        data: {
                            breadcrumb: {
                                title: 'Triggers',
                                stepbackCount: 0
                            }
                        },
                    },
                    {
                        path: 'statistics',
                        component: StorageOntapStatisticsComponent,
                        data: {
                            breadcrumb: {
                                title: 'Statistics',
                                stepbackCount: 0
                            }
                        },
                    }
                ]
            },
            {
                path: 'svms',
                component: StorageOntapSvmsComponent,
                data: {
                    breadcrumb: {
                        title: 'SVMs',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'svms/details',
                component: StorageOntapDetailsComponent,
                data: {
                    breadcrumb: {
                        title: 'Nodes',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'svms/:id',
                component: StorageOntapDetailsTabComponent,
                data: {
                    breadcrumb: {
                        title: 'Nodes',
                        stepbackCount: 0
                    }
                },
                children: [
                    {
                        path: 'overview',
                        component: StorageOntapSvmDetailsComponent,
                        data: {
                            breadcrumb: {
                                title: 'Overview',
                                stepbackCount: 0
                            }
                        },
                    },
                    {
                        path: 'events',
                        component: StorageOntapEventsComponent,
                        data: {
                            breadcrumb: {
                                title: 'Events',
                                stepbackCount: 0
                            }
                        },
                    },
                    {
                        path: 'triggers',
                        component: StorageOntapTriggersComponent,
                        data: {
                            breadcrumb: {
                                title: 'Triggers',
                                stepbackCount: 0
                            }
                        },
                    },
                    {
                        path: 'statistics',
                        component: StorageOntapStatisticsComponent,
                        data: {
                            breadcrumb: {
                                title: 'Statistics',
                                stepbackCount: 0
                            }
                        },
                    }
                ]
            },
            {
                path: 'volumes',
                component: StorageOntapVolumesComponent,
                data: {
                    breadcrumb: {
                        title: 'Volumes',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'volumes/details',
                component: StorageOntapDetailsComponent,
                data: {
                    breadcrumb: {
                        title: 'Nodes',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'volumes/:id',
                component: StorageOntapDetailsTabComponent,
                data: {
                    breadcrumb: {
                        title: 'Nodes',
                        stepbackCount: 0
                    }
                },
                children: [
                    {
                        path: 'overview',
                        component: StorageOntapVolumeDetailsComponent,
                        data: {
                            breadcrumb: {
                                title: 'Overview',
                                stepbackCount: 0
                            }
                        },
                    },
                    {
                        path: 'events',
                        component: StorageOntapEventsComponent,
                        data: {
                            breadcrumb: {
                                title: 'Events',
                                stepbackCount: 0
                            }
                        },
                    },
                    {
                        path: 'triggers',
                        component: StorageOntapTriggersComponent,
                        data: {
                            breadcrumb: {
                                title: 'Triggers',
                                stepbackCount: 0
                            }
                        },
                    },
                    {
                        path: 'statistics',
                        component: StorageOntapStatisticsComponent,
                        data: {
                            breadcrumb: {
                                title: 'Statistics',
                                stepbackCount: 0
                            }
                        },
                    }
                ]
            },
            {
                path: 'luns',
                component: StorageOntapLunsComponent,
                data: {
                    breadcrumb: {
                        title: 'LUNs',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'luns/details',
                component: StorageOntapDetailsComponent,
                data: {
                    breadcrumb: {
                        title: 'Nodes',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'luns/:id',
                component: StorageOntapDetailsTabComponent,
                data: {
                    breadcrumb: {
                        title: 'Nodes',
                        stepbackCount: 0
                    }
                },
                children: [
                    {
                        path: 'overview',
                        component: StorageOntapLunDetailsComponent,
                        data: {
                            breadcrumb: {
                                title: 'Overview',
                                stepbackCount: 0
                            }
                        },
                    },
                    {
                        path: 'events',
                        component: StorageOntapEventsComponent,
                        data: {
                            breadcrumb: {
                                title: 'Events',
                                stepbackCount: 0
                            }
                        },
                    },
                    {
                        path: 'triggers',
                        component: StorageOntapTriggersComponent,
                        data: {
                            breadcrumb: {
                                title: 'Triggers',
                                stepbackCount: 0
                            }
                        },
                    },
                    {
                        path: 'statistics',
                        component: StorageOntapStatisticsComponent,
                        data: {
                            breadcrumb: {
                                title: 'Statistics',
                                stepbackCount: 0
                            }
                        },
                    }
                ]
            },
            {
                path: 'disks',
                component: StorageOntapDisksComponent,
                data: {
                    breadcrumb: {
                        title: 'Disks',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'disks/broken',
                component: StorageOntapDisksComponent,
                data: {
                    breadcrumb: {
                        title: 'Broken',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'shelves',
                component: StorageOntapShelvesComponent,
                data: {
                    breadcrumb: {
                        title: 'Shelves',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'cluster-peers',
                component: StorageOntapClusterPeersComponent,
                data: {
                    breadcrumb: {
                        title: 'Cluster Peers',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'snap-mirrors',
                component: StorageOntapSnapMirrorsComponent,
                data: {
                    breadcrumb: {
                        title: 'Snap Mirrors',
                        stepbackCount: 0
                    }
                }
            },
        ]
    },
]