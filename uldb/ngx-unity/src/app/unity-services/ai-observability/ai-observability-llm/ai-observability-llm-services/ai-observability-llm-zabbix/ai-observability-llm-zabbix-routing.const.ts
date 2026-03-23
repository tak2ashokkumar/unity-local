import { Routes } from "@angular/router";
import { AiObservabilityLlmDetailsComponent } from "./ai-observability-llm-details/ai-observability-llm-details.component";
import { AiObservabilityLlmTracesComponent } from "./ai-observability-llm-traces/ai-observability-llm-traces.component";



export const LLM_ZABBIX_ROUTES: Routes = [
    {
        path: 'details',
        component: AiObservabilityLlmDetailsComponent,
        data: {
            breadcrumb: {
                title: 'Details',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'traces',
        component: AiObservabilityLlmTracesComponent,
        data: {
            breadcrumb: {
                title: 'Traces',
                stepbackCount: 0
            }
        }
    },
];