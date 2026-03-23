import { Routes } from "@angular/router";
import { AiObservabilityVectorDbServiceDetailsComponent } from "./ai-observability-vector-db-service-details/ai-observability-vector-db-service-details.component";
import { AiObservabilityVectorDbServiceTracesComponent } from "./ai-observability-vector-db-service-traces/ai-observability-vector-db-service-traces.component";



export const VECTORDB_SERVICE_ZABBIX_ROUTES: Routes = [
    {
        path: 'details',
        component: AiObservabilityVectorDbServiceDetailsComponent,
        data: {
            breadcrumb: {
                title: 'Details',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'traces',
        component: AiObservabilityVectorDbServiceTracesComponent,
        data: {
            breadcrumb: {
                title: 'Traces',
                stepbackCount: 0
            }
        }
    },
];