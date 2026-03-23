import { Routes } from "@angular/router";
import { ApplicationDiscoveryDetailsComponent } from "../application-discovery-metadata/application-discovery-details/application-discovery-details.component";
import { ApplicationDiscoveryGraphsComponent } from "../application-discovery-metadata/application-discovery-graphs/application-discovery-graphs.component";
import { ApplicationDiscoveryCreateGraphsComponent } from "../application-discovery-metadata/application-discovery-create-graphs/application-discovery-create-graphs.component";
import { ApplicationDiscoveryLogsComponent } from "../application-discovery-metadata/application-discovery-logs/application-discovery-logs.component";
import { ApplicationDiscoveryTracesComponent } from "../application-discovery-metadata/application-discovery-traces/application-discovery-traces.component";
import { ApplicationDiscoveryServicesComponent } from "./application-discovery-services/application-discovery-services.component";
import { ApplicationDiscoveryMetadataComponent } from "../application-discovery-metadata/application-discovery-metadata.component";
import { ApplicationDiscoveryFailuresComponent } from "./application-discovery-failures/application-discovery-failures.component";
import { ApplicationDiscoveryProblemsComponent } from "./application-discovery-problems/application-discovery-problems.component";
import { ApplicationDiscoveryAiHealthAnalysisComponent } from "./application-discovery-ai-health-analysis/application-discovery-ai-health-analysis.component";
import { ApplicationDiscoveryEventsComponent } from "../application-discovery-metadata/application-discovery-events/application-discovery-events.component";

export const APPLICATION_DISCOVERY_METADATA_ROUTES: Routes = [
    {
        path: 'details',
        component: ApplicationDiscoveryDetailsComponent,
        data: {
            breadcrumb: {
                title: 'Details',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'monitoring-graphs',
        component: ApplicationDiscoveryGraphsComponent,
        data: {
            breadcrumb: {
                title: 'Graphs',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'manage-graphs',
        component: ApplicationDiscoveryCreateGraphsComponent,
        data: {
            breadcrumb: {
                title: 'Create Graph',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'application-log',
        component: ApplicationDiscoveryLogsComponent,
        data: {
            breadcrumb: {
                title: 'Application Logs',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'application-traces',
        component: ApplicationDiscoveryTracesComponent,
        data: {
            breadcrumb: {
                title: 'Application Traces',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'application-events',
        component: ApplicationDiscoveryEventsComponent,
        // component: ZabbixEventsComponent,
        data: {
            breadcrumb: {
                title: 'Application Events',
                stepbackCount: 0
            }
        }
    },
]

export const APPLICATION_COMPONENTS_ROUTES: Routes = [
    {
        path: 'services',
        component: ApplicationDiscoveryServicesComponent,
        data: {
            breadcrumb: {
                title: 'Services',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'services/:deviceId',
        component: ApplicationDiscoveryMetadataComponent,
        data: {
            breadcrumb: {
                title: 'Applications',
                stepbackCount: 0
            }
        },
        children: APPLICATION_DISCOVERY_METADATA_ROUTES
    },
    {
        path: 'failures',
        component: ApplicationDiscoveryFailuresComponent,
        data: {
            breadcrumb: {
                title: 'Failures',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'problems',
        component: ApplicationDiscoveryProblemsComponent,
        data: {
            breadcrumb: {
                title: 'Problems',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'ai-health-analysis',
        component: ApplicationDiscoveryAiHealthAnalysisComponent,
        data: {
            breadcrumb: {
                title: 'AI Health Analysis',
                stepbackCount: 0
            }
        }
    }
]